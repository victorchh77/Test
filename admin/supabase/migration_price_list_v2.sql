-- Migration: price_list_items – precios adicionales, financiados y entrega
-- Ejecutar en Supabase SQL Editor
-- NOTA: precio_lista (ya existente) es el 3er precio / precio oficial de lista

ALTER TABLE public.price_list_items
  ADD COLUMN IF NOT EXISTS precio_1              BIGINT,
  ADD COLUMN IF NOT EXISTS precio_2              BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_12  BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_18  BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_24  BIGINT,
  ADD COLUMN IF NOT EXISTS entrega               BIGINT;
