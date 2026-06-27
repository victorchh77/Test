'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Cuenta hacia arriba la parte numérica de un valor, preservando el prefijo
 * (ej. "Gs ") y reformateando con separadores de miles es-PY.
 * Si el valor no tiene dígitos (ej. "—") lo muestra tal cual.
 */
export function AnimatedNumber({
  value,
  duration = 1100,
}: {
  value: string | number
  duration?: number
}) {
  const str = String(value)
  const firstDigit = str.search(/\d/)
  const digits = str.replace(/[^\d]/g, '')
  const hasDigits = digits.length > 0
  const target = hasDigits ? parseInt(digits, 10) : 0
  const prefix = firstDigit === -1 ? '' : str.slice(0, firstDigit)

  const [display, setDisplay] = useState(hasDigits ? 0 : null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!hasDigits) return
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(Math.round(from + (target - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, hasDigits, duration])

  if (!hasDigits) return <>{str}</>
  return <>{prefix}{(display ?? 0).toLocaleString('es-PY')}</>
}
