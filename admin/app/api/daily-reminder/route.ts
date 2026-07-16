import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

function getTitle(props: any, key: string): string {
  return props[key]?.title?.[0]?.text?.content ?? '—'
}
function getRichText(props: any, key: string): string {
  return props[key]?.rich_text?.[0]?.text?.content ?? '—'
}
function getSelect(props: any, key: string): string {
  return props[key]?.select?.name ?? '—'
}
function getDate(props: any, key: string): string | null {
  return props[key]?.date?.start ?? null
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_API_KEY })

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const in3Days = new Date(today)
    in3Days.setDate(today.getDate() + 3)
    const in3DaysStr = in3Days.toISOString().split('T')[0]

    const [examRes, tareasRes, entrRes, pubRes] = await Promise.all([
      notion.databases.query({ database_id: '512d5732-3fb7-41c9-905d-e599e4f32bd4' }),
      notion.databases.query({ database_id: 'c864c227-6d4e-4c77-af7e-e8ae6985c155' }),
      notion.databases.query({
        database_id: '3ba78f9c-d6e6-4cea-902b-8225321517e1',
        filter: {
          and: [
            { property: 'Fecha', date: { equals: todayStr } },
            { property: 'Completado', checkbox: { equals: false } },
          ],
        },
      }),
      notion.databases.query({
        database_id: '6793362d-ebd9-42d2-bcfa-3157a32107f5',
        filter: { property: 'Completado', checkbox: { equals: false } },
      }),
    ])

    const examenes = examRes.results
      .filter((p: any) => getSelect(p.properties, 'Estado') !== 'Completado')
      .map((p: any) => {
        const fecha = getDate(p.properties, 'Fecha')
        return {
          materia: getTitle(p.properties, 'Materia'),
          fecha,
          estado: getSelect(p.properties, 'Estado'),
          prioridad: getSelect(p.properties, 'Prioridad'),
          alert: fecha === in3DaysStr,
        }
      })

    const tareas = tareasRes.results
      .filter((p: any) => getSelect(p.properties, 'Estado') !== 'Completado')
      .map((p: any) => ({
        tarea: getTitle(p.properties, 'Tarea'),
        asignatura: getRichText(p.properties, 'Asignatura'),
        fechaEntrega: getDate(p.properties, 'Fecha Entrega'),
        estado: getSelect(p.properties, 'Estado'),
      }))

    const entrenamientos = entrRes.results.map((p: any) => ({
      ejercicio: getTitle(p.properties, 'Ejercicio'),
      seriesReps: getRichText(p.properties, 'Series x Reps'),
    }))

    const publicaciones = pubRes.results.map((p: any) => ({
      vehiculo: getTitle(p.properties, 'Vehículo'),
      modelo: getRichText(p.properties, 'Modelo'),
      anio: (p.properties['Año'] as any)?.number ?? null,
    }))

    const alertas = examenes.filter(e => e.alert)
    const fechaLabel = today.toLocaleDateString('es-PY', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;color:#333;margin:0;padding:16px}
.wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.hdr{background:#FF8C00;color:#fff;padding:20px 24px}
.hdr h1{margin:0;font-size:18px;font-weight:700}
.hdr p{margin:4px 0 0;font-size:13px;opacity:.85}
.sec{padding:16px 24px;border-bottom:1px solid #f0f0f0}
.sec:last-child{border-bottom:none}
.sec h2{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#FF8C00}
.item{padding:6px 0;border-bottom:1px solid #f7f7f7;font-size:14px}
.item:last-child{border-bottom:none}
.item b{color:#111}
.meta{font-size:12px;color:#888;margin-top:2px}
.alert{background:#FFF8E1;border:2px solid #FFB800;border-radius:6px;padding:12px 16px;margin-bottom:10px}
.alert strong{color:#7a5c00}
.empty{color:#aaa;font-style:italic;font-size:13px}
.ftr{padding:14px 24px;font-size:11px;color:#bbb;background:#fafafa;text-align:center}
</style></head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>📋 Resumen Diario VH Group</h1>
    <p>${fechaLabel}</p>
  </div>

  ${alertas.length > 0 ? `
  <div class="sec">
    <div class="alert">
      <strong>⚠️ ALERTA — Examen en 3 días:</strong><br>
      ${alertas.map(e => `<b>${e.materia}</b> el ${e.fecha}`).join('<br>')}
    </div>
  </div>` : ''}

  <div class="sec">
    <h2>📚 Exámenes pendientes (${examenes.length})</h2>
    ${examenes.length === 0
      ? '<p class="empty">Sin exámenes pendientes</p>'
      : examenes.map(e => `
    <div class="item">
      <b>${e.materia}</b>${e.alert ? ' ⚠️' : ''}
      <div class="meta">Fecha: ${e.fecha ?? '—'} · ${e.estado} · Prioridad: ${e.prioridad}</div>
    </div>`).join('')}
  </div>

  <div class="sec">
    <h2>✅ Tareas académicas (${tareas.length})</h2>
    ${tareas.length === 0
      ? '<p class="empty">Sin tareas pendientes</p>'
      : tareas.map(t => `
    <div class="item">
      <b>${t.tarea}</b>
      <div class="meta">${t.asignatura} · Entrega: ${t.fechaEntrega ?? '—'} · ${t.estado}</div>
    </div>`).join('')}
  </div>

  <div class="sec">
    <h2>💪 Entrenamiento de hoy (${entrenamientos.length})</h2>
    ${entrenamientos.length === 0
      ? '<p class="empty">Sin entrenamiento programado para hoy o ya completado</p>'
      : entrenamientos.map(e => `
    <div class="item">
      <b>${e.ejercicio}</b>
      <div class="meta">${e.seriesReps}</div>
    </div>`).join('')}
  </div>

  <div class="sec">
    <h2>🚗 Publicaciones VH pendientes (${publicaciones.length})</h2>
    ${publicaciones.length === 0
      ? '<p class="empty">Sin publicaciones pendientes</p>'
      : publicaciones.map(p => `
    <div class="item">
      <b>${p.vehiculo}</b>
      <div class="meta">${p.modelo}${p.anio ? ` · ${p.anio}` : ''}</div>
    </div>`).join('')}
  </div>

  <div class="ftr">Enviado automáticamente por VH Group · ${new Date().toISOString()}</div>
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
      subject: `📋 Resumen diario — ${today.toLocaleDateString('es-PY')}`,
      html,
    })

    return NextResponse.json({ ok: true, message: 'Recordatorio enviado correctamente.' })
  } catch (err: any) {
    console.error('[daily-reminder]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
