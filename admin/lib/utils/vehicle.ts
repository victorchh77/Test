const MIN_USEFUL_DESCRIPTION_LENGTH = 30

/**
 * Filtra descripciones genéricas ("Transmisión automática", etc.) que no
 * aportan nada al catálogo público o a los posts de Facebook.
 */
export function hasUsefulDescription(descripcion: string | null | undefined): boolean {
  if (!descripcion) return false
  return descripcion.trim().length >= MIN_USEFUL_DESCRIPTION_LENGTH
}

// Línea que menciona precio ("Precio: ...", "... Gs.", "₲...") — el precio ya
// se muestra por separado desde precio_venta, así que no debe duplicarse (y
// menos desactualizarse) dentro del texto libre de la descripción pública.
const PRICE_LINE_RE = /precio|₲|\bgs\.?\b/i

/**
 * Quita del texto de la descripción cualquier línea que mencione el precio,
 * para mostrarla al público sin duplicar (y arriesgar desactualizar) el
 * precio que ya se muestra desde el campo dedicado del vehículo.
 */
export function stripPriceLines(descripcion: string | null | undefined): string {
  if (!descripcion) return ''
  return descripcion
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !PRICE_LINE_RE.test(l))
    .join('\n')
}
