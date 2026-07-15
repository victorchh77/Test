import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Client } from '@notionhq/client'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

const GRUPOS = [
  { name: 'Playas Encarnación',              url: 'https://m.facebook.com/groups/715187838552613/' },
  { name: 'Autos Paraguay Compra Venta',     url: 'https://m.facebook.com/groups/204228106413426/' },
  { name: 'Compra y Venta Ciudad del Este',  url: 'https://m.facebook.com/groups/comprayventaciudaddeleste/' },
  { name: 'Autos Encarnación',               url: 'https://m.facebook.com/groups/110393459001119/' },
  { name: 'Grupo 5',                         url: 'https://m.facebook.com/groups/796340138006462/' },
  { name: 'CDE Clasificados',                url: 'https://m.facebook.com/groups/cdeclasif/' },
  { name: 'Grupo 7',                         url: 'https://m.facebook.com/groups/1140560453614046/' },
  { name: 'Grupo 8',                         url: 'https://m.facebook.com/groups/838736952902288/' },
  { name: 'Grupo 9',                         url: 'https://m.facebook.com/groups/1504962509723621/' },
]

function formatGs(n: number): string {
  return new Intl.NumberFormat('es-PY').format(n)
}

function buildPost(v: any): string {
  const km = v.km_publico != null ? v.km_publico : v.km
  const lines = [
    `✴️${v.marca} ${v.modelo} Año ${v.anio}`,
    `✅Recién Importado`,
    `✅Motor: Automático Full`,
    `✅Interior Oscuro`,
    `✅Impecable Estado`,
    `✅KM: ${km ? formatGs(km) : '—'} km`,
    `✅Color: ${v.color ?? '—'}`,
  ]
  if (v.descripcion) lines.push(`✅${v.descripcion}`)
  lines.push(`✅Aceptamos vehículo por parte de pago y financiamos`)
  lines.push(`✴️Precio contado: ${v.precio_venta ? formatGs(v.precio_venta) : '—'} Gs.`)
  return lines.join('\n')
}

function chunkArr<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
    )
    const notion = new Client({ auth: process.env.NOTION_API_KEY })

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, marca, modelo, anio, km, km_publico, color, precio_venta, descripcion, fecha_ingreso')
      .eq('estado', 'Disponible')
      .eq('oculto', false)
      .order('fecha_ingreso', { ascending: false })
      .limit(10)

    if (error) throw new Error(`Supabase: ${error.message}`)
    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ ok: true, message: 'Sin vehículos disponibles.' })
    }

    const posts = vehicles.map((v: any) => ({ vehicle: v, post: buildPost(v) }))
    const chunks = chunkArr(posts, 3)

    // Each group gets the same 3-post chunk cycling through
    const gruposHtml = GRUPOS.map((g, i) => {
      const chunk = chunks[i % chunks.length]
      return `
      <div style="margin-bottom:24px;padding:16px;background:#f9f9f9;border-radius:8px;border-left:4px solid #1877F2">
        <h3 style="margin:0 0 8px;font-size:14px;color:#1877F2">
          📘 <a href="${g.url}" style="color:#1877F2">${g.name}</a>
        </h3>
        ${chunk.map((p, j) => `
        <div style="margin-top:${j > 0 ? '12px' : '0'};padding:12px;background:#fff;border:1px solid #e0e0e0;border-radius:6px">
          <div style="font-size:11px;color:#888;margin-bottom:6px">Post ${j + 1} de ${chunk.length}</div>
          <pre style="margin:0;font-size:13px;font-family:Arial,sans-serif;white-space:pre-wrap;line-height:1.5">${p.post}</pre>
        </div>`).join('')}
      </div>`
    }).join('')

    const today = new Date()
    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f0f2f5;color:#333;margin:0;padding:16px}
.wrap{max-width:680px;margin:0 auto}
.hdr{background:#FF8C00;color:#fff;padding:20px 24px;border-radius:10px 10px 0 0}
.hdr h1{margin:0;font-size:18px}
.hdr p{margin:4px 0 0;font-size:13px;opacity:.85}
.body{background:#fff;padding:20px 24px;border-radius:0 0 10px 10px}
.ftr{text-align:center;font-size:11px;color:#aaa;margin-top:16px}
</style></head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>🚗 Posts de Facebook — VH Group</h1>
    <p>${today.toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · ${vehicles.length} vehículo${vehicles.length !== 1 ? 's' : ''}</p>
  </div>
  <div class="body">
    <p style="color:#555;font-size:13px;margin:0 0 20px">
      Copiá cada post y pegalo directamente en el grupo correspondiente de Facebook:
    </p>
    ${gruposHtml}
  </div>
  <p class="ftr">Generado automáticamente por VH Group · ${new Date().toISOString()}</p>
</div>
</body>
</html>`

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD },
    })

    await transporter.sendMail({
      from: `VH Group <${process.env.GMAIL_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `🚗 Posts Facebook listos — ${today.toLocaleDateString('es-PY')}`,
      html,
    })

    // Sync vehicles to Notion VH_DB
    const VH_DB_ID = '6793362d-ebd9-42d2-bcfa-3157a32107f5'
    const notionResults: { vehiculo: string; action: string }[] = []

    for (const v of vehicles) {
      const nombre = `${v.marca} ${v.modelo} ${v.anio}`
      try {
        // Search for existing page by title
        const existing = await notion.databases.query({
          database_id: VH_DB_ID,
          filter: { property: 'Vehículo', title: { equals: nombre } },
        })

        const props: any = {
          'Vehículo': { title: [{ text: { content: nombre } }] },
          'Modelo': { rich_text: [{ text: { content: v.modelo ?? '' } }] },
          'Año': { number: v.anio ?? null },
          'Precio': { rich_text: [{ text: { content: v.precio_venta ? `${formatGs(v.precio_venta)} Gs.` : '—' } }] },
        }

        if (existing.results.length > 0) {
          await notion.pages.update({ page_id: existing.results[0].id, properties: props })
          notionResults.push({ vehiculo: nombre, action: 'actualizado' })
        } else {
          await notion.pages.create({
            parent: { database_id: VH_DB_ID },
            properties: { ...props, 'Completado': { checkbox: false } },
          })
          notionResults.push({ vehiculo: nombre, action: 'creado' })
        }
      } catch (notionErr: any) {
        notionResults.push({ vehiculo: nombre, action: `error: ${notionErr.message}` })
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Posts enviados para ${vehicles.length} vehículos.`,
      notion: notionResults,
    })
  } catch (err: any) {
    console.error('[sync-vehicles-posts]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
