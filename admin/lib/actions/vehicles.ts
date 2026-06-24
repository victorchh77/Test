'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { VehicleFormData } from '@/lib/validations/vehicle'
import type { ActionResult, Vehicle, SaleWithDetails } from '@/types'

// ── Mock data ────────────────────────────────────────────────
const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', marca: 'Toyota',    modelo: 'Hilux',    anio: 2023, km: 28000, color: 'Blanco',   precio_compra: 180000000, precio_venta: 230000000, estado: 'Disponible', descripcion: 'Excelente estado, service al día', fecha_ingreso: '2024-11-10', created_by: null, created_at: '2024-11-10T10:00:00Z', updated_at: '2024-11-10T10:00:00Z' },
  { id: 'v2', marca: 'Ford',      modelo: 'Ranger',   anio: 2022, km: 45000, color: 'Gris',     precio_compra: 150000000, precio_venta: 195000000, estado: 'Disponible', descripcion: null, fecha_ingreso: '2024-10-20', created_by: null, created_at: '2024-10-20T09:00:00Z', updated_at: '2024-10-20T09:00:00Z' },
  { id: 'v3', marca: 'Chevrolet', modelo: 'S10',      anio: 2021, km: 62000, color: 'Negro',    precio_compra: 120000000, precio_venta: 155000000, estado: 'Reservado',  descripcion: 'Con tapa y arco', fecha_ingreso: '2024-09-15', created_by: null, created_at: '2024-09-15T08:00:00Z', updated_at: '2024-12-01T08:00:00Z' },
  { id: 'v4', marca: 'Toyota',    modelo: 'Corolla',  anio: 2023, km: 12000, color: 'Plata',    precio_compra: 130000000, precio_venta: 165000000, estado: 'Disponible', descripcion: null, fecha_ingreso: '2024-12-01', created_by: null, created_at: '2024-12-01T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'v5', marca: 'Honda',     modelo: 'Civic',    anio: 2022, km: 31000, color: 'Rojo',     precio_compra: 110000000, precio_venta: 142000000, estado: 'Vendido',    descripcion: null, fecha_ingreso: '2024-08-05', created_by: null, created_at: '2024-08-05T10:00:00Z', updated_at: '2024-12-10T10:00:00Z' },
  { id: 'v6', marca: 'Hyundai',   modelo: 'Tucson',   anio: 2024, km: 0,     color: 'Blanco',   precio_compra: 200000000, precio_venta: 255000000, estado: 'Disponible', descripcion: '0 km, garantía de fábrica', fecha_ingreso: '2024-12-15', created_by: null, created_at: '2024-12-15T10:00:00Z', updated_at: '2024-12-15T10:00:00Z' },
]

const MOCK_EXPENSES = [
  { id: 'e1', vehicle_id: 'v1', tipo: 'mecanica'      as const, descripcion: 'Cambio de aceite y filtros', monto: 850000, fecha: '2024-11-12', created_by: null, created_at: '2024-11-12T10:00:00Z' },
  { id: 'e2', vehicle_id: 'v1', tipo: 'limpieza'      as const, descripcion: 'Lavado y encerado completo', monto: 350000, fecha: '2024-11-13', created_by: null, created_at: '2024-11-13T10:00:00Z' },
  { id: 'e3', vehicle_id: 'v2', tipo: 'documentacion' as const, descripcion: 'Transferencia y patente',    monto: 1200000, fecha: '2024-10-22', created_by: null, created_at: '2024-10-22T10:00:00Z' },
  { id: 'e4', vehicle_id: 'v3', tipo: 'pintura'       as const, descripcion: 'Retoque paragolpes trasero', monto: 2500000, fecha: '2024-09-18', created_by: null, created_at: '2024-09-18T10:00:00Z' },
  { id: 'e5', vehicle_id: 'v5', tipo: 'mecanica'      as const, descripcion: 'Cambio pastillas de freno',  monto: 650000, fecha: '2024-08-08', created_by: null, created_at: '2024-08-08T10:00:00Z' },
]

const MOCK_PRICE_HISTORY = [
  { id: 'ph1', vehicle_id: 'v1', precio_anterior: 225000000, precio_nuevo: 230000000, motivo: 'Ajuste por tipo de cambio', changed_by: null, created_at: '2024-11-25T14:30:00Z' },
  { id: 'ph2', vehicle_id: 'v3', precio_anterior: 160000000, precio_nuevo: 155000000, motivo: 'Descuento para cerrar operación', changed_by: null, created_at: '2024-12-01T09:15:00Z' },
]

const MOCK_SALES: SaleWithDetails[] = [
  { id: 's1', vehicle_id: 'v5', client_id: 'c2', precio_final: 140000000, fecha_venta: '2024-12-10', comision: 2000000, vendedor_id: null, notas: 'Pago contado', created_at: '2024-12-10T10:00:00Z', marca: 'Honda', modelo: 'Civic', anio: 2022, precio_compra: 110000000, client_nombre: 'María García', client_telefono: '0981 234 567', vendedor_nombre: 'Admin VH Group', ganancia: 29350000 },
  { id: 's2', vehicle_id: 'v5', client_id: 'c1', precio_final: 155000000, fecha_venta: '2024-11-28', comision: 0, vendedor_id: null, notas: null, created_at: '2024-11-28T10:00:00Z', marca: 'Chevrolet', modelo: 'S10', anio: 2020, precio_compra: 118000000, client_nombre: 'Carlos Rodríguez', client_telefono: '0985 111 222', vendedor_nombre: 'Admin VH Group', ganancia: 35500000 },
  { id: 's3', vehicle_id: 'v5', client_id: 'c3', precio_final: 190000000, fecha_venta: '2024-12-05', comision: 3000000, vendedor_id: null, notas: 'Financiamiento 24 cuotas', created_at: '2024-12-05T10:00:00Z', marca: 'Toyota', modelo: 'RAV4', anio: 2021, precio_compra: 148000000, client_nombre: 'Laura Martínez', client_telefono: '0982 333 444', vendedor_nombre: 'Admin VH Group', ganancia: 39000000 },
  { id: 's4', vehicle_id: 'v5', client_id: 'c1', precio_final: 225000000, fecha_venta: '2024-12-18', comision: 0, vendedor_id: null, notas: null, created_at: '2024-12-18T10:00:00Z', marca: 'Ford', modelo: 'Ranger', anio: 2023, precio_compra: 178000000, client_nombre: 'Carlos Rodríguez', client_telefono: '0985 111 222', vendedor_nombre: 'Admin VH Group', ganancia: 45800000 },
]

// ── Actions (return mock data) ────────────────────────────────
export async function getVehicles(filters?: { marca?: string; estado?: string; search?: string }) {
  let data = [...MOCK_VEHICLES]
  if (filters?.marca)  data = data.filter(v => v.marca === filters.marca)
  if (filters?.estado) data = data.filter(v => v.estado === filters.estado)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(v => v.marca.toLowerCase().includes(q) || v.modelo.toLowerCase().includes(q))
  }
  return data
}

export async function getVehicle(id: string) {
  return MOCK_VEHICLES.find(v => v.id === id) ?? null
}

export async function createVehicle(formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  return { data: MOCK_VEHICLES[0] }
}

export async function updateVehicle(id: string, formData: VehicleFormData): Promise<ActionResult<Vehicle>> {
  return { data: MOCK_VEHICLES.find(v => v.id === id) ?? MOCK_VEHICLES[0] }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  revalidatePath('/vehiculos')
  redirect('/vehiculos')
}

export async function getVehicleExpenses(vehicleId: string) {
  return MOCK_EXPENSES.filter(e => e.vehicle_id === vehicleId)
}

export async function getVehiclePriceHistory(vehicleId: string) {
  return MOCK_PRICE_HISTORY.filter(h => h.vehicle_id === vehicleId)
}

export async function getDashboardStats() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const sales = MOCK_SALES.filter(s => s.fecha_venta >= firstDay)
  const enStock = MOCK_VEHICLES.filter(v => v.estado !== 'Vendido').length
  const ventasMes = sales.length
  const gananciaMes = sales.reduce((a, s) => a + s.ganancia, 0)
  const totalClients = 8
  return { enStock, ventasMes, gananciaMes, totalClients, sales: MOCK_SALES }
}
