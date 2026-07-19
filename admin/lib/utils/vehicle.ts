const MIN_USEFUL_DESCRIPTION_LENGTH = 30

/**
 * Filtra descripciones genéricas ("Transmisión automática", etc.) que no
 * aportan nada al catálogo público o a los posts de Facebook.
 */
export function hasUsefulDescription(descripcion: string | null | undefined): boolean {
  if (!descripcion) return false
  return descripcion.trim().length >= MIN_USEFUL_DESCRIPTION_LENGTH
}
