'use server'

import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, TabStopType } from 'docx'
import { isAdminOrSecretary } from '@/lib/auth/roles'
import { contractGenerationSchema, pagareGenerationSchema, type ContractGenerationInput } from '@/lib/validations/contract'
import { parseInput } from '@/lib/validations/parse'
import { construirContrato, validarMontosContrato, type ContratoInput } from '@/lib/contracts/plantillas'
import { construirPagares, type PagareInput } from '@/lib/contracts/pagare-plantilla'
import { createParesContractWithCuotas } from '@/lib/actions/pares'
import { logAudit } from '@/lib/audit'
import type { ActionResult } from '@/types'

function aContratoInput(data: ContractGenerationInput): ContratoInput {
  return {
    ciudad: data.ciudad,
    fecha: data.fecha,
    vendedor: data.vendedor,
    comprador: data.comprador,
    vehiculo: data.vehiculo,
    moneda: data.moneda,
    precioTotal: data.precioTotal,
    esPermuta: data.esPermuta,
    permutaDescripcion: data.permutaDescripcion,
    permutaValor: data.permutaValor,
    entradaEfectivo: data.entradaEfectivo,
    financiado: data.financiado,
    cuotas: data.cuotas.map(c => ({ tipo: c.tipo, monto: c.monto, fecha: c.fecha })),
  }
}

/** Arma el .docx a partir de los párrafos ya redactados (ver lib/contracts/plantillas.ts). */
async function construirDocxBuffer(data: ContratoInput, filename: string): Promise<Buffer> {
  const parrafos = construirContrato(data)

  const children = parrafos.map((p, i) => {
    if (i === 0) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
        children: [new TextRun({ text: p.texto, bold: true })],
      })
    }
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 240, line: 360 },
      children: p.titulo
        ? [new TextRun({ text: `${p.titulo} `, bold: true }), new TextRun(p.texto)]
        : [new TextRun(p.texto)],
    })
  })

  const firmas = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 720 },
    children: [
      new TextRun(`${'_'.repeat(30)}                                                              ${'_'.repeat(30)}`),
    ],
  })
  const nombresFirma = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 },
    children: [
      new TextRun(`${data.vendedor.nombre.padEnd(50)}${data.comprador.nombre}`),
    ],
  })

  const doc = new Document({
    creator: 'VH Group S.R.L.',
    title: filename,
    sections: [{
      properties: {},
      children: [...children, firmas, nombresFirma],
    }],
  })

  return Packer.toBuffer(doc)
}

/** Arma el .docx con todos los pagarés individuales (ver lib/contracts/pagare-plantilla.ts). */
async function construirPagaresDocxBuffer(data: PagareInput): Promise<Buffer> {
  const parrafos = construirPagares(data)
  const tabStops = [{ type: TabStopType.LEFT, position: 4500 }]

  const children = parrafos.map(p => {
    if (p.texto === '') {
      return new Paragraph({ spacing: { after: 200 } })
    }
    return new Paragraph({
      alignment: p.centrado ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: p.negrita ? 160 : 120, line: p.tab ? undefined : 300 },
      tabStops: p.tab ? tabStops : undefined,
      children: [new TextRun({ text: p.texto, bold: p.negrita })],
    })
  })

  const doc = new Document({
    creator: 'VH Group S.R.L.',
    title: 'Pagarés',
    sections: [{ properties: {}, children }],
  })

  return Packer.toBuffer(doc)
}

function slugFilename(nombre: string): string {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
}

export interface GeneratedContract {
  base64: string
  filename: string
  preview: { titulo?: string; texto: string }[]
}

export async function generarContrato(dataIn: unknown): Promise<ActionResult<GeneratedContract>> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(contractGenerationSchema, dataIn)
  if (!parsed.success) return { error: parsed.error }
  const data = parsed.data

  const contratoInput = aContratoInput(data)
  const errorMontos = validarMontosContrato(contratoInput)
  if (errorMontos) return { error: errorMontos }

  const filename = `CONTRATO_${slugFilename(data.vendedor.nombre.split(' ')[0])}_A_${slugFilename(data.comprador.nombre)}.docx`

  let buffer: Buffer
  try {
    buffer = await construirDocxBuffer(contratoInput, filename)
  } catch (err) {
    console.error('generarContrato:', err)
    return { error: 'No se pudo generar el documento. Intentá de nuevo.' }
  }

  if (data.registrarEnPlanillaPagares && data.financiado) {
    const cuotasInput = data.cuotas.map((c, i) => ({
      tipo: c.tipo,
      numero: data.cuotas.filter((x, j) => x.tipo === c.tipo && j <= i).length,
      monto: c.monto,
      fecha_vencimiento: c.fecha,
      notas: c.fecha ? null : 'A convenir',
    }))
    const vehiculoTxt = `${data.vehiculo.marca} ${data.vehiculo.modelo} ${data.vehiculo.anio}`
    const entrada = (data.esPermuta ? (data.permutaValor ?? 0) : 0) + (data.entradaEfectivo ?? 0)
    const res = await createParesContractWithCuotas({
      client_name: data.comprador.nombre,
      contract_file_url: null,
      vehiculo: vehiculoTxt,
      numero_chassis: data.vehiculo.chasis,
      total_precio: data.precioTotal,
      entrada: entrada || null,
      moneda: data.moneda,
      notas: data.esPermuta ? `Permuta: ${data.permutaDescripcion}` : null,
      cuotas: cuotasInput,
    })
    if ('error' in res) {
      // El contrato ya se generó; avisamos pero no bloqueamos la descarga.
      console.error('generarContrato: fallo al registrar en planilla de pagarés:', res.error)
    }
  }

  await logAudit('contract.generate', 'contract', data.vehicleId)

  return {
    data: {
      base64: buffer.toString('base64'),
      filename,
      preview: construirContrato(contratoInput).map(p => ({ titulo: p.titulo, texto: p.texto })),
    },
  }
}

export interface GeneratedPagares {
  base64: string
  filename: string
}

export async function generarPagares(dataIn: unknown): Promise<ActionResult<GeneratedPagares>> {
  if (!(await isAdminOrSecretary())) return { error: 'No autorizado' }
  const parsed = parseInput(pagareGenerationSchema, dataIn)
  if (!parsed.success) return { error: parsed.error }
  const data = parsed.data

  let buffer: Buffer
  try {
    buffer = await construirPagaresDocxBuffer(data as PagareInput)
  } catch (err) {
    console.error('generarPagares:', err)
    return { error: 'No se pudieron generar los pagarés. Intentá de nuevo.' }
  }

  await logAudit('pagares.generate', 'pagare', null)

  const filename = `PAGARES_${slugFilename(data.deudor.nombre)}.docx`
  return { data: { base64: buffer.toString('base64'), filename } }
}
