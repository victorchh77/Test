'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Download, Plus, X, Move, ZoomIn, RotateCcw, Search, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* Colores del FLYER (arte exportado — independiente del tema de la app) */
const ORANGE = '#F97316'
const ORANGE2 = '#ea580c'

interface Format { id: string; label: string; sub: string; w: number; h: number }
interface VehicleOption {
  id: string; marca: string; modelo: string; anio: number
  km: number; km_publico: string | null; precio_venta: number
}
interface FlyerData {
  marca: string; modelo: string; version: string; anio: string; km: string
  precio: string; moneda: string; financiado: boolean; partePago: boolean
  whatsapp: string; ciudad: string; features: string[]
}
type StrKey = 'marca' | 'modelo' | 'version' | 'anio' | 'km' | 'precio' | 'moneda' | 'whatsapp' | 'ciudad'
type BoolKey = 'financiado' | 'partePago'

const FORMATS: Format[] = [
  { id: 'story',     label: 'Story', sub: '9:16', w: 420, h: 748 },
  { id: 'feed',      label: 'Feed',  sub: '1:1',  w: 600, h: 600 },
  { id: 'landscape', label: 'Post',  sub: '4:5',  w: 500, h: 625 },
]

const TABS = [
  { id: 'vehiculo', label: 'Vehículo' },
  { id: 'precio',   label: 'Precio'   },
  { id: 'extras',   label: 'Extras'   },
]

function geom(fmt: Format) {
  const W = fmt.w, H = fmt.h
  const isFeed = fmt.id === 'feed'
  const isStory = fmt.id === 'story'
  const photoRatio = isFeed ? 0.40 : 0.45
  const photoH = Math.floor(H * photoRatio)
  const PAD = Math.floor(W * 0.05)
  return { W, H, photoH, PAD, isFeed, isStory }
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word
    if (ctx.measureText(test).width > maxWidth) { if (cur) lines.push(cur); cur = word }
    else cur = test
  }
  if (cur) lines.push(cur)
  return lines
}

export default function FlyersPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [fmt, setFmt] = useState<Format>(FORMATS[0])
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
  const [activeTab, setActiveTab] = useState('vehiculo')
  const [newFeat, setNewFeat] = useState('')

  // Vehicle selector
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [showVehicleList, setShowVehicleList] = useState(false)
  const [selectedVehicleName, setSelectedVehicleName] = useState('')

  // Posicionamiento de la foto (tipo Canva)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; sf: number } | null>(null)

  const [data, setData] = useState<FlyerData>({
    marca: 'TOYOTA', modelo: 'HILUX', version: 'SRV 4x4',
    anio: '2014', km: '154.000', precio: '185.000.000',
    moneda: 'Gs', financiado: true, partePago: true,
    whatsapp: '+595 971 XXX XXX', ciudad: 'Encarnación',
    features: [
      'Motor 3.0 Turbo Intercooler 4x4',
      'Mecánico Full',
      'Tapizado en cuero',
      'Protector de carrocería y carpa',
      'Cubiertas nuevas',
      'Chapa Mercosur',
    ],
  })

  const updStr = (k: StrKey, v: string) => setData(d => ({ ...d, [k]: v }))
  const updBool = (k: BoolKey, v: boolean) => setData(d => ({ ...d, [k]: v }))
  const updFeatures = (v: string[]) => setData(d => ({ ...d, features: v }))
  const addFeat = () => { if (newFeat.trim()) { updFeatures([...data.features, newFeat.trim()]); setNewFeat('') } }
  const removeFeat = (i: number) => updFeatures(data.features.filter((_, idx) => idx !== i))

  useEffect(() => {
    const img = new Image()
    img.onload = () => setLogoImg(img)
    img.src = '/logo.png'
  }, [])

  useEffect(() => {
    setLoadingVehicles(true)
    const supabase = createClient()
    supabase
      .from('vehicles')
      .select('id, marca, modelo, anio, km, km_publico, precio_venta')
      .not('estado', 'eq', 'Vendido')
      .order('marca', { ascending: true })
      .then(({ data }) => {
        setVehicles((data ?? []) as VehicleOption[])
        setLoadingVehicles(false)
      })
  }, [])

  const filteredVehicles = vehicles.filter(v => {
    if (!vehicleSearch.trim()) return true
    const q = vehicleSearch.toLowerCase()
    return `${v.marca} ${v.modelo} ${v.anio}`.toLowerCase().includes(q)
  }).slice(0, 8)

  function loadVehicle(v: VehicleOption) {
    updStr('marca', v.marca.toUpperCase())
    updStr('modelo', v.modelo.toUpperCase())
    updStr('anio', String(v.anio))
    updStr('km', v.km_publico || v.km.toLocaleString('es-PY'))
    updStr('precio', v.precio_venta.toLocaleString('es-PY'))
    updStr('version', '')
    setSelectedVehicleName(`${v.marca} ${v.modelo} ${v.anio}`)
    setVehicleSearch('')
    setShowVehicleList(false)
  }

  // Geometría de la foto para el dibujo y el clamp del arrastre
  const photoDraw = useCallback(() => {
    if (!photoImg) return null
    const { W, photoH } = geom(fmt)
    const base = Math.max(W / photoImg.naturalWidth, photoH / photoImg.naturalHeight)
    const sc = base * zoom
    const drawW = photoImg.naturalWidth * sc
    const drawH = photoImg.naturalHeight * sc
    return { W, photoH, drawW, drawH }
  }, [photoImg, fmt, zoom])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { W, H, photoH, PAD, isStory, isFeed } = geom(fmt)
    canvas.width = W * 2; canvas.height = H * 2
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(2, 2)

    /* ── FOTO ─────────────────────────────────────────────── */
    ctx.save()
    ctx.beginPath(); ctx.rect(0, 0, W, photoH); ctx.clip()
    if (photoImg && photoLoaded) {
      const pd = photoDraw()!
      const dx = clamp((W - pd.drawW) / 2 + offset.x, W - pd.drawW, 0)
      const dy = clamp((photoH - pd.drawH) / 2 + offset.y, photoH - pd.drawH, 0)
      ctx.drawImage(photoImg, dx, dy, pd.drawW, pd.drawH)
    } else {
      ctx.fillStyle = '#11151c'; ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(249,115,22,0.06)'; ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(255,255,255,0.32)'
      ctx.textAlign = 'center'
      ctx.font = `${W * 0.055}px sans-serif`
      ctx.fillText('Foto del vehículo', W / 2, photoH / 2 - 4)
      ctx.font = `${W * 0.036}px sans-serif`
      ctx.fillText('Subila desde el panel izquierdo', W / 2, photoH / 2 + 22)
    }
    ctx.restore()

    // Degradado inferior para fundir la foto con la sección de info
    const fade = ctx.createLinearGradient(0, photoH * 0.6, 0, photoH)
    fade.addColorStop(0, 'rgba(10,12,16,0)')
    fade.addColorStop(1, 'rgba(10,12,16,0.95)')
    ctx.fillStyle = fade; ctx.fillRect(0, 0, W, photoH)

    // Logo (marca de agua) abajo-izquierda de la foto
    if (logoImg) {
      const lW = W * 0.24
      const lH = lW * (logoImg.naturalHeight / logoImg.naturalWidth)
      ctx.save(); ctx.globalAlpha = 0.9
      ctx.drawImage(logoImg, PAD, photoH - lH - PAD * 0.5, lW, lH)
      ctx.restore()
    }

    /* ── SECCIÓN INFO (dark premium) ──────────────────────── */
    const infoGrad = ctx.createLinearGradient(0, photoH, 0, H)
    infoGrad.addColorStop(0, '#0B0E13')
    infoGrad.addColorStop(0.5, '#0F141B')
    infoGrad.addColorStop(1, '#141A23')
    ctx.fillStyle = infoGrad; ctx.fillRect(0, photoH, W, H - photoH)
    // Línea de acento naranja entre foto e info
    ctx.fillStyle = ORANGE; ctx.fillRect(0, photoH, W, 3)

    const ctaH = Math.floor(W * 0.122)
    const ctaY = H - ctaH - PAD * 0.7
    // Reserve a brand-footer strip between features and WA button
    const footerH = Math.floor(W * 0.058)
    const footerY = ctaY - footerH - Math.floor(W * 0.016)
    const maxY = footerY - Math.floor(W * 0.014)

    let y = photoH + PAD + Math.floor(W * 0.055)
    ctx.textAlign = 'left'

    // Marca + Modelo
    ctx.fillStyle = '#fff'
    ctx.font = `900 ${Math.floor(W * 0.078)}px Arial`
    ctx.fillText(`${data.marca} ${data.modelo}`.toUpperCase(), PAD, y)
    y += Math.floor(W * 0.058)

    // Subtítulo: Año • Versión • Km
    const sub = [data.anio, data.version, data.km ? `${data.km} km` : '']
      .filter(Boolean).join('   •   ')
    ctx.fillStyle = 'rgba(255,255,255,0.66)'
    ctx.font = `600 ${Math.floor(W * 0.037)}px Arial`
    ctx.fillText(sub, PAD, y)
    y += Math.floor(W * 0.04)

    // ── Tarjeta de precio (proporción consistente) ──
    const cardH = Math.floor(W * 0.135)
    roundRect(ctx, PAD, y, W - PAD * 2, cardH, 12)
    ctx.fillStyle = 'rgba(249,115,22,0.12)'; ctx.fill()
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(249,115,22,0.5)'; ctx.stroke()

    const cx = PAD + Math.floor(W * 0.04)
    ctx.fillStyle = 'rgba(255,255,255,0.62)'
    ctx.font = `700 ${Math.floor(W * 0.027)}px Arial`
    try { ctx.letterSpacing = '1.5px' } catch {}
    ctx.fillText('PRECIO CONTADO', cx, y + cardH * 0.32)
    try { ctx.letterSpacing = '0px' } catch {}

    // Precio: número grande + moneda chica, alineados de forma prolija
    ctx.fillStyle = ORANGE
    const priceFont = Math.floor(W * 0.07)
    ctx.font = `900 ${priceFont}px Arial`
    ctx.fillText(data.precio, cx, y + cardH * 0.8)
    const pw = ctx.measureText(data.precio).width
    ctx.fillStyle = 'rgba(249,115,22,0.85)'
    ctx.font = `700 ${Math.floor(W * 0.04)}px Arial`
    ctx.fillText(` ${data.moneda}`, cx + pw, y + cardH * 0.8)

    y += cardH + Math.floor(W * 0.033)

    // Financiación
    if (data.financiado || data.partePago) {
      const sentence = data.financiado && data.partePago
        ? 'Financiamos y aceptamos tu vehículo como parte de pago.'
        : data.financiado
        ? 'Financiamos tu compra a tu medida.'
        : 'Aceptamos vehículos como parte de pago.'
      const fFont = Math.floor(W * 0.030)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.font = `500 ${fFont}px Arial`
      wrapText(ctx, sentence, W - PAD * 2).forEach(line => {
        if (y < maxY) { ctx.fillText(line, PAD, y); y += Math.floor(fFont * 1.5) }
      })
      y += Math.floor(W * 0.006)
    }

    // Divisor — justo debajo del texto de financiamiento
    if (y < maxY - 20) {
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
      y += Math.floor(W * 0.030)
    }

    // Características — espaciado adaptativo para llenar el espacio disponible
    const fSize = Math.floor(W * (isStory ? 0.034 : isFeed ? 0.030 : 0.032))
    const textX  = PAD + Math.floor(fSize * 1.4)
    const availForFeatures = maxY - y
    const fLineHBase = Math.floor(fSize * 1.62)
    const fLineHMax  = Math.floor(fSize * 2.45)
    const fLineH = data.features.length > 0
      ? Math.min(fLineHMax, Math.max(fLineHBase, Math.ceil(availForFeatures / data.features.length)))
      : fLineHBase
    for (const feat of data.features) {
      const wrapped = wrapText(ctx, feat, W - textX - PAD)
      if (y + fLineH * wrapped.length > maxY) break
      ctx.fillStyle = ORANGE
      ctx.font = `900 ${fSize + 2}px Arial`
      ctx.fillText('•', PAD, y)
      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      ctx.font = `400 ${fSize}px Arial`
      wrapped.forEach((line, li) => ctx.fillText(line, textX, y + li * fLineH))
      y += fLineH * wrapped.length
    }

    // Footer de marca — siempre visible, elimina el espacio muerto
    ctx.fillStyle = 'rgba(249,115,22,0.06)'
    ctx.fillRect(0, footerY, W, footerH)
    ctx.strokeStyle = 'rgba(249,115,22,0.22)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, footerY); ctx.lineTo(W, footerY); ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.font = `700 ${Math.floor(W * 0.026)}px Arial`
    ctx.fillText('VH GROUP S.R.L.', PAD, footerY + footerH * 0.63)
    if (data.ciudad) {
      const vhW = ctx.measureText('VH GROUP S.R.L.').width
      ctx.fillStyle = 'rgba(255,255,255,0.20)'
      ctx.font = `400 ${Math.floor(W * 0.024)}px Arial`
      ctx.fillText(`  ·  ${data.ciudad}`, PAD + vhW, footerY + footerH * 0.63)
    }

    // CTA WhatsApp — premium dark with green accents
    roundRect(ctx, PAD, ctaY, W - PAD * 2, ctaH, 16)
    ctx.fillStyle = '#0D1812'
    ctx.fill()
    ctx.strokeStyle = 'rgba(37,211,102,0.45)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Green circle "WA" badge on left
    const circR = Math.floor(ctaH * 0.30)
    const circX = PAD + Math.floor(ctaH * 0.58)
    const circY = ctaY + Math.floor(ctaH * 0.50)
    ctx.beginPath(); ctx.arc(circX, circY, circR, 0, Math.PI * 2)
    ctx.fillStyle = '#25D366'; ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `900 ${Math.floor(circR * 0.88)}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText('WA', circX, circY + Math.floor(circR * 0.36))

    // Text block to the right of badge
    const txtX = PAD + Math.floor(ctaH * 1.18)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#25D366'
    ctx.font = `600 ${Math.floor(W * 0.027)}px Arial`
    ctx.fillText('WhatsApp', txtX, ctaY + Math.floor(ctaH * 0.40))
    ctx.fillStyle = '#ffffff'
    ctx.font = `800 ${Math.floor(W * 0.038)}px Arial`
    ctx.fillText(data.whatsapp, txtX, ctaY + Math.floor(ctaH * 0.76))

    // Barra inferior naranja
    ctx.fillStyle = ORANGE; ctx.fillRect(0, H - 3, W, 3)
  }, [fmt, photoImg, photoLoaded, logoImg, data, offset, zoom, photoDraw])

  useEffect(() => { draw() }, [draw])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => { setPhotoImg(img); setPhotoLoaded(true); setZoom(1); setOffset({ x: 0, y: 0 }) }
    img.src = URL.createObjectURL(file)
  }

  /* ── Arrastrar la foto (reposicionar) ── */
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!photoImg || !photoLoaded) return
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const { photoH } = geom(fmt)
    // Solo iniciar arrastre si el click está sobre la zona de la foto
    const yLogical = ((e.clientY - rect.top) / rect.height) * fmt.h
    if (yLogical > photoH) return
    const sf = fmt.w / rect.width // factor pantalla -> lógico
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y, sf }
    canvas.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current) return
    const pd = photoDraw()
    if (!pd) return
    const nx = drag.current.ox + (e.clientX - drag.current.x) * drag.current.sf
    const ny = drag.current.oy + (e.clientY - drag.current.y) * drag.current.sf
    // Clamp para que la foto siempre cubra el marco
    const halfX = Math.max((pd.drawW - pd.W) / 2, 0)
    const halfY = Math.max((pd.drawH - pd.photoH) / 2, 0)
    setOffset({ x: clamp(nx, -halfX, halfX), y: clamp(ny, -halfY, halfY) })
  }
  const onPointerUp = () => { drag.current = null }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `VHGroup_${data.marca}_${data.modelo}_${data.anio}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const vehicleFields: Array<[string, StrKey]> = [
    ['Marca', 'marca'], ['Modelo', 'modelo'], ['Versión', 'version'], ['Ciudad', 'ciudad'],
  ]
  const anioKmFields: Array<[string, StrKey]> = [['Año', 'anio'], ['Km', 'km']]

  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-textsec mb-1.5'
  const inpCls = 'w-full px-2.5 py-2 rounded-lg bg-bg border border-border text-textprim text-xs outline-none focus:border-orange/60 focus:ring-1 focus:ring-orange/20 transition-colors'

  return (
    <div className="-m-4 sm:-m-6 flex flex-col lg:flex-row overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* ── Panel de controles ── */}
      <div className="w-full lg:w-[300px] lg:min-w-[300px] bg-sidebar border-b lg:border-b-0 lg:border-r border-border flex flex-col overflow-y-auto scrollbar-thin max-h-[45vh] lg:max-h-none">

        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 flex-shrink-0">
          <span className="bg-orange text-white font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wide">VH GROUP</span>
          <span className="text-textsec text-xs">Generador de Flyers</span>
        </div>

        {/* Formato */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className={labelCls}>Formato</div>
          <div className="flex gap-1.5">
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => setFmt(f)}
                className={`flex-1 py-1.5 px-1 rounded-lg border text-center transition-colors ${
                  fmt.id === f.id ? 'border-orange bg-orange/15 text-orange' : 'border-border bg-card text-textsec hover:border-border-bright'}`}>
                <div className="text-[11px] font-semibold">{f.label}</div>
                <div className="text-[9px] opacity-70">{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Foto + posicionamiento */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className={labelCls}>Foto del vehículo</div>
          <button onClick={() => fileRef.current?.click()}
            className={`w-full py-2.5 rounded-lg border-2 border-dashed text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
              photoLoaded ? 'border-orange/60 bg-orange/10 text-orange' : 'border-border text-textsec hover:border-border-bright'}`}>
            <Upload className="w-3.5 h-3.5" />
            {photoLoaded ? 'Cambiar foto' : 'Subir foto'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

          {photoLoaded && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-textsec">
                <Move className="w-3 h-3" /> Arrastrá la foto en la vista previa para encuadrarla
              </div>
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-textsec flex-shrink-0" />
                <input
                  type="range" min={1} max={3} step={0.01} value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-orange"
                />
                <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }) }}
                  title="Reiniciar encuadre"
                  className="p-1 rounded text-textsec hover:text-orange transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === t.id ? 'border-orange text-orange' : 'border-transparent text-textsec hover:text-textprim'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <div className="px-4 py-3 flex-1">
          {activeTab === 'vehiculo' && (
            <div className="flex flex-col gap-3">
              {/* Vehicle from panel selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelCls}>Cargar del panel</label>
                  {loadingVehicles && <span className="text-[9px] text-textmuted animate-pulse">cargando...</span>}
                </div>
                <div className="relative">
                  <input
                    value={vehicleSearch}
                    onChange={e => { setVehicleSearch(e.target.value); setShowVehicleList(true) }}
                    onFocus={() => setShowVehicleList(true)}
                    onBlur={() => setTimeout(() => setShowVehicleList(false), 150)}
                    placeholder="Buscar marca o modelo..."
                    className={`${inpCls} pr-8`}
                  />
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-textmuted pointer-events-none" />
                  {showVehicleList && filteredVehicles.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-border rounded-lg shadow-xl z-50 max-h-44 overflow-y-auto scrollbar-thin">
                      {filteredVehicles.map(v => (
                        <button
                          key={v.id}
                          onMouseDown={() => loadVehicle(v)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-card/80 transition-colors border-b border-border/40 last:border-0 flex items-center gap-2"
                        >
                          <span className="w-6 h-6 rounded bg-orange/10 text-orange text-[8px] font-black flex items-center justify-center flex-shrink-0">
                            {v.marca.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-textprim">{v.marca} {v.modelo}</div>
                            <div className="text-textmuted text-[9px]">{v.anio} · Gs {v.precio_venta.toLocaleString('es-PY')}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedVehicleName && (
                  <p className="text-[9px] text-success mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {selectedVehicleName}
                  </p>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {vehicleFields.map(([label, key]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input value={data[key]} onChange={e => updStr(key, e.target.value)} className={inpCls} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                {anioKmFields.map(([label, key]) => (
                  <div key={key}>
                    <label className={labelCls}>{label}</label>
                    <input value={data[key]} onChange={e => updStr(key, e.target.value)} className={inpCls} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'precio' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className={labelCls}>Precio</label>
                <input value={data.precio} onChange={e => updStr('precio', e.target.value)} className={inpCls} />
              </div>
              <div>
                <label className={labelCls}>Moneda</label>
                <select value={data.moneda} onChange={e => updStr('moneda', e.target.value)} className={inpCls}>
                  <option value="Gs">Gs (Guaraníes)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="R$">R$ (Reales)</option>
                </select>
              </div>
              <div className="flex gap-2">
                {(['financiado', 'partePago'] as BoolKey[]).map(key => (
                  <button key={key} onClick={() => updBool(key, !data[key])}
                    className={`flex-1 py-2 px-1 rounded-lg border text-[11px] transition-colors ${
                      data[key] ? 'border-orange bg-orange/15 text-orange' : 'border-border bg-card text-textsec hover:border-border-bright'}`}>
                    {data[key] ? '✓' : '○'} {key === 'financiado' ? 'Financiamos' : 'Parte de pago'}
                  </button>
                ))}
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input value={data.whatsapp} onChange={e => updStr('whatsapp', e.target.value)} className={inpCls} />
              </div>
            </div>
          )}

          {activeTab === 'extras' && (
            <div>
              <label className={labelCls}>Características</label>
              <div className="flex flex-col gap-1.5 mb-2.5">
                {data.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="flex-1 bg-bg border border-border px-2 py-1.5 rounded-md text-[11px] text-textprim leading-snug">• {f}</span>
                    <button onClick={() => removeFeat(i)}
                      className="bg-error/10 text-error rounded-md px-2 py-1.5 flex-shrink-0 hover:bg-error/20 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input value={newFeat} onChange={e => setNewFeat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFeat()}
                  placeholder="Nueva característica..." className={`${inpCls} flex-1`} />
                <button onClick={addFeat} className="bg-orange hover:bg-orange-hover text-white rounded-lg px-3 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Descargar */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <button onClick={download}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2
                       transition-all active:scale-95 shadow-orange-sm hover:shadow-orange"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})` }}>
            <Download className="w-4 h-4" /> Descargar PNG
          </button>
        </div>
      </div>

      {/* ── Vista previa ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 overflow-auto bg-bg">
        <div className="text-[9px] text-textmuted tracking-[0.25em] uppercase">Vista previa en tiempo real</div>
        <div className="rounded-xl overflow-hidden shadow-card-lg" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="block rounded-xl"
            style={{ maxHeight: '78vh', maxWidth: '100%', cursor: photoLoaded ? 'grab' : 'default' }}
          />
        </div>
        <div className="text-[9px] text-textmuted tracking-wider">{fmt.w} × {fmt.h} px</div>
      </div>
    </div>
  )
}
