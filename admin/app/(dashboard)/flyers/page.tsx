'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const ORANGE  = '#F97316'
const ORANGE2 = '#ea580c'
const MUTED   = '#94a3b8'
const BORDER  = '#2d3748'

interface Format { id: string; label: string; sub: string; w: number; h: number }
interface FlyerData {
  marca: string; modelo: string; version: string; anio: string; km: string
  precio: string; moneda: string; financiado: boolean; partePago: boolean
  whatsapp: string; ciudad: string; features: string[]
}
type StrKey  = 'marca' | 'modelo' | 'version' | 'anio' | 'km' | 'precio' | 'moneda' | 'whatsapp' | 'ciudad'
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

const INP: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: '1px solid #2d3748', background: '#0a0f1e',
  color: 'white', fontSize: 12, boxSizing: 'border-box', outline: 'none',
}

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
  const fileRef   = useRef<HTMLInputElement>(null)

  const [fmt, setFmt]                 = useState<Format>(FORMATS[0])
  const [photoImg, setPhotoImg]       = useState<HTMLImageElement | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [activeTab, setActiveTab]     = useState('vehiculo')
  const [newFeat, setNewFeat]         = useState('')

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
      'Alerón — Cubiertas nuevas',
      'Chapa Mercosur',
    ],
  })

  const updStr      = (k: StrKey,  v: string)  => setData(d => ({ ...d, [k]: v }))
  const updBool     = (k: BoolKey, v: boolean) => setData(d => ({ ...d, [k]: v }))
  const updFeatures = (v: string[])            => setData(d => ({ ...d, features: v }))
  const addFeat     = () => { if (newFeat.trim()) { updFeatures([...data.features, newFeat.trim()]); setNewFeat('') } }
  const removeFeat  = (i: number) => updFeatures(data.features.filter((_, idx) => idx !== i))

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = fmt.w, H = fmt.h
    canvas.width = W * 2; canvas.height = H * 2
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(2, 2)

    const isStory = fmt.id === 'story'
    const isFeed  = fmt.id === 'feed'
    const photoRatio = isStory ? 0.46 : isFeed ? 0.43 : 0.46
    const photoH = Math.floor(H * photoRatio)
    const PAD    = Math.floor(W * 0.048)
    const maxFeats = isStory ? 5 : isFeed ? 3 : 4

    /* ── PHOTO ─────────────────────────────────────────────── */
    if (photoImg && photoLoaded) {
      ctx.save()
      ctx.beginPath(); ctx.rect(0, 0, W, photoH); ctx.clip()
      const sc = Math.max(W / photoImg.naturalWidth, photoH / photoImg.naturalHeight)
      const dx = (W - photoImg.naturalWidth * sc) / 2
      const dy = (photoH - photoImg.naturalHeight * sc) / 2
      ctx.drawImage(photoImg, dx, dy, photoImg.naturalWidth * sc, photoImg.naturalHeight * sc)
      ctx.restore()
      // Bottom fade into warm info section
      const fade = ctx.createLinearGradient(0, photoH * 0.62, 0, photoH)
      fade.addColorStop(0, 'rgba(28,10,2,0)')
      fade.addColorStop(1, 'rgba(28,10,2,0.92)')
      ctx.fillStyle = fade; ctx.fillRect(0, 0, W, photoH)
    } else {
      ctx.fillStyle = '#1a0a03'; ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(249,115,22,0.07)'; ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.font = `${W * 0.044}px sans-serif`; ctx.textAlign = 'center'
      ctx.fillText('Subir foto del vehiculo', W / 2, photoH / 2 + 20)
      ctx.font = `${W * 0.07}px sans-serif`
      ctx.fillText('[  foto  ]', W / 2, photoH / 2 - 8)
    }

    /* VH watermark (bottom-right of photo) */
    {
      const lW = W * 0.26, lH = W * 0.12
      const lX = W - lW - 10, lY = photoH - lH - 10
      ctx.save()
      roundRect(ctx, lX, lY, lW, lH, 7)
      ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fill()
      ctx.fillStyle = ORANGE
      ctx.font = `900 ${lH * 0.56}px Arial`; ctx.textAlign = 'left'
      ctx.fillText('VH', lX + lW * 0.09, lY + lH * 0.68)
      ctx.fillStyle = 'rgba(255,255,255,0.88)'
      ctx.font = `700 ${lH * 0.24}px Arial`
      ctx.fillText('GROUP  S.R.L.', lX + lW * 0.09, lY + lH * 0.93)
      ctx.restore()
    }

    /* ── INFO SECTION ─────────────────────────────────────── */
    const infoGrad = ctx.createLinearGradient(0, photoH, 0, H)
    infoGrad.addColorStop(0, '#1c0a02')
    infoGrad.addColorStop(0.45, '#3b1706')
    infoGrad.addColorStop(1, '#5c280d')
    ctx.fillStyle = infoGrad; ctx.fillRect(0, photoH, W, H - photoH)

    // Reserve space for WhatsApp CTA at bottom
    const ctaH  = Math.floor(W * 0.1)
    const ctaY  = H - ctaH - 12
    const maxY  = ctaY - 8  // content must not exceed this

    let y = photoH + PAD + Math.floor(W * 0.058)
    ctx.textAlign = 'left'

    // Marca + Modelo
    ctx.fillStyle = 'white'
    ctx.font = `900 ${Math.floor(W * 0.082)}px Arial`
    ctx.fillText(`${data.marca} ${data.modelo}`.toUpperCase(), PAD, y)
    y += Math.floor(W * 0.094)

    // Año  |  Versión
    ctx.font = `700 ${Math.floor(W * 0.062)}px Arial`
    ctx.fillText(data.version ? `${data.anio}  |  ${data.version}` : data.anio, PAD, y)
    y += Math.floor(W * 0.078)

    // "Precio contado:"
    ctx.fillStyle = 'rgba(255,255,255,0.58)'
    ctx.font = `400 ${Math.floor(W * 0.027)}px Arial`
    ctx.fillText('Precio contado:', PAD, y)
    y += Math.floor(W * 0.038)

    // Price
    ctx.fillStyle = 'white'
    ctx.font = `900 ${Math.floor(W * 0.076)}px Arial`
    ctx.fillText(`${data.precio} ${data.moneda}`, PAD, y)
    y += Math.floor(W * 0.086)

    // Financing prose
    if (data.financiado || data.partePago) {
      const sentence = data.financiado && data.partePago
        ? 'Financiamos y aceptamos vehiculos de nuestra preferencia por parte de pago.'
        : data.financiado
        ? 'Financiamos tu vehiculo a tu medida.'
        : 'Aceptamos vehiculos por parte de pago.'
      const fFont = Math.floor(W * 0.029)
      ctx.fillStyle = 'rgba(255,255,255,0.78)'
      ctx.font = `400 ${fFont}px Arial`
      const lines = wrapText(ctx, sentence, W - PAD * 2)
      lines.forEach(line => {
        if (y < maxY) { ctx.fillText(line, PAD, y); y += Math.floor(fFont * 1.55) }
      })
      y += 4
    }

    // Divider
    if (y < maxY - 40) {
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
      y += Math.floor(W * 0.046)
    }

    // Features as bullet points
    const fSize   = Math.floor(W * (isStory ? 0.034 : 0.033))
    const fLineH  = Math.floor(fSize * 1.48)
    const bulletX = PAD
    const textX   = PAD + Math.floor(fSize * 1.3)

    data.features.slice(0, maxFeats).forEach(feat => {
      if (y + fLineH > maxY) return
      // Orange bullet
      ctx.fillStyle = ORANGE
      ctx.font = `900 ${fSize + 2}px Arial`
      ctx.fillText('•', bulletX, y)
      // Feature text (wrap if needed)
      ctx.fillStyle = 'white'
      ctx.font = `400 ${fSize}px Arial`
      const wrapped = wrapText(ctx, feat, W - textX - PAD)
      wrapped.forEach((line, li) => {
        if (y + li * fLineH < maxY) ctx.fillText(line, textX, y + li * fLineH)
      })
      y += fLineH * wrapped.length + Math.floor(fSize * 0.32)
    })

    /* WhatsApp CTA */
    roundRect(ctx, PAD, ctaY, W - PAD * 2, ctaH, 10)
    const ctaGrad = ctx.createLinearGradient(PAD, ctaY, W - PAD, ctaY)
    ctaGrad.addColorStop(0, '#16a34a'); ctaGrad.addColorStop(1, '#15803d')
    ctx.fillStyle = ctaGrad; ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = `bold ${Math.floor(W * 0.034)}px Arial`; ctx.textAlign = 'center'
    ctx.fillText(`WhatsApp  ${data.whatsapp}`, W / 2, ctaY + ctaH * 0.62)

    // Orange bottom bar
    ctx.fillStyle = ORANGE; ctx.fillRect(0, H - 3, W, 3)
  }, [fmt, photoImg, photoLoaded, data])

  useEffect(() => { draw() }, [draw])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => { setPhotoImg(img); setPhotoLoaded(true) }
    img.src = URL.createObjectURL(file)
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = `VHGroup_${data.marca}_${data.modelo}_${data.anio}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const vehicleFields: Array<[string, StrKey]> = [
    ['MARCA', 'marca'], ['MODELO', 'modelo'], ['VERSION', 'version'], ['CIUDAD', 'ciudad'],
  ]
  const anioKmFields: Array<[string, StrKey]> = [['ANO', 'anio'], ['KM', 'km']]

  return (
    <div className="-m-4 sm:-m-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* ── Left panel ── */}
      <div style={{
        width: 296, minWidth: 296, background: '#0f172a',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${BORDER}`,
      }}>

        {/* Header */}
        <div style={{ padding: '13px 15px', borderBottom: `1px solid ${BORDER}`, background: '#0a0f1e', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: ORANGE, color: 'white', fontWeight: 900, fontSize: 11, padding: '3px 8px', borderRadius: 4, letterSpacing: 0.5 }}>VH GROUP</span>
            <span style={{ color: MUTED, fontSize: 12 }}>Generador de Flyers</span>
          </div>
        </div>

        {/* Format */}
        <div style={{ padding: '11px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, letterSpacing: 1 }}>FORMATO</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => setFmt(f)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 6,
                border: `1px solid ${fmt.id === f.id ? ORANGE : BORDER}`,
                background: fmt.id === f.id ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.02)',
                color: fmt.id === f.id ? ORANGE : MUTED,
                cursor: 'pointer', fontSize: 11, fontWeight: fmt.id === f.id ? 700 : 400,
              }}>
                <div>{f.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo */}
        <div style={{ padding: '11px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, letterSpacing: 1 }}>FOTO</div>
          <button onClick={() => fileRef.current?.click()} style={{
            width: '100%', padding: '11px', borderRadius: 8,
            border: `2px dashed ${photoLoaded ? ORANGE : '#374151'}`,
            background: photoLoaded ? 'rgba(249,115,22,0.07)' : 'rgba(255,255,255,0.01)',
            color: photoLoaded ? ORANGE : MUTED, cursor: 'pointer', fontSize: 12, textAlign: 'center',
          }}>
            {photoLoaded ? '✓ Foto cargada — click para cambiar' : '+ Subir foto del vehiculo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: '#0a0f1e' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: '9px 4px', border: 'none',
              borderBottom: `2px solid ${activeTab === t.id ? ORANGE : 'transparent'}`,
              background: 'transparent', color: activeTab === t.id ? ORANGE : MUTED,
              cursor: 'pointer', fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '12px 14px', flex: 1 }}>

          {activeTab === 'vehiculo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vehicleFields.map(([label, key]) => (
                <div key={key}>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{label}</div>
                  <input value={data[key]} onChange={e => updStr(key, e.target.value)} style={INP} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {anioKmFields.map(([label, key]) => (
                  <div key={key}>
                    <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{label}</div>
                    <input value={data[key]} onChange={e => updStr(key, e.target.value)} style={INP} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'precio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>PRECIO</div>
                <input value={data.precio} onChange={e => updStr('precio', e.target.value)} style={INP} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>MONEDA</div>
                <select value={data.moneda} onChange={e => updStr('moneda', e.target.value)} style={INP}>
                  <option value="Gs">Gs (Guaranies)</option>
                  <option value="USD">USD (Dolares)</option>
                  <option value="R$">R$ (Reales)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                {(['financiado', 'partePago'] as BoolKey[]).map(key => (
                  <button key={key} onClick={() => updBool(key, !data[key])} style={{
                    flex: 1, padding: '9px 4px', borderRadius: 6,
                    border: `1px solid ${data[key] ? ORANGE : BORDER}`,
                    background: data[key] ? 'rgba(249,115,22,0.14)' : 'rgba(255,255,255,0.02)',
                    color: data[key] ? ORANGE : MUTED, fontSize: 11, cursor: 'pointer',
                  }}>
                    {data[key] ? '✓' : '○'} {key === 'financiado' ? 'Financiamos' : 'Parte de pago'}
                  </button>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>WHATSAPP</div>
                <input value={data.whatsapp} onChange={e => updStr('whatsapp', e.target.value)} style={INP} />
              </div>
            </div>
          )}

          {activeTab === 'extras' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>CARACTERISTICAS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {data.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{
                        flex: 1, background: '#0a0f1e', padding: '6px 8px',
                        borderRadius: 5, fontSize: 11, color: 'rgba(255,255,255,0.78)',
                        lineHeight: '1.4',
                      }}>• {f}</span>
                      <button onClick={() => removeFeat(i)} style={{
                        background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171',
                        borderRadius: 5, padding: '5px 8px', cursor: 'pointer', flexShrink: 0,
                      }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={newFeat}
                    onChange={e => setNewFeat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addFeat()}
                    placeholder="Nueva caracteristica..."
                    style={{ ...INP, flex: 1 }}
                  />
                  <button onClick={addFeat} style={{
                    background: ORANGE, border: 'none', color: 'white',
                    borderRadius: 6, padding: '6px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  }}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <button onClick={download} style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
            color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
          }}>
            Descargar PNG
          </button>
        </div>
      </div>

      {/* ── Canvas preview ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: 24, overflow: 'auto',
        background: '#070b14',
      }}>
        <div style={{ fontSize: 9, color: '#2d3748', letterSpacing: 3, textTransform: 'uppercase' }}>
          Vista previa en tiempo real
        </div>
        <div style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.8)', borderRadius: 12, overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', maxHeight: '80vh', maxWidth: '100%', borderRadius: 12 }}
          />
        </div>
        <div style={{ fontSize: 9, color: '#2d3748', letterSpacing: 1 }}>
          {fmt.w} x {fmt.h} px
        </div>
      </div>
    </div>
  )
}
