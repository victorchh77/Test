'use client'

import { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'

// Número de WhatsApp del concesionario (formato internacional sin signos).
// Configurable con NEXT_PUBLIC_WHATSAPP; fallback a un placeholder.
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '5950995368724'

export function ContactForm() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [interes, setInteres] = useState('')
  const [mensaje, setMensaje] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const texto =
      `Hola VH Group, soy ${nombre || 'un interesado'}.` +
      (interes ? ` Me interesa: ${interes}.` : '') +
      (mensaje ? ` ${mensaje}` : '') +
      (telefono ? ` Mi teléfono: ${telefono}.` : '')
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="nombre" label="Nombre" value={nombre} onChange={setNombre} placeholder="Tu nombre" required />
        <Field id="telefono" label="Teléfono" value={telefono} onChange={setTelefono} placeholder="09xx xxx xxx" type="tel" />
      </div>

      <div>
        <label htmlFor="interes" className="block text-xs font-semibold text-textsec mb-1.5">
          ¿Qué estás buscando?
        </label>
        <input
          id="interes"
          value={interes}
          onChange={(e) => setInteres(e.target.value)}
          placeholder="Ej: SUV familiar, pick-up, sedán económico…"
          className="input-base"
        />
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-xs font-semibold text-textsec mb-1.5">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
          placeholder="Contanos qué necesitás y un asesor te responde."
          className="input-base resize-none"
        />
      </div>

      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
                   bg-orange hover:bg-orange-hover text-white shadow-orange-sm hover:shadow-orange
                   transition-all duration-200 active:scale-95"
      >
        <MessageCircle className="w-4 h-4" />
        Enviar por WhatsApp
        <Send className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <p className="text-xs text-textmuted text-center">
        Al enviar se abrirá WhatsApp con tu consulta lista para mandar.
      </p>
    </form>
  )
}

function Field({
  id, label, value, onChange, placeholder, type = 'text', required = false,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-textsec mb-1.5">
        {label}{required && <span className="text-orange"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
      />
    </div>
  )
}
