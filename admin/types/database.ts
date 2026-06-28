export type Role = 'admin' | 'vendedor' | 'secretaria'
export type VehicleStatus = 'Disponible' | 'Reservado' | 'Vendido'
export type ExpenseType = 'mecanica' | 'limpieza' | 'pintura' | 'documentacion' | 'otros'

export interface Profile {
  id: string
  full_name: string
  role: Role
  username: string | null
  created_at: string
}

export interface Vehicle {
  id: string
  marca: string
  modelo: string
  anio: number
  km: number
  color: string | null
  precio_compra: number
  precio_venta: number
  estado: VehicleStatus
  oculto: boolean
  descripcion: string | null
  fecha_ingreso: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  vehicle_id: string
  tipo: ExpenseType
  descripcion: string | null
  monto: number
  fecha: string
  created_by: string | null
  created_at: string
}

export interface Client {
  id: string
  nombre: string
  documento: string | null
  telefono: string | null
  email: string | null
  ciudad: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  vehicle_id: string
  client_id: string
  precio_final: number
  fecha_venta: string
  comision: number
  vendedor_id: string | null
  notas: string | null
  created_at: string
}

export interface PriceHistory {
  id: string
  vehicle_id: string
  precio_anterior: number
  precio_nuevo: number
  motivo: string | null
  changed_by: string | null
  created_at: string
}

export interface SaleWithDetails extends Sale {
  marca: string
  modelo: string
  anio: number
  precio_compra: number
  client_nombre: string
  client_telefono: string | null
  vendedor_nombre: string | null
  ganancia: number
}

export interface Transfer {
  id: string
  monto: number
  remitente: string | null
  comprobante_url: string | null
  notas: string | null
  verified: boolean
  verified_by: string | null
  verified_at: string | null
  created_by: string
  created_at: string
}

export interface ParesContract {
  id: string
  client_name: string
  contract_file_url: string | null
  dia_pago: number
  monto_mensual: number
  notas: string | null
  activo: boolean
  created_by: string | null
  created_at: string
}

export interface ParesPayment {
  id: string
  contract_id: string
  anio: number
  mes: number
  pagado: boolean
  metodo_pago: string | null
  pagado_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Profile>
        Relationships: []
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Vehicle, 'id' | 'created_at'>>
        Relationships: []
      }
      expenses: {
        Row: Expense
        Insert: Omit<Expense, 'id' | 'created_at'>
        Update: Partial<Expense>
        Relationships: []
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at'>>
        Relationships: []
      }
      sales: {
        Row: Sale
        Insert: Omit<Sale, 'id' | 'created_at'>
        Update: Partial<Sale>
        Relationships: []
      }
      price_history: {
        Row: PriceHistory
        Insert: Omit<PriceHistory, 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
    }
    Views: {
      sales_with_details: {
        Row: SaleWithDetails
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
