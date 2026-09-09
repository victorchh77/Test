/**
 * Redacción de pagarés individuales (uno por cuota/refuerzo), calcada
 * palabra por palabra del modelo real de VH Group (PAGARES_SUSANA_STANG.docx
 * — 25 cuotas de Gs2.000.000 + 2 refuerzos de Gs7.000.000, cada uno como un
 * pagaré a la orden independiente numerado "N.º X de Y" dentro de su propio
 * grupo cuota/refuerzo).
 *
 * A diferencia del contrato de compraventa (lib/contracts/plantillas.ts),
 * acá no hubo que reconstruir nada a partir de fragmentos: todo el texto
 * fijo está copiado tal cual del documento real, así que es fiel al 100%.
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

export interface PagareParrafo {
  texto: string
  negrita?: boolean
  centrado?: boolean
  tab?: boolean  // si viene, el texto tiene un tab literal en el medio (columna monto / firma)
}

function montoPalabras(monto: number, moneda: 'Gs' | 'USD'): string {
  const etiqueta = moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'GUARANIES'
  return `${etiqueta}: ${numeroALetras(monto)}`
}

function simboloMoneda(moneda: 'Gs' | 'USD'): string {
  return moneda === 'USD' ? 'US$' : 'Gs'
}

/** Los 6 párrafos fijos de UN pagaré individual (sin el separador en blanco entre pagarés). */
function construirUnPagare(c: PagareCuotaInput, data: PagareInput): PagareParrafo[] {
  const cifra = Math.round(c.monto).toLocaleString('es-PY')
  return [
    { texto: 'PAGARE A LA ORDEN', negrita: true, centrado: true },
    { texto: `N.º ${c.numero} de ${c.total}\t${simboloMoneda(data.moneda)}${cifra}#`, tab: true },
    { texto: `Vencimiento: ${c.fecha.split('-').reverse().join('/')}. Enc. ${fechaCorta(data.fechaEmision)}.-` },
    { texto: `${fechaPagareEnLetras(c.fecha).replace(/^el/, 'El')}. ----` },
    { texto: `Pagaré a ${data.acreedor} o a su orden la cantidad de ${montoPalabras(c.monto, data.moneda)}. ------` },
    {
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
    },
    { texto: 'DEUDOR', negrita: true },
    { texto: `Nombre: ${data.deudor.nombre}.\t________________________`, tab: true },
    { texto: '\tFirma', tab: true },
    { texto: `Domicilio: ${data.deudor.domicilio}.` },
    { texto: `Documento de Identidad N.º: ${data.deudor.ci}.` },
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
    if (i > 0) out.push({ texto: '' })
    out.push(...construirUnPagare(c, data))
  })
  return out
}
