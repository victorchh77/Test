/**
 * Redacción del contrato privado de compraventa de vehículo de VH Group.
 *
 * El texto de las cláusulas PRIMERA, TERCERA a OCTAVA y el encabezado están
 * tomados palabra por palabra del contrato real "VENDO PREMIO A HUGO
 * PAREDES" (02/09/2026) que nos pasó el cliente — son cláusulas genéricas,
 * iguales sea la venta al contado, financiada o con permuta.
 *
 * La cláusula SEGUNDA (forma de pago) sí cambia según el tipo de venta —
 * para "financiado"/"permuta" no tenemos un contrato real de referencia
 * todavía (solo los fragmentos de frase que quedaron grabados en las
 * expresiones regulares del escáner de pagarés en lib/actions/pares.ts, que
 * se usaban para *leer* datos de un contrato ya firmado, no para redactar
 * uno nuevo). Esta cláusula está reconstruida a partir de esos fragmentos
 * reales, siguiendo el mismo estilo notarial. Si VH Group tiene un contrato
 * financiado o con permuta ya firmado, conviene pasarlo para ajustar esta
 * cláusula palabra por palabra, igual que se hizo con la de contado.
 */

import { montoEnLetras, fechaEnLetras, fechasEnLista } from '@/lib/utils/numero-a-letras'

export interface ContratoParte {
  nombre: string
  nacionalidad: string
  estadoCivil: string
  ci: string
  domicilio: string
}

export interface ContratoVehiculo {
  marca: string
  tipo: string
  modelo: string
  color: string
  anio: number
  chasis: string
  matricula: string | null
}

export interface ContratoCuota {
  tipo: 'cuota' | 'refuerzo'
  monto: number
  fecha: string | null
}

export interface ContratoInput {
  ciudad: string
  fecha: string
  vendedor: ContratoParte
  comprador: ContratoParte
  vehiculo: ContratoVehiculo
  moneda: 'Gs' | 'USD'
  precioTotal: number
  esPermuta: boolean
  permutaDescripcion: string | null
  permutaValor: number | null
  entradaEfectivo: number | null
  financiado: boolean
  cuotas: ContratoCuota[]
}

export interface ContratoParrafo {
  texto: string
  titulo?: string  // si viene, el párrafo empieza con este título en negrita (ej. "PRIMERA:")
}

/** Valida que las cifras cierren: permuta + entrada + cuotas == precio total. */
export function validarMontosContrato(data: ContratoInput): string | null {
  const cuotasTotal = data.cuotas.reduce((a, c) => a + c.monto, 0)
  const permuta = data.esPermuta ? (data.permutaValor ?? 0) : 0
  const entrada = data.entradaEfectivo ?? 0
  const suma = permuta + entrada + (data.financiado ? cuotasTotal : 0)
  if (suma !== data.precioTotal) {
    const simbolo = data.moneda === 'USD' ? 'US$' : 'Gs'
    return `Los montos no cierran: permuta + entrega + cuotas (${simbolo}${suma.toLocaleString('es-PY')}) `
      + `debe ser igual al precio total (${simbolo}${data.precioTotal.toLocaleString('es-PY')}).`
  }
  if (data.financiado && data.cuotas.length === 0) {
    return 'Marcaste la venta como financiada pero no cargaste ninguna cuota.'
  }
  if (data.esPermuta && !data.permutaDescripcion?.trim()) {
    return 'Marcaste que hay un vehículo de permuta pero no cargaste su descripción.'
  }
  return null
}

function clausulaSegunda(data: ContratoInput): string {
  const { moneda } = data
  const totalLetras = montoEnLetras(data.precioTotal, moneda)
  const frases: string[] = [`El precio total de la venta se establece en la suma de ${totalLetras}.`]

  // Todas las frases quedan en infinitivo ("recibir") para poder encadenarlas
  // después de "El vendedor declara" sin importar el orden ni la combinación.
  const partesPago: string[] = []
  if (data.esPermuta && data.permutaValor) {
    partesPago.push(
      `recibir en este acto, como parte de pago, un vehículo de su propiedad, ${data.permutaDescripcion}, `
      + `valuado de común acuerdo entre las partes en la suma de ${montoEnLetras(data.permutaValor, moneda)}`,
    )
  }
  if (data.entradaEfectivo) {
    partesPago.push(
      `recibir en este acto de manos del comprador, en dinero en efectivo, la suma de ${montoEnLetras(data.entradaEfectivo, moneda)}`,
    )
  }
  if (partesPago.length) {
    frases.push(`El vendedor declara ${partesPago.join(', y también ')}.`)
  }

  if (!data.financiado) {
    frases.push('Sirviendo el presente instrumento de suficiente recibo, no quedando saldo pendiente de pago.')
  } else {
    const cuotasNormales  = data.cuotas.filter(c => c.tipo === 'cuota')
    const cuotasRefuerzo  = data.cuotas.filter(c => c.tipo === 'refuerzo')
    const saldo = data.cuotas.reduce((a, c) => a + c.monto, 0)

    const grupos: string[] = []
    const describirGrupo = (cuotas: ContratoCuota[], esRefuerzo: boolean) => {
      if (!cuotas.length) return
      const monto = cuotas[0].monto
      const iguales = cuotas.every(c => c.monto === monto)
      const fechas = fechasEnLista(cuotas.map(c => c.fecha))
      const singular = cuotas.length === 1
      const etiqueta = singular
        ? (esRefuerzo ? 'pagaré de refuerzo' : 'pagaré')
        : (esRefuerzo ? 'pagarés de refuerzo' : 'pagarés')
      if (iguales) {
        grupos.push(
          `${cuotas.length} (${cuotas.length}) ${etiqueta}${singular ? '' : ' iguales'} de ${montoEnLetras(monto, moneda)}${singular ? '' : ' cada uno'}, `
          + `con vencimiento ${singular ? 'el día' : 'los días'} ${fechas}`,
        )
      } else {
        const detalle = cuotas
          .map(c => `${montoEnLetras(c.monto, moneda)} con vencimiento el ${c.fecha ? fechasEnLista([c.fecha]) : 'a convenir'}`)
          .join('; ')
        grupos.push(`${cuotas.length} (${cuotas.length}) ${etiqueta} por los siguientes montos y vencimientos: ${detalle}`)
      }
    }
    describirGrupo(cuotasNormales, false)
    describirGrupo(cuotasRefuerzo, true)

    frases.push(
      `Queda un saldo de ${montoEnLetras(saldo, moneda)}, que EL COMPRADOR se compromete a abonar mediante la `
      + `suscripción de ${grupos.join(', y ')}, suscribiendo EL COMPRADOR en este acto los pagarés correspondientes.`,
    )
  }

  return frases.join(' ')
}

/** Devuelve los párrafos del contrato en orden, listos para renderizar en pantalla o exportar a .docx. */
export function construirContrato(data: ContratoInput): ContratoParrafo[] {
  const v = data.vehiculo
  const matriculaTxt = v.matricula ? `, Matrícula N.º: ${v.matricula}` : ''

  return [
    { texto: 'CONTRATO PRIVADO DE COMPRAVENTA DE VEHÍCULO' },
    {
      texto:
        `En la ciudad de ${data.ciudad}, República del Paraguay, ${fechaEnLetras(data.fecha)}, `
        + `el señor ${data.vendedor.nombre}, ${data.vendedor.nacionalidad}, ${data.vendedor.estadoCivil}, `
        + `con Cédula de Identidad N.º ${data.vendedor.ci}, domiciliado en ${data.vendedor.domicilio}, `
        + `en adelante EL VENDEDOR, y, por otra parte, el señor ${data.comprador.nombre}, `
        + `con C.I. N.º ${data.comprador.ci}, ${data.comprador.nacionalidad}, `
        + `domiciliado en ${data.comprador.domicilio}, en adelante EL COMPRADOR, ambos mayores de edad, `
        + `hábiles para contratar, convienen en celebrar el presente contrato de compraventa de vehículo `
        + `que se regirá por las siguientes cláusulas y condiciones:`,
    },
    {
      titulo: 'PRIMERA:',
      texto:
        `El Señor ${data.vendedor.nombre} vende al Señor ${data.comprador.nombre}, y esta acepta, un vehículo `
        + `usado de su propiedad, Marca: ${v.marca}, Tipo: ${v.tipo}, Modelo: ${v.modelo}, Color: ${v.color}, `
        + `Año: ${v.anio}, Chasis N.º: ${v.chasis}${matriculaTxt}.`,
    },
    { titulo: 'SEGUNDA:', texto: clausulaSegunda(data) },
    {
      titulo: 'TERCERA:',
      texto:
        'El COMPRADOR sin el consentimiento expreso y por escrito del VENDEDOR no podrá vender, grabar y/o '
        + 'prendar el bien objeto del presente contrato hasta el íntegro pago del precio, establecido en la '
        + 'cláusula segunda. El incumplimiento de la presente cláusula hará decaer el plazo de las cuotas no '
        + 'vencidas y tornará exigible la totalidad de la deuda.',
    },
    {
      titulo: 'CUARTA:',
      texto:
        'En caso de incumplimiento de la cláusula anterior el COMPRADOR manifiesta que se hace plenamente '
        + 'responsable en forma personal y directa, liberando expresamente al VENDEDOR de cualquier tipo de '
        + 'reclamación que pudiera corresponder o hacerse como consecuencia del nuevo contrato.',
    },
    {
      titulo: 'QUINTA:',
      texto:
        'El VENDEDOR pone en posesión del COMPRADOR el vehículo vendido en este acto, recibiendo éste a su '
        + 'entera satisfacción y en el estado en que se encuentra, siendo a partir de la fecha el COMPRADOR '
        + 'responsable de toda acción civil, penal, o administrativa emergente de la tenencia, uso del vehículo '
        + 'y de los daños y perjuicios que sufriere u ocasionare.',
    },
    {
      titulo: 'SEXTA:',
      texto:
        'El VENDEDOR se compromete a transferir por este instrumento el vehículo vendido libre de todo '
        + 'gravamen y en legal forma a favor del comprador. Los gastos que erogue la transferencia serán a '
        + 'cargo del comprador.',
    },
    {
      titulo: 'SÉPTIMA:',
      texto:
        `El señor ${data.vendedor.nombre}, AUTORIZA al señor ${data.comprador.nombre}, a conducir el vehículo `
        + 'entregado en este acto, por todo el territorio de la República del Paraguay. A tal efecto el '
        + 'autorizado asume plena y totalmente todas las responsabilidades por los daños o perjuicios a '
        + 'terceros y/o a otro vehículo, exonerando de toda responsabilidad al vendedor.',
    },
    {
      titulo: 'OCTAVA:',
      texto:
        'Las partes se someten para cualquier cuestión que pueda plantearse con relación al presente acuerdo '
        + 'a la Jurisdicción de la Tercera Circunscripción Judicial de la República, de la Ciudad de '
        + 'Encarnación, renunciando a cualquier otro fuero o jurisdicción que pudiera corresponderles. En '
        + 'prueba de aceptación y conformidad, previa lectura y ratificación de su contenido, firman las '
        + 'partes contratantes en el lugar y fecha indicados en el encabezamiento, en dos ejemplares de un '
        + 'mismo tenor y a un solo efecto.',
    },
  ]
}
