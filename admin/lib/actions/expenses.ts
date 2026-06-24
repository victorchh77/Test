'use server'

import { revalidatePath } from 'next/cache'
import type { ExpenseFormData } from '@/lib/validations/expense'
import type { ActionResult } from '@/types'

const MOCK_EXPENSES_ALL = [
  { id: 'e1', vehicle_id: 'v1', tipo: 'mecanica', descripcion: 'Cambio de aceite y filtros', monto: 850000, fecha: '2024-11-12', created_by: null, created_at: '2024-11-12T10:00:00Z', vehicles: { marca: 'Toyota', modelo: 'Hilux', anio: 2023 } },
  { id: 'e2', vehicle_id: 'v1', tipo: 'limpieza', descripcion: 'Lavado y encerado completo', monto: 350000, fecha: '2024-11-13', created_by: null, created_at: '2024-11-13T10:00:00Z', vehicles: { marca: 'Toyota', modelo: 'Hilux', anio: 2023 } },
  { id: 'e3', vehicle_id: 'v2', tipo: 'documentacion', descripcion: 'Transferencia y patente', monto: 1200000, fecha: '2024-10-22', created_by: null, created_at: '2024-10-22T10:00:00Z', vehicles: { marca: 'Ford', modelo: 'Ranger', anio: 2022 } },
  { id: 'e4', vehicle_id: 'v3', tipo: 'pintura', descripcion: 'Retoque paragolpes trasero', monto: 2500000, fecha: '2024-09-18', created_by: null, created_at: '2024-09-18T10:00:00Z', vehicles: { marca: 'Chevrolet', modelo: 'S10', anio: 2021 } },
  { id: 'e5', vehicle_id: 'v5', tipo: 'mecanica', descripcion: 'Cambio pastillas de freno', monto: 650000, fecha: '2024-08-08', created_by: null, created_at: '2024-08-08T10:00:00Z', vehicles: { marca: 'Honda', modelo: 'Civic', anio: 2022 } },
  { id: 'e6', vehicle_id: 'v4', tipo: 'limpieza', descripcion: 'Detailing interior completo', monto: 480000, fecha: '2024-12-03', created_by: null, created_at: '2024-12-03T10:00:00Z', vehicles: { marca: 'Toyota', modelo: 'Corolla', anio: 2023 } },
  { id: 'e7', vehicle_id: 'v6', tipo: 'documentacion', descripcion: 'Empadronamiento', monto: 950000, fecha: '2024-12-16', created_by: null, created_at: '2024-12-16T10:00:00Z', vehicles: { marca: 'Hyundai', modelo: 'Tucson', anio: 2024 } },
]

export async function createExpense(formData: ExpenseFormData): Promise<ActionResult> {
  return {}
}

export async function deleteExpense(id: string, vehicleId: string): Promise<ActionResult> {
  return {}
}

export async function getAllExpenses() {
  return MOCK_EXPENSES_ALL
}
