-- migration_pagares_cuotas.sql
-- Reemplaza el modelo de pagos mensuales genéricos por cuotas individuales
-- con fechas de vencimiento específicas y soporte para pagarés de refuerzo.
--
-- Aplicar en el SQL Editor de Supabase DESPUÉS de los migrations anteriores.

-- ── 1. Nuevas columnas en pagares_contracts ───────────────────────────────
ALTER TABLE public.pagares_contracts
  ADD COLUMN IF NOT EXISTS vehiculo     text,
  ADD COLUMN IF NOT EXISTS total_precio bigint,
  ADD COLUMN IF NOT EXISTS entrada      bigint;

-- ── 2. Tabla de cuotas individuales ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pagares_cuotas (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id       uuid        NOT NULL
                    REFERENCES public.pagares_contracts(id) ON DELETE CASCADE,
  tipo              text        NOT NULL CHECK (tipo IN ('cuota', 'refuerzo')),
  numero            int         NOT NULL,
  monto             bigint      NOT NULL CHECK (monto > 0),
  fecha_vencimiento date,           -- NULL = "a convenir"
  pagado            boolean     NOT NULL DEFAULT false,
  pagado_at         timestamptz,
  metodo_pago       text,
  notas             text,
  created_at        timestamptz DEFAULT now()
);

-- ── 3. RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.pagares_cuotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_cuotas_all"
  ON public.pagares_cuotas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 4. Índices ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pagares_cuotas_contract
  ON public.pagares_cuotas(contract_id);

-- Índice parcial para cuotas pendientes por fecha (queries de dashboard)
CREATE INDEX IF NOT EXISTS idx_pagares_cuotas_pendientes_fecha
  ON public.pagares_cuotas(fecha_vencimiento NULLS LAST)
  WHERE NOT pagado;
