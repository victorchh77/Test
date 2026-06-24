export function formatCurrency(value: number): string {
  return 'Gs. ' + value.toLocaleString('es-PY')
}

export function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDatetime(date: string): string {
  return new Date(date).toLocaleString('es-PY', {
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
