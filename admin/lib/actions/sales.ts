'use server'

import type { SaleFormData } from '@/lib/validations/sale'
import type { ActionResult } from '@/types'

const MOCK_SALES = [
  { id: 's4', vehicle_id: 'v4', client_id: 'c1', precio_final: 225000000, fecha_venta: '2024-12-18', comision: 0, vendedor_id: null, notas: null, created_at: '2024-12-18T10:00:00Z', marca: 'Ford', modelo: 'Ranger', anio: 2023, precio_compra: 178000000, client_nombre: 'Carlos Rodríguez', client_telefono: '0985 111 222', vendedor_nombre: 'Admin VH Group', ganancia: 45800000 },
  { id: 's3', vehicle_id: 'v3', client_id: 'c3', precio_final: 190000000, fecha_venta: '2024-12-05', comision: 3000000, vendedor_id: null, notas: 'Financiamiento 24 cuotas', created_at: '2024-12-05T10:00:00Z', marca: 'Toyota', modelo: 'RAV4', anio: 2021, precio_compra: 148000000, client_nombre: 'Laura Martínez', client_telefono: '0982 333 444', vendedor_nombre: 'Admin VH Group', ganancia: 39000000 },
  { id: 's1', vehicle_id: 'v5', client_id: 'c2', precio_final: 140000000, fecha_venta: '2024-12-10', comision: 2000000, vendedor_id: null, notas: 'Pago contado', created_at: '2024-12-10T10:00:00Z', marca: 'Honda', modelo: 'Civic', anio: 2022, precio_compra: 110000000, client_nombre: 'María García', client_telefono: '0981 234 567', vendedor_nombre: 'Admin VH Group', ganancia: 29350000 },
  { id: 's2', vehicle_id: 'v6', client_id: 'c1', precio_final: 155000000, fecha_venta: '2024-11-28', comision: 0, vendedor_id: null, notas: null, created_at: '2024-11-28T10:00:00Z', marca: 'Chevrolet', modelo: 'S10', anio: 2020, precio_compra: 118000000, client_nombre: 'Carlos Rodríguez', client_telefono: '0985 111 222', vendedor_nombre: 'Admin VH Group', ganancia: 35500000 },
]

export async function getSales(fromDate?: string, toDate?: string) {
  let data = [...MOCK_SALES]
  if (fromDate) data = data.filter(s => s.fecha_venta >= fromDate)
  if (toDate)   data = data.filter(s => s.fecha_venta <= toDate)
  return data
}

export async function createSale(formData: SaleFormData): Promise<ActionResult> {
  return {}
}
