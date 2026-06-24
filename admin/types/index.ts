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
