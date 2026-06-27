-- Migration: price_list_items – precios de lista adicionales y precios financiados
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.price_list_items
  ADD COLUMN IF NOT EXISTS precio_lista_2    BIGINT,
  ADD COLUMN IF NOT EXISTS precio_lista_3    BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_12 BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_18 BIGINT,
  ADD COLUMN IF NOT EXISTS precio_financiado_24 BIGINT;
