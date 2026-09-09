/**
 * Conversión de números y fechas a letras en español, para redactar
 * contratos legales (el estilo notarial paraguayo escribe los montos y la
 * fecha en palabras, con la cifra numérica entre paréntesis a continuación:
 * "GUARANIES TREINTA Y SIETE MILLONES (Gs37.000.000)").
 */

const UNIDADES = [
  '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
]
// 21-29 tienen tildes irregulares (veintiséis, veintidós...) que no salen de
// concatenar "VEINTI" + unidad, así que van como tabla propia.
const VEINTIS = [
  'VEINTE', 'VEINTIÚN', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO',
  'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
]
const DECENAS = [
  '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
]
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]

function tresDigitos(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'
  const c = Math.floor(n / 100)
  const resto = n % 100
  const partes: string[] = []
  if (c > 0) partes.push(CENTENAS[c])
  if (resto > 0) {
    if (resto < 20) {
      partes.push(UNIDADES[resto])
    } else if (resto < 30) {
      partes.push(VEINTIS[resto - 20])
    } else {
      const d = Math.floor(resto / 10)
      const u = resto % 10
      partes.push(u > 0 ? `${DECENAS[d]} Y ${UNIDADES[u]}` : DECENAS[d])
    }
  }
  return partes.join(' ')
}

/** Convierte un entero no negativo a su representación en letras (español, sin decimales). */
export function numeroALetras(n: number): string {
  n = Math.round(Math.abs(n))
  if (n === 0) return 'CERO'

  const billones  = Math.floor(n / 1_000_000_000_000)
  const millones  = Math.floor((n % 1_000_000_000_000) / 1_000_000)
  const miles     = Math.floor((n % 1_000_000) / 1_000)
  const unidades  = n % 1_000

  const partes: string[] = []

  if (billones > 0) {
    partes.push(billones === 1 ? 'UN BILLÓN' : `${tresDigitos(billones)} BILLONES`)
  }
  if (millones > 0) {
    partes.push(millones === 1 ? 'UN MILLÓN' : `${tresDigitos(millones)} MILLONES`)
  }
  if (miles > 0) {
    partes.push(miles === 1 ? 'MIL' : `${tresDigitos(miles)} MIL`)
  }
  if (unidades > 0) {
    partes.push(tresDigitos(unidades))
  }

  return partes.join(' ').trim()
}

/** "GUARANIES TREINTA Y SIETE MILLONES (Gs37.000.000)" / "DÓLARES AMERICANOS DIEZ MIL (US$10.000)" */
export function montoEnLetras(monto: number, moneda: 'Gs' | 'USD'): string {
  const cifra = Math.round(Math.abs(monto)).toLocaleString('es-PY')
  if (moneda === 'USD') {
    return `DÓLARES AMERICANOS ${numeroALetras(monto)} (US$${cifra})`
  }
  return `GUARANIES ${numeroALetras(monto)} (Gs${cifra})`
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * "a los dos días del mes de septiembre del dos mil veintiséis" — estilo
 * notarial usado en el encabezado de los contratos de VH Group. Acepta
 * "YYYY-MM-DD" o un Date.
 */
export function fechaEnLetras(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(`${fecha}T00:00:00`) : fecha
  const dia  = d.getDate()
  const mes  = MESES[d.getMonth()]
  const anio = d.getFullYear()
  const anioLetras = numeroALetras(anio).toLowerCase()
  if (dia === 1) return `al primer día del mes de ${mes} del ${anioLetras}`
  return `a los ${numeroALetras(dia).toLowerCase()} días del mes de ${mes} del ${anioLetras}`
}

/** Formatea una lista de fechas ISO ("YYYY-MM-DD") como "el DD/MM/YYYY, el DD/MM/YYYY y el DD/MM/YYYY". */
export function fechasEnLista(fechasIso: (string | null)[]): string {
  const validas = fechasIso.filter((f): f is string => !!f)
  if (!validas.length) return 'a convenir'
  const formateadas = validas.map(f => {
    const [y, m, dd] = f.split('-')
    return `${dd}/${m}/${y}`
  })
  if (formateadas.length === 1) return formateadas[0]
  return `${formateadas.slice(0, -1).join(', ')} y ${formateadas[formateadas.length - 1]}`
}
