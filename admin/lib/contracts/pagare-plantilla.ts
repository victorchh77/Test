/**
 * Redacción de pagarés individuales (uno por cuota/refuerzo), calcada
 * palabra por palabra —y, en la medida de lo posible, formato por
 * formato— del modelo real de VH Group (PAGARES_SUSANA_STANG.docx — 25
 * cuotas de Gs2.000.000 + 2 refuerzos de Gs7.000.000, cada uno como un
 * pagaré a la orden independiente numerado "N.º X de Y" dentro de su
 * propio grupo cuota/refuerzo).
 *
 * Detalles de formato tomados directamente del XML del documento real
 * (no son estética libre):
 *   - Papel A4, márgenes de 1 pulgada.
 *   - La línea "N.º X de Y  Gs..." usa una tabulación DERECHA en la
 *     posición 9026 (= todo el ancho útil de la página) — por eso el
 *     monto queda pegado al margen derecho, no "a mitad de página".
 *   - Tamaños: título 14pt, "N.º X de Y" 13pt, el monto 11pt, el párrafo
 *     legal de mora 9pt (el resto usa el tamaño por defecto del documento).
 *   - El nombre del acreedor, "GUARANIES: monto", "DEUDOR" y los tres
 *     datos del deudor (nombre/domicilio/documento) van en negrita y
 *     subrayados como si fueran el dato completado en un formulario.
 */

import { numeroALetras, fechaCorta, fechaPagareEnLetras } from '@/lib/utils/numero-a-letras'

export interface PagareCuotaInput {
  tipo: 'cuota' | 'refuerzo'
  numero: number   // posición dentro de su propio grupo (1-based)
  total: number     // cantidad total de pagarés en ese grupo
  monto: number
  fecha: string     // YYYY-MM-DD, vencimiento
}

export interface PagareInput {
  acreedor: string          // "VICTOR CHAVEZ LEZCANO"
  deudor: { nombre: string; domicilio: string; ci: string }
  fechaEmision: string      // YYYY-MM-DD — fecha en que se suscriben los pagarés (fecha del contrato)
  moneda: 'Gs' | 'USD'
  cuotas: PagareCuotaInput[]
}

export interface PagareSegmento {
  texto: string
  bold?: boolean
  underline?: boolean
  size?: number  // en puntos; si falta, usa el tamaño por defecto del documento
}

export interface PagareParrafo {
  segmentos: PagareSegmento[]
  centrado?: boolean
  tab?: boolean  // la línea tiene una tabulación a la derecha (columna número/monto o nombre/firma)
}

function montoPalabras(monto: number, moneda: 'Gs' | 'USD'): string {
  const etiqueta = moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'GUARANIES'
  return `${etiqueta}: ${numeroALetras(monto)}`
}

function simboloMoneda(moneda: 'Gs' | 'USD'): string {
  return moneda === 'USD' ? 'US$' : 'Gs'
}

/** Los párrafos fijos de UN pagaré individual (sin el separador en blanco entre pagarés). */
function construirUnPagare(c: PagareCuotaInput, data: PagareInput): PagareParrafo[] {
  const cifra = Math.round(c.monto).toLocaleString('es-PY')
  const vencCorto = c.fecha.split('-').reverse().join('/')

  return [
    { centrado: true, segmentos: [{ texto: 'PAGARE A LA ORDEN', bold: true, size: 14 }] },
    {
      tab: true,
      segmentos: [
        { texto: `N.º ${c.numero} de ${c.total}`, bold: true, size: 13 },
        { texto: '\t' },
        { texto: `${simboloMoneda(data.moneda)}${cifra}#`, bold: true, size: 11 },
      ],
    },
    {
      segmentos: [
        { texto: 'Vencimiento: ', bold: true },
        { texto: `${vencCorto}. `, bold: true },
        { texto: `Enc. ${fechaCorta(data.fechaEmision)}.-` },
      ],
    },
    { segmentos: [{ texto: `${fechaPagareEnLetras(c.fecha).replace(/^el/, 'El')}. ----` }] },
    {
      segmentos: [
        { texto: 'Pagaré a ' },
        { texto: data.acreedor, bold: true, underline: true },
        { texto: ' o a su orden la cantidad de ' },
        { texto: `${montoPalabras(c.monto, data.moneda)}. ------`, bold: true },
      ],
    },
    {
      segmentos: [{
        texto:
          'Queda expresamente convenido que la falta de pago de este pagaré me (nos) constituirá en mora '
          + 'automáticamente, sin necesidad de interpelación judicial o extrajudicial alguna, devengando durante '
          + 'el tiempo de la mora un interés del _____%, un interés moratorio del _____% por el simple retardo '
          + 'sin que esto implique prórroga del plazo de la obligación. Asimismo, me(nos) obligo(mos) a pagar '
          + 'cualquier gasto en que incurra el acreedor con relación a este préstamo, en caso de que el mismo sea '
          + 'reclamado por la vía judicial o extrajudicial, autorizando a (________________) a tratar mis datos '
          + 'personales, en particular los datos crediticios que surjan de la presente relación comercial, de '
          + 'conformidad a la ley N° 6534/20 de "Protección De Datos Personales Crediticios". A los efectos '
          + 'legales y procesales nos sometemos a la jurisdicción de los tribunales de la ciudad de Encarnación y '
          + 'renunciando a cualquier otra que pudiera corresponder. Las partes constituyen domicilio especial en '
          + 'los lugares indicados en el presente documento.',
        size: 9,
      }],
    },
    { segmentos: [{ texto: 'DEUDOR', bold: true, underline: true }] },
    {
      tab: true,
      segmentos: [
        { texto: 'Nombre: ', bold: true },
        { texto: `${data.deudor.nombre}.`, bold: true, underline: true },
        { texto: '\t________________________' },
      ],
    },
    { segmentos: [{ texto: '\tFirma', bold: true }], tab: true },
    {
      segmentos: [
        { texto: 'Domicilio: ', bold: true },
        { texto: `${data.deudor.domicilio}.`, bold: true, underline: true },
      ],
    },
    {
      segmentos: [
        { texto: 'Documento de Identidad N.º: ', bold: true },
        { texto: `${data.deudor.ci}.`, bold: true, underline: true },
      ],
    },
  ]
}

/** Devuelve, en orden, los párrafos de TODOS los pagarés (cuotas primero, luego refuerzos), separados por un párrafo en blanco. */
export function construirPagares(data: PagareInput): PagareParrafo[] {
  const out: PagareParrafo[] = []
  const ordenados = [...data.cuotas].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'cuota' ? -1 : 1
    return a.numero - b.numero
  })
  ordenados.forEach((c, i) => {
    if (i > 0) out.push({ segmentos: [] })
    out.push(...construirUnPagare(c, data))
  })
  return out
}
