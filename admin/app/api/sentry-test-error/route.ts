import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

// Endpoint temporal para verificar la integración de Sentry. Se elimina
// apenas se confirma que el evento llega al dashboard.
export async function GET() {
  try {
    throw new Error('Sentry test error — verificación de instalación VH Group')
  } catch (err) {
    Sentry.captureException(err)
    await Sentry.flush(2000)
    return NextResponse.json({ ok: true, message: 'Error de prueba enviado a Sentry' })
  }
}
