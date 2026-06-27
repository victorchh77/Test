'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ── Canvas constants (used only inside the canvas draw) ── */
const ORANGE  = '#F97316'
const ORANGE2 = '#ea580c'
const MUTED   = '#94a3b8'
const BORDER  = '#2d3748'

const FORMATS = [
  { id: 'story',     label: 'Story', sub: '9:16', w: 420, h: 748 },
  { id: 'feed',      label: 'Feed',  sub: '1:1',  w: 600, h: 600 },
  { id: 'landscape', label: 'Post',  sub: '4:5',  w: 500, h: 625 },
] as const

type FormatId = typeof FORMATS[number]['id']
type Format   = typeof FORMATS[number]

interface FlyerData {
  marca: string; modelo: string; version: string; anio: string; km: string
  precio: string; moneda: string; financiado: boolean; partePago: boolean
  whatsapp: string; ciudad: string; features: string[]
}

type StrKey  = 'marca' | 'modelo' | 'version' | 'anio' | 'km' | 'precio' | 'moneda' | 'whatsapp' | 'ciudad'
type BoolKey = 'financiado' | 'partePago'

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

export default function FlyersPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const [fmt, setFmt]             = useState<Format>(FORMATS[0])
  const [photoImg, setPhotoImg]   = useState<HTMLImageElement | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState('vehiculo')
  const [newFeat, setNewFeat]     = useState('')

  const [data, setData] = useState<FlyerData>({
    marca: 'TOYOTA', modelo: 'HILUX', version: 'SRV',
    anio: '2014', km: '154.000', precio: '185.000.000',
    moneda: 'Gs', financiado: true, partePago: true,
    whatsapp: '+595 971 XXX XXX', ciudad: 'Encarnación',
    features: [
      'Motor 3.0 Turbo Intercooler 4x4',
      'Mecánico Full',
      'Tapizado en cuero',
      'Protector de carrocería y carpa',
      'Alerón • Cubiertas nuevas',
      'Chapa Mercosur',
    ],
  })

  const updStr  = (k: StrKey,  v: string)   => setData(d => ({ ...d, [k]: v }))
  const updBool = (k: BoolKey, v: boolean)  => setData(d => ({ ...d, [k]: v }))
  const updFeatures = (v: string[])         => setData(d => ({ ...d, features: v }))

  const addFeat = () => {
    if (newFeat.trim()) { updFeatures([...data.features, newFeat.trim()]); setNewFeat('') }
  }
  const removeFeat = (i: number) => updFeatures(data.features.filter((_, idx) => idx !== i))

  /* ── Canvas draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = fmt.w, H = fmt.h
    canvas.width = W * 2; canvas.height = H * 2
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)

    const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
    bg.addColorStop(0, '#060d1f'); bg.addColorStop(1, '#0d1a30')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255,255,255,0.018)'; ctx.lineWidth = 1
    for (let i = -H; i < W + H; i += 28) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke()
    }

    const photoH = fmt.id === 'landscape' ? H * 0.5 : H * 0.46

    if (photoImg && photoLoaded) {
      ctx.save()
      ctx.beginPath(); ctx.rect(0, 0, W, photoH); ctx.clip()
      const sc = Math.max(W / photoImg.naturalWidth, photoH / photoImg.naturalHeight)
      const dx = (W - photoImg.naturalWidth * sc) / 2
      const dy = (photoH - photoImg.naturalHeight * sc) / 2
      ctx.drawImage(photoImg, dx, dy, photoImg.naturalWidth * sc, photoImg.naturalHeight * sc)
      ctx.restore()
      const photoFade = ctx.createLinearGradient(0, photoH * 0.55, 0, photoH)
      photoFade.addColorStop(0, 'rgba(6,13,31,0)'); photoFade.addColorStop(1, 'rgba(6,13,31,1)')
      ctx.fillStyle = photoFade; ctx.fillRect(0, 0, W, photoH)
      const leftFade = ctx.createLinearGradient(0, 0, W * 0.35, 0)
      leftFade.addColorStop(0, 'rgba(6,13,31,0.55)'); leftFade.addColorStop(1, 'rgba(6,13,31,0)')
      ctx.fillStyle = leftFade; ctx.fillRect(0, 0, W * 0.35, photoH)
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(249,115,22,0.18)';  ctx.fillRect(0, 0, W, photoH)
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.font = `${W * 0.055}px sans-serif`; ctx.textAlign = 'center'
      ctx.fillText('📷  Subí la foto del vehículo', W / 2, photoH / 2 + W * 0.02)
    }

    const bx = 14, by = 14, bw = W * 0.26, bh = W * 0.085
    roundRect(ctx, bx, by, bw, bh, 6)
    ctx.fillStyle = ORANGE; ctx.fill()
    ctx.fillStyle = 'white'
    ctx.font = `900 ${bh * 0.42}px Arial`; ctx.textAlign = 'left'
    ctx.fillText('VH GROUP SRL', bx + bw * 0.08, by + bh * 0.68)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `${W * 0.028}px Arial`; ctx.textAlign = 'right'
    ctx.fillText(`📍 ${data.ciudad}`, W - 14, by + bh * 0.68)

    let y = photoH + W * 0.04
    const PAD = 18

    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = `700 ${W * 0.045}px Arial`
    ctx.textAlign = 'left'; ctx.fillText(data.marca.toUpperCase(), PAD, y)
    y += W * 0.058

    ctx.fillStyle = ORANGE; ctx.font = `900 ${W * 0.1}px Arial`
    ctx.fillText(data.modelo.toUpperCase(), PAD, y); y += W * 0.03

    if (data.version) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `400 ${W * 0.035}px Arial`
      ctx.fillText(data.version, PAD, y)
    }
    y += W * 0.065

    const chips = [`🗓 ${data.anio}`, `🛣 ${data.km} km`]
    let cx = PAD
    chips.forEach(chip => {
      ctx.font = `${W * 0.03}px Arial`
      const tw = ctx.measureText(chip).width + 22
      roundRect(ctx, cx, y - W * 0.04, tw, W * 0.055, W * 0.028)
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'left'
      ctx.fillText(chip, cx + 11, y + W * 0.008); cx += tw + 8
    })
    y += W * 0.04

    const divGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0)
    divGrad.addColorStop(0, ORANGE); divGrad.addColorStop(0.4, ORANGE)
    divGrad.addColorStop(1, 'rgba(249,115,22,0)')
    ctx.strokeStyle = divGrad; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke()
    y += W * 0.045

    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `400 ${W * 0.03}px Arial`
    ctx.textAlign = 'left'; ctx.fillText('PRECIO CONTADO', PAD, y); y += W * 0.055
    ctx.fillStyle = 'white'; ctx.font = `900 ${W * 0.082}px Arial`
    ctx.fillText(`${data.precio} ${data.moneda}`, PAD, y); y += W * 0.04

    if (data.financiado || data.partePago) {
      const tags: string[] = []
      if (data.financiado) tags.push('✓ Financiamos')
      if (data.partePago)  tags.push('✓ Parte de pago')
      let tx = PAD
      tags.forEach(tag => {
        ctx.font = `600 ${W * 0.028}px Arial`
        const tw = ctx.measureText(tag).width + 20
        const th = W * 0.05
        roundRect(ctx, tx, y, tw, th, th / 2)
        ctx.fillStyle = 'rgba(249,115,22,0.18)'; ctx.fill()
        ctx.strokeStyle = 'rgba(249,115,22,0.6)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = ORANGE; ctx.textAlign = 'left'
        ctx.fillText(tag, tx + 10, y + th * 0.68); tx += tw + 8
      })
      y += W * 0.065
    }

    if (data.features.length > 0) {
      const maxFeats = fmt.id === 'story' ? 5 : 4
      const visible = data.features.slice(0, maxFeats)
      ctx.font = `${W * 0.03}px Arial`
      const rowH = W * 0.052
      const featAreaH = visible.length * rowH + W * 0.01
      roundRect(ctx, PAD, y, W - PAD * 2, featAreaH, 8)
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke()
      y += W * 0.03
      visible.forEach((feat, i) => {
        if (i % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(PAD, y - rowH * 0.6, W - PAD * 2, rowH) }
        ctx.fillStyle = ORANGE; ctx.font = `bold ${W * 0.03}px Arial`; ctx.textAlign = 'left'
        ctx.fillText('▸', PAD + 8, y)
        ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.font = `${W * 0.03}px Arial`
        ctx.fillText(feat, PAD + 22, y); y += rowH
      })
      y += W * 0.015
    }

    const ctaH = W * 0.1, ctaY = H - ctaH - 14
    roundRect(ctx, PAD, ctaY, W - PAD * 2, ctaH, 10)
    const ctaGrad = ctx.createLinearGradient(PAD, ctaY, W - PAD, ctaY)
    ctaGrad.addColorStop(0, '#16a34a'); ctaGrad.addColorStop(1, '#15803d')
    ctx.fillStyle = ctaGrad; ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = `bold ${W * 0.038}px Arial`
    ctx.textAlign = 'center'
    ctx.fillText(`💬 WhatsApp  ${data.whatsapp}`, W / 2, ctaY + ctaH * 0.63)

    ctx.fillStyle = ORANGE; ctx.fillRect(0, H - 4, W, 4)
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

  /* ── Layout helpers ── */
  const vehicleFields: Array<[string, StrKey]> = [
    ['MARCA', 'marca'], ['MODELO', 'modelo'], ['VERSIÓN', 'version'], ['CIUDAD', 'ciudad'],
  ]
  const anioKmFields: Array<[string, StrKey]> = [['AÑO', 'anio'], ['KM', 'km']]
  const boolFields: Array<[BoolKey, string]> = [['financiado', 'Financiamos'], ['partePago', 'Parte de pago']]

  return (
    /* Cancel dashboard padding and fill the remaining viewport */
    <div className="-m-4 sm:-m-6 flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>

      {/* ── Left panel: controls ── */}
      <div style={{
        width: 300, minWidth: 300, background: '#1e293b',
        overflowY: 'auto', display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${BORDER}`,
      }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, background: '#161f31' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ background: ORANGE, color: 'white', fontWeight: 900, fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>VH GROUP</div>
            <span style={{ color: MUTED, fontSize: 12 }}>Generador de Flyers</span>
          </div>
        </div>

        {/* Format selector */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, letterSpacing: 1 }}>FORMATO</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => setFmt(f as Format)} style={{
                flex: 1, padding: '7px 4px', borderRadius: 6,
                border: `1px solid ${fmt.id === f.id ? ORANGE : BORDER}`,
                background: fmt.id === f.id ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: fmt.id === f.id ? ORANGE : MUTED,
                cursor: 'pointer', fontSize: 11, fontWeight: fmt.id === f.id ? 700 : 400,
              }}>
                <div>{f.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>{f.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div style={{ padding: '12px 14px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, letterSpacing: 1 }}>FOTO</div>
          <button onClick={() => fileRef.current?.click()} style={{
            width: '100%', padding: '10px', borderRadius: 8,
            border: `2px dashed ${photoLoaded ? ORANGE : '#374151'}`,
            background: photoLoaded ? 'rgba(249,115,22,0.07)' : 'transparent',
            color: photoLoaded ? ORANGE : MUTED, cursor: 'pointer', fontSize: 12,
          }}>
            {photoLoaded ? '✅ Foto cargada — click para cambiar' : '📷  Subir foto del vehículo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}` }}>
          {(['vehiculo', 'Vehículo'], ['precio', 'Precio'], ['extras', 'Extras']) && (
            [['vehiculo', 'Vehículo'], ['precio', 'Precio'], ['extras', 'Extras']] as Array<[string, string]>
          ).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, padding: '9px 4px', border: 'none',
              borderBottom: `2px solid ${activeTab === id ? ORANGE : 'transparent'}`,
              background: 'transparent', color: activeTab === id ? ORANGE : MUTED,
              cursor: 'pointer', fontSize: 12, fontWeight: activeTab === id ? 700 : 400,
            }}>{label}</button>
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
                  <option value="Gs">Gs (Guaraníes)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="R$">R$ (Reales)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {boolFields.map(([key, label]) => (
                  <button key={key} onClick={() => updBool(key, !data[key])} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 6,
                    border: `1px solid ${data[key] ? ORANGE : BORDER}`,
                    background: data[key] ? 'rgba(249,115,22,0.15)' : 'transparent',
                    color: data[key] ? ORANGE : MUTED, fontSize: 11, cursor: 'pointer',
                  }}>
                    {data[key] ? '✓' : '○'} {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'extras' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>WHATSAPP</div>
                <input value={data.whatsapp} onChange={e => updStr('whatsapp', e.target.value)} style={INP} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>CARACTERÍSTICAS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {data.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ flex: 1, background: '#0a0f1e', padding: '5px 8px', borderRadius: 4, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>▸ {f}</span>
                      <button onClick={() => removeFeat(i)} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#f87171', borderRadius: 4, padding: '4px 7px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={newFeat}
                    onChange={e => setNewFeat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addFeat()}
                    placeholder="Nueva característica..."
                    style={{ ...INP, flex: 1 }}
                  />
                  <button onClick={addFeat} style={{ background: ORANGE, border: 'none', color: 'white', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download button */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${BORDER}` }}>
          <button onClick={download} style={{
            width: '100%', padding: '12px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE2})`,
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>
            ⬇️ Descargar PNG
          </button>
        </div>
      </div>

      {/* ── Right panel: canvas preview ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: 24, overflow: 'auto',
        background: 'radial-gradient(ellipse at center, #0d1a30 0%, #060d1f 100%)',
      }}>
        <div style={{ fontSize: 10, color: '#374151', letterSpacing: 2 }}>VISTA PREVIA EN TIEMPO REAL</div>
        <div style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.7)', borderRadius: 14, overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ display: 'block', maxHeight: '78vh', maxWidth: '100%', borderRadius: 14 }} />
        </div>
        <div style={{ fontSize: 10, color: '#374151' }}>{fmt.w} × {fmt.h} px · PNG listo para publicar</div>
      </div>
    </div>
  )
}
