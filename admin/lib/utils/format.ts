export function formatCurrency(value: number): string {
  return 'Gs. ' + value.toLocaleString('es-PY')
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  // 'YYYY-MM-DD' (fecha pura) -> fijar medianoche local.
  // Timestamp completo (con 'T' o espacio) -> parsear directo, sin romperlo.
  const raw = date.length <= 10 ? `${date}T00:00:00` : date
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDatetime(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatKm(km: number): string {
  return km === 0 ? '0 km' : km.toLocaleString('es-PY') + ' km'
}

export function calcRentabilidad(
  precioVenta: number,
  precioCompra: number,
  totalGastos: number
): number {
  return precioVenta - precioCompra - totalGastos
}
