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
  precio_lista: number
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
