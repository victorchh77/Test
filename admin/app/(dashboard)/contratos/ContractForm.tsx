'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2, Download, FileText, AlertTriangle, Sparkles, FileStack } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { generarContrato, generarPagares } from '@/lib/actions/contracts'
import { construirContrato, validarMontosContrato, type ContratoCuota, type ContratoInput } from '@/lib/contracts/plantillas'
import { formatCurrency } from '@/lib/utils/format'
import type { Vehicle, Client } from '@/types'

interface Props {
  vehicles: (Vehicle & { mainPhotoUrl?: string | null })[]
  clients: Client[]
}

const VENDEDOR_DEFAULT = {
  nombre: 'VICTOR CHAVEZ LEZCANO',
  nacionalidad: 'paraguayo',
  estadoCivil: 'soltero',
  ci: '3.209.608',
  domicilio: 'Ruta Sexta Km. 3 de esta ciudad',
}

const TIPOS_VEHICULO = ['AUTOMOVIL', 'CAMIONETA', 'FURGONETA', 'CAMION', 'MOTOCICLETA', 'MICROBUS', 'OTRO']

let cuotaKeySeq = 0
interface CuotaRow extends ContratoCuota { key: number }

function hoyIso(): string {
  return new Date().toISOString().split('T')[0]
}

function base64ToBlob(base64: string, mime: string): Blob {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function descargarDocx(base64: string, filename: string) {
  const blob = base64ToBlob(base64, DOCX_MIME)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Cada pagaré necesita su posición (1-based) y el total *dentro de su propio grupo* (cuota o refuerzo). */
function conNumeroYTotal(cuotas: CuotaRow[]) {
  const porTipo = { cuota: cuotas.filter(c => c.tipo === 'cuota').length, refuerzo: cuotas.filter(c => c.tipo === 'refuerzo').length }
  const contador = { cuota: 0, refuerzo: 0 }
  return cuotas.map(c => {
    contador[c.tipo]++
    return { tipo: c.tipo, numero: contador[c.tipo], total: porTipo[c.tipo], monto: c.monto, fecha: c.fecha }
  })
}

export function ContractForm({ vehicles, clients }: Props) {
  const [ciudad, setCiudad] = useState('Encarnación')
  const [fecha, setFecha] = useState(hoyIso())

  const [vendedor, setVendedor] = useState(VENDEDOR_DEFAULT)

  const [clientId, setClientId] = useState('')
  const [comprador, setComprador] = useState({ nombre: '', nacionalidad: 'paraguayo', estadoCivil: 'soltero', ci: '', domicilio: '' })

  const [vehicleId, setVehicleId] = useState('')
  const [vehiculo, setVehiculo] = useState({ marca: '', tipo: 'AUTOMOVIL', modelo: '', color: '', anio: new Date().getFullYear(), chasis: '', matricula: '' })

  const [moneda, setMoneda] = useState<'Gs' | 'USD'>('Gs')
  const [precioTotal, setPrecioTotal] = useState('')

  const [esPermuta, setEsPermuta] = useState(false)
  const [permutaDescripcion, setPermutaDescripcion] = useState('')
  const [permutaValor, setPermutaValor] = useState('')

  const [entradaEfectivo, setEntradaEfectivo] = useState('')

  const [financiado, setFinanciado] = useState(false)
  const [cuotas, setCuotas] = useState<CuotaRow[]>([])
  const [registrarEnPlanillaPagares, setRegistrarEnPlanillaPagares] = useState(true)

  // Generador rápido de cuotas mensuales iguales
  const [genCantidad, setGenCantidad] = useState('12')
  const [genMonto, setGenMonto] = useState('')
  const [genPrimerVenc, setGenPrimerVenc] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [okMsg, setOkMsg] = useState('')

  function onSelectClient(id: string) {
    setClientId(id)
    const c = clients.find(x => x.id === id)
    if (c) setComprador(prev => ({ ...prev, nombre: c.nombre, ci: c.documento || prev.ci }))
  }

  function onSelectVehicle(id: string) {
    setVehicleId(id)
    const v = vehicles.find(x => x.id === id)
    if (v) {
      setVehiculo(prev => ({
        ...prev,
        marca: v.marca,
        modelo: v.modelo,
        color: v.color || '',
        anio: v.anio,
        chasis: v.numero_chassis || '',
      }))
      setMoneda(v.moneda)
      setPrecioTotal(String(v.precio_venta))
    }
  }

  function addCuota(tipo: 'cuota' | 'refuerzo') {
    setCuotas(prev => [...prev, { key: cuotaKeySeq++, tipo, monto: 0, fecha: null }])
  }
  function removeCuota(key: number) {
    setCuotas(prev => prev.filter(c => c.key !== key))
  }
  function updateCuota(key: number, patch: Partial<CuotaRow>) {
    setCuotas(prev => prev.map(c => c.key === key ? { ...c, ...patch } : c))
  }

  function generarCuotasMensuales() {
    const cant = parseInt(genCantidad)
    const monto = parseInt(genMonto)
    if (!cant || cant <= 0 || !monto || monto <= 0) { setError('Completá cantidad y monto para generar las cuotas'); return }
    setError('')
    const rows: CuotaRow[] = []
    for (let i = 0; i < cant; i++) {
      let fecha: string | null = null
      if (genPrimerVenc) {
        const d = new Date(`${genPrimerVenc}T00:00:00`)
        d.setMonth(d.getMonth() + i)
        fecha = d.toISOString().split('T')[0]
      }
      rows.push({ key: cuotaKeySeq++, tipo: 'cuota', monto, fecha })
    }
    setCuotas(prev => [...prev.filter(c => c.tipo === 'refuerzo'), ...rows])
  }

  const contratoInput: ContratoInput = useMemo(() => ({
    ciudad, fecha, vendedor, comprador, vehiculo,
    moneda, precioTotal: parseInt(precioTotal) || 0,
    esPermuta, permutaDescripcion: permutaDescripcion || null, permutaValor: parseInt(permutaValor) || null,
    entradaEfectivo: parseInt(entradaEfectivo) || null,
    financiado, cuotas: cuotas.map(c => ({ tipo: c.tipo, monto: c.monto, fecha: c.fecha })),
  }), [ciudad, fecha, vendedor, comprador, vehiculo, moneda, precioTotal, esPermuta, permutaDescripcion, permutaValor, entradaEfectivo, financiado, cuotas])

  const preview = useMemo(() => construirContrato(contratoInput), [contratoInput])
  const montosError = useMemo(() => validarMontosContrato(contratoInput), [contratoInput])

  const camposBasicosOk = comprador.nombre.trim() && comprador.ci.trim() && comprador.domicilio.trim()
    && vehiculo.marca.trim() && vehiculo.modelo.trim() && vehiculo.chasis.trim() && parseInt(precioTotal) > 0

  async function handleGenerar() {
    setError(''); setOkMsg('')
    if (!camposBasicosOk) { setError('Completá los datos del comprador, el vehículo y el precio total.'); return }
    if (montosError) { setError(montosError); return }
    setLoading(true)
    const res = await generarContrato({
      ciudad, fecha, vendedor, comprador, vehiculo,
      moneda, precioTotal: parseInt(precioTotal),
      esPermuta, permutaDescripcion: permutaDescripcion || null, permutaValor: parseInt(permutaValor) || null,
      entradaEfectivo: parseInt(entradaEfectivo) || null,
      financiado, cuotas: cuotas.map(c => ({ tipo: c.tipo, monto: c.monto, fecha: c.fecha })),
      registrarEnPlanillaPagares: financiado && registrarEnPlanillaPagares,
      vehicleId: vehicleId || null,
    })
    setLoading(false)
    if (res.error) { setError(res.error); return }
    if (!res.data) return

    descargarDocx(res.data.base64, res.data.filename)
    setOkMsg(financiado && registrarEnPlanillaPagares
      ? 'Contrato descargado y registrado en Planilla de Pagarés.'
      : 'Contrato descargado.')
  }

  const [loadingPagares, setLoadingPagares] = useState(false)
  const cuotasSinFecha = cuotas.some(c => !c.fecha)

  async function handleGenerarPagares() {
    setError(''); setOkMsg('')
    if (!comprador.nombre.trim() || !comprador.ci.trim() || !comprador.domicilio.trim()) {
      setError('Completá nombre, cédula y domicilio del comprador (es el deudor de los pagarés).')
      return
    }
    if (cuotas.length === 0) { setError('Cargá al menos una cuota para generar los pagarés.'); return }
    if (cuotasSinFecha) { setError('Todas las cuotas necesitan fecha de vencimiento para generar los pagarés (no admite "a convenir").'); return }

    setLoadingPagares(true)
    const res = await generarPagares({
      acreedor: vendedor.nombre,
      deudor: { nombre: comprador.nombre, domicilio: comprador.domicilio, ci: comprador.ci },
      fechaEmision: fecha,
      moneda,
      cuotas: conNumeroYTotal(cuotas),
    })
    setLoadingPagares(false)
    if (res.error) { setError(res.error); return }
    if (!res.data) return

    descargarDocx(res.data.base64, res.data.filename)
    setOkMsg(`${cuotas.length} pagaré${cuotas.length !== 1 ? 's' : ''} descargado${cuotas.length !== 1 ? 's' : ''}.`)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <div className="flex flex-col gap-5">
        {/* Tipo de venta */}
        <Card>
          <CardHeader title="Tipo de venta" />
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${esPermuta ? 'border-orange/50 bg-orange/[0.06]' : 'border-border bg-card-elevated/40 hover:border-border-bright'}`}>
              <input type="checkbox" checked={esPermuta} onChange={e => setEsPermuta(e.target.checked)} className="w-4 h-4 rounded accent-orange" />
              <span className="text-sm font-medium text-textprim">Incluye permuta</span>
            </label>
            <label className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${financiado ? 'border-orange/50 bg-orange/[0.06]' : 'border-border bg-card-elevated/40 hover:border-border-bright'}`}>
              <input type="checkbox" checked={financiado} onChange={e => setFinanciado(e.target.checked)} className="w-4 h-4 rounded accent-orange" />
              <span className="text-sm font-medium text-textprim">Financiado (con pagarés)</span>
            </label>
          </div>
          <p className="text-xs text-textsec mt-2.5">
            {!esPermuta && !financiado && 'Venta al contado: se cobra el total en efectivo al firmar.'}
            {esPermuta && !financiado && 'Permuta: parte o todo el precio se cubre con un vehículo entregado por el comprador.'}
            {!esPermuta && financiado && 'Financiado: el saldo se abona mediante pagarés con vencimientos.'}
            {esPermuta && financiado && 'Permuta + financiado: se entrega un vehículo como parte de pago y el saldo se financia con pagarés.'}
          </p>
        </Card>

        {/* Partes */}
        <Card>
          <CardHeader title="Vendedor" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre completo" value={vendedor.nombre} onChange={e => setVendedor(v => ({ ...v, nombre: e.target.value.toUpperCase() }))} />
            <Input label="Cédula de Identidad" value={vendedor.ci} onChange={e => setVendedor(v => ({ ...v, ci: e.target.value }))} />
            <Input label="Nacionalidad" value={vendedor.nacionalidad} onChange={e => setVendedor(v => ({ ...v, nacionalidad: e.target.value }))} />
            <Input label="Estado civil" value={vendedor.estadoCivil} onChange={e => setVendedor(v => ({ ...v, estadoCivil: e.target.value }))} />
            <Input label="Domicilio" className="col-span-2" value={vendedor.domicilio} onChange={e => setVendedor(v => ({ ...v, domicilio: e.target.value }))} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Comprador" />
          {clients.length > 0 && (
            <div className="mb-3">
              <Select
                label="Cargar desde clientes (opcional)"
                value={clientId}
                onChange={e => onSelectClient(e.target.value)}
                options={clients.map(c => ({ value: c.id, label: c.nombre }))}
                placeholder="Cliente nuevo / escribir a mano"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre completo *" value={comprador.nombre} onChange={e => setComprador(v => ({ ...v, nombre: e.target.value.toUpperCase() }))} />
            <Input label="Cédula de Identidad *" value={comprador.ci} onChange={e => setComprador(v => ({ ...v, ci: e.target.value }))} />
            <Input label="Nacionalidad" value={comprador.nacionalidad} onChange={e => setComprador(v => ({ ...v, nacionalidad: e.target.value }))} />
            <Input label="Estado civil" value={comprador.estadoCivil} onChange={e => setComprador(v => ({ ...v, estadoCivil: e.target.value }))} />
            <Input label="Domicilio *" className="col-span-2" value={comprador.domicilio} onChange={e => setComprador(v => ({ ...v, domicilio: e.target.value }))} placeholder="Ciudad, barrio..." />
          </div>
        </Card>

        {/* Vehículo */}
        <Card>
          <CardHeader title="Vehículo" />
          {vehicles.length > 0 && (
            <div className="mb-3">
              <Select
                label="Cargar desde inventario (opcional)"
                value={vehicleId}
                onChange={e => onSelectVehicle(e.target.value)}
                options={vehicles.map(v => ({ value: v.id, label: `${v.marca} ${v.modelo} ${v.anio}${v.color ? ' · ' + v.color : ''}` }))}
                placeholder="Vehículo fuera de stock / escribir a mano"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca *" value={vehiculo.marca} onChange={e => setVehiculo(v => ({ ...v, marca: e.target.value.toUpperCase() }))} />
            <Select label="Tipo" value={vehiculo.tipo} onChange={e => setVehiculo(v => ({ ...v, tipo: e.target.value }))} options={TIPOS_VEHICULO.map(t => ({ value: t, label: t }))} />
            <Input label="Modelo *" value={vehiculo.modelo} onChange={e => setVehiculo(v => ({ ...v, modelo: e.target.value.toUpperCase() }))} />
            <Input label="Color" value={vehiculo.color} onChange={e => setVehiculo(v => ({ ...v, color: e.target.value.toUpperCase() }))} />
            <Input label="Año" type="number" value={vehiculo.anio} onChange={e => setVehiculo(v => ({ ...v, anio: parseInt(e.target.value) || v.anio }))} />
            <Input label="Matrícula (opcional)" value={vehiculo.matricula} onChange={e => setVehiculo(v => ({ ...v, matricula: e.target.value.toUpperCase() }))} />
            <Input label="N.º de Chasis *" className="col-span-2" value={vehiculo.chasis} onChange={e => setVehiculo(v => ({ ...v, chasis: e.target.value.toUpperCase() }))} />
          </div>
        </Card>

        {/* Precio y forma de pago */}
        <Card>
          <CardHeader title="Precio y forma de pago" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Select label="Moneda" value={moneda} onChange={e => setMoneda(e.target.value as 'Gs' | 'USD')}
              options={[{ value: 'Gs', label: 'Guaraníes (Gs.)' }, { value: 'USD', label: 'Dólares (USD)' }]} />
            <Input label="Precio total *" type="number" value={precioTotal} onChange={e => setPrecioTotal(e.target.value)} placeholder="0" />
          </div>

          {esPermuta && (
            <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-border/60">
              <Input label="Vehículo entregado en permuta" className="col-span-2"
                value={permutaDescripcion} onChange={e => setPermutaDescripcion(e.target.value)}
                placeholder="Ej: TOYOTA, AUTOMOVIL, COROLLA, GRIS, AÑO 2010, CHASIS N.º ..." />
              <Input label="Valor acordado del vehículo" type="number" value={permutaValor} onChange={e => setPermutaValor(e.target.value)} placeholder="0" />
              <Input label="Efectivo adicional (si hay)" type="number" value={entradaEfectivo} onChange={e => setEntradaEfectivo(e.target.value)} placeholder="0" />
            </div>
          )}

          {!esPermuta && (
            <div className="pt-3 border-t border-border/60">
              <Input label={financiado ? 'Entrega en efectivo (si hay)' : 'Monto recibido en efectivo'} type="number"
                value={entradaEfectivo} onChange={e => setEntradaEfectivo(e.target.value)} placeholder="0" />
            </div>
          )}

          {financiado && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-textprim">Cuotas / pagarés</p>
                <p className="text-xs text-textsec">
                  Total cuotas: {formatCurrency(cuotas.reduce((a, c) => a + c.monto, 0), moneda)}
                </p>
              </div>

              {/* Generador rápido */}
              <div className="flex items-end gap-2 mb-3 bg-card-elevated/40 border border-border rounded-xl p-3">
                <Input label="Cantidad" type="number" value={genCantidad} onChange={e => setGenCantidad(e.target.value)} className="w-20" />
                <Input label="Monto c/u" type="number" value={genMonto} onChange={e => setGenMonto(e.target.value)} className="w-32" />
                <Input label="1er vencimiento" type="date" value={genPrimerVenc} onChange={e => setGenPrimerVenc(e.target.value)} className="w-40" />
                <Button type="button" variant="secondary" size="sm" onClick={generarCuotasMensuales}>
                  <Sparkles className="w-3.5 h-3.5" /> Generar
                </Button>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar-thin">
                {cuotas.map(c => (
                  <div key={c.key} className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-textsec uppercase w-14 flex-shrink-0">{c.tipo}</span>
                    <Input type="number" value={c.monto || ''} onChange={e => updateCuota(c.key, { monto: parseInt(e.target.value) || 0 })} placeholder="Monto" className="flex-1" />
                    <Input type="date" value={c.fecha ?? ''} onChange={e => updateCuota(c.key, { fecha: e.target.value || null })} className="w-40" />
                    <button type="button" onClick={() => removeCuota(c.key)} className="p-2 text-textsec hover:text-error transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {cuotas.length === 0 && <p className="text-xs text-textsec text-center py-3">Sin cuotas cargadas todavía.</p>}
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => addCuota('cuota')}><Plus className="w-3.5 h-3.5" /> Cuota</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => addCuota('refuerzo')}><Plus className="w-3.5 h-3.5" /> Refuerzo</Button>
              </div>

              <label className="flex items-center gap-2.5 mt-4 cursor-pointer">
                <input type="checkbox" checked={registrarEnPlanillaPagares} onChange={e => setRegistrarEnPlanillaPagares(e.target.checked)} className="w-4 h-4 rounded accent-orange" />
                <span className="text-xs text-textsec">Registrar automáticamente en Planilla de Pagarés al generar</span>
              </label>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Lugar y fecha" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} />
            <Input label="Fecha del contrato" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
        </Card>

        {(error || montosError) && (
          <p className="text-sm text-error bg-error/10 border border-error/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error || montosError}
          </p>
        )}
        {okMsg && !error && (
          <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{okMsg}</p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerar} loading={loading} disabled={!camposBasicosOk}>
            <Download className="w-4 h-4" /> Generar y descargar contrato (.docx)
          </Button>
          {financiado && (
            <div className="flex flex-col gap-1">
              <Button onClick={handleGenerarPagares} loading={loadingPagares} disabled={cuotas.length === 0} variant="secondary">
                <FileStack className="w-4 h-4" /> Generar pagarés (.docx)
              </Button>
              {cuotasSinFecha && cuotas.length > 0 && (
                <p className="text-[11px] text-textsec">Faltan fechas de vencimiento en algunas cuotas.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vista previa */}
      <div className="lg:sticky lg:top-5">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-orange" />
            <h3 className="font-semibold text-textprim text-sm">Vista previa</h3>
          </div>
          <div className="max-h-[75vh] overflow-y-auto scrollbar-thin pr-2 flex flex-col gap-3 text-[13px] leading-relaxed text-textsec">
            {preview.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-center font-bold text-textprim text-sm' : 'text-justify'}>
                {p.titulo && <span className="font-bold text-textprim">{p.titulo} </span>}
                {p.texto}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
