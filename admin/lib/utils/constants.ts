export const MARCAS = [
  'Toyota','Ford','Chevrolet','Honda','Hyundai','Kia','Volkswagen',
  'Nissan','Mitsubishi','Suzuki','Renault','Peugeot','Fiat','Jeep','RAM','Otra',
]

export const EXPENSE_TYPES = [
  { value: 'mecanica',       label: 'Mecánica' },
  { value: 'limpieza',       label: 'Limpieza' },
  { value: 'pintura',        label: 'Pintura' },
  { value: 'documentacion',  label: 'Documentación' },
  { value: 'otros',          label: 'Otros' },
] as const

export const VEHICLE_STATES = [
  { value: 'Disponible', label: 'Disponible', color: 'success' },
  { value: 'Reservado',  label: 'Reservado',  color: 'warning' },
  { value: 'Vendido',    label: 'Vendido',    color: 'error'   },
] as const

export const COLORS_VEHICULO = [
  'Blanco','Negro','Gris','Plata','Rojo','Azul','Verde','Amarillo','Naranja','Marrón','Otro',
]
