export * from './database'

export interface ActionResult<T = null> {
  data?: T
  error?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface VehicleFilters {
  marca?: string
  modelo?: string
  estado?: string
  search?: string
}

export interface Employee {
  id: string
  profile_id: string | null
  nombre: string
  documento: string | null
  telefono: string | null
  email: string | null
  cargo: string
  salario_base: number
  comision_porcentaje: number
  fecha_ingreso: string
  activo: boolean
  notas: string | null
  created_at: string
  updated_at: string
}

export interface EmployeePayment {
  id: string
  employee_id: string
  monto: number
  tipo: 'salario' | 'comision' | 'aguinaldo' | 'adelanto' | 'bonificacion' | 'otro'
  fecha: string
  notas: string | null
  created_by: string | null
  created_at: string
}

export interface EmployeeSalaryHistory {
  id: string
  employee_id: string
  salario_anterior: number
  salario_nuevo: number
  motivo: string | null
  changed_by: string | null
  created_at: string
}

export interface VehiclePhoto {
  id: string
  vehicle_id: string
  url: string
  storage_path: string
  is_main: boolean
  created_by: string | null
  created_at: string
}

export interface PriceList {
  id: string
  titulo: string
  descripcion: string | null
  activa: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PriceListItem {
  id: string
  price_list_id: string
  vehicle_id: string
  precio_1: number | null
  precio_2: number | null
  precio_lista: number
  precio_financiado_12: number | null
  precio_financiado_18: number | null
  precio_financiado_24: number | null
  entrega: number | null
  notas: string | null
  created_at: string
  vehicles?: {
    marca: string
    modelo: string
    anio: number
    km: number
    color: string | null
    estado: string
  }
}
