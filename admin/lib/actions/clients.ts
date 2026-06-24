'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ClientFormData } from '@/lib/validations/client'
import type { ActionResult, Client } from '@/types'

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', nombre: 'Carlos Rodríguez',  documento: '3.456.789', telefono: '0985 111 222', email: 'carlos@gmail.com',  ciudad: 'Encarnación',   notas: 'Cliente frecuente', created_at: '2024-06-10T10:00:00Z', updated_at: '2024-06-10T10:00:00Z' },
  { id: 'c2', nombre: 'María García',       documento: '4.567.890', telefono: '0981 234 567', email: 'maria@yahoo.com',   ciudad: 'Capitán Miranda', notas: null,               created_at: '2024-08-22T10:00:00Z', updated_at: '2024-08-22T10:00:00Z' },
  { id: 'c3', nombre: 'Laura Martínez',     documento: '5.678.901', telefono: '0982 333 444', email: null,                ciudad: 'Hohenau',          notas: 'Interesada en SUV', created_at: '2024-09-05T10:00:00Z', updated_at: '2024-09-05T10:00:00Z' },
  { id: 'c4', nombre: 'Diego Ferreira',     documento: '6.789.012', telefono: '0983 555 666', email: 'diego@email.com',   ciudad: 'Encarnación',   notas: null,               created_at: '2024-10-14T10:00:00Z', updated_at: '2024-10-14T10:00:00Z' },
  { id: 'c5', nombre: 'Ana Sánchez',        documento: '7.890.123', telefono: '0984 777 888', email: 'ana@hotmail.com',   ciudad: 'Cambyretá',      notas: null,               created_at: '2024-11-01T10:00:00Z', updated_at: '2024-11-01T10:00:00Z' },
  { id: 'c6', nombre: 'Roberto Núñez',      documento: '8.901.234', telefono: '0986 999 000', email: null,                ciudad: 'Natalio',           notas: 'Prefiere pick-ups', created_at: '2024-12-08T10:00:00Z', updated_at: '2024-12-08T10:00:00Z' },
]

export async function getClients() { return MOCK_CLIENTS }
export async function getClient(id: string) { return MOCK_CLIENTS.find(c => c.id === id) ?? null }
export async function createClient_(formData: ClientFormData): Promise<ActionResult<Client>> { return { data: MOCK_CLIENTS[0] } }
export async function updateClient(id: string, formData: ClientFormData): Promise<ActionResult<Client>> { return { data: MOCK_CLIENTS[0] } }
export async function deleteClient(id: string): Promise<ActionResult> { redirect('/clientes') }

export async function getClientSales(clientId: string) {
  return [
    { id: 's1', vehicle_id: 'v5', client_id: clientId, precio_final: 140000000, fecha_venta: '2024-12-10', comision: 0, vendedor_id: null, notas: null, created_at: '2024-12-10T10:00:00Z', marca: 'Honda', modelo: 'Civic', anio: 2022, precio_compra: 110000000, client_nombre: 'Cliente', client_telefono: null, vendedor_nombre: 'Admin', ganancia: 29350000 },
  ]
}
