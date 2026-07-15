-- ─────────────────────────────────────────────────────────────────────────
-- migration_price_list_update_11_07_2026.sql
--
-- Actualiza los precios de la lista activa según la planilla física
-- "Lista de Precios VH Automotores 11/07/2026" (49 ítems).
--
-- Todos los precios están en Guaraníes (ej. 58.500 en planilla = 58.500.000 Gs).
-- Idempotente: solo hace UPDATE a ítems existentes; no crea ni elimina.
--
-- Aplicar en: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Agregar columna de 30 cuotas si no existe
ALTER TABLE public.price_list_items
  ADD COLUMN IF NOT EXISTS precio_financiado_30 BIGINT;

-- 2. Actualizar título de la lista activa
UPDATE public.price_lists
SET titulo = 'Lista de Precios VH Automotores 11/07/2026'
WHERE activa = true;

-- 3. Actualizar precios de cada ítem dentro de la lista activa
DO $$
DECLARE
  al uuid;
BEGIN
  SELECT id INTO al FROM public.price_lists
  WHERE activa = true ORDER BY created_at DESC LIMIT 1;

  IF al IS NULL THEN
    RAISE EXCEPTION 'No hay lista de precios activa. Activá la lista antes de ejecutar este script.';
  END IF;

  -- ── TOYOTA VITZ ──────────────────────────────────────────────────────
  -- 1. Vitz 1.3 · 2015 · Blanco
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=58000000, precio_lista=57500000,
    precio_financiado_12=66000000, precio_financiado_18=69500000,
    precio_financiado_24=74000000, precio_financiado_30=NULL, entrega=25000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2015 AND color ILIKE '%Blanco%');

  -- 2. Vitz 1.3 · 2013 · Bordo
  UPDATE public.price_list_items SET
    precio_1=55000000, precio_2=NULL, precio_lista=54500000,
    precio_financiado_12=63000000, precio_financiado_18=66000000,
    precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=22000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2013 AND color ILIKE '%bordo%');

  -- 3. Vitz 1.3 · 2011 · Vino
  UPDATE public.price_list_items SET
    precio_1=51000000, precio_2=NULL, precio_lista=50000000,
    precio_financiado_12=58000000, precio_financiado_18=61500000,
    precio_financiado_24=66000000, precio_financiado_30=NULL, entrega=20000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2011 AND color ILIKE '%vino%');

  -- 4. Vitz 1.3 · 2011 · Perla
  UPDATE public.price_list_items SET
    precio_1=51000000, precio_2=NULL, precio_lista=50000000,
    precio_financiado_12=58000000, precio_financiado_18=61500000,
    precio_financiado_24=66000000, precio_financiado_30=NULL, entrega=20000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2011 AND color ILIKE '%perla%');

  -- 5. Vitz 1.3 · 2009 · Gris
  UPDATE public.price_list_items SET
    precio_1=46500000, precio_2=NULL, precio_lista=46000000,
    precio_financiado_12=53000000, precio_financiado_18=56000000,
    precio_financiado_24=60000000, precio_financiado_30=NULL, entrega=17000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2009 AND color ILIKE '%gris%');

  -- 6. Vitz 1.3 · 2007 · Bordo
  UPDATE public.price_list_items SET
    precio_1=45500000, precio_2=NULL, precio_lista=45000000,
    precio_financiado_12=52500000, precio_financiado_18=55500000,
    precio_financiado_24=60000000, precio_financiado_30=NULL, entrega=17000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2007 AND color ILIKE '%bordo%');

  -- 7. Vitz RS 1.5 · 2008 · Gris
  UPDATE public.price_list_items SET
    precio_1=54000000, precio_2=NULL, precio_lista=53000000,
    precio_financiado_12=61000000, precio_financiado_18=64000000,
    precio_financiado_24=68000000, precio_financiado_30=NULL, entrega=21000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%RS%' AND anio=2008 AND color ILIKE '%gris%');

  -- 8. Vitz RS 1.3 · 2002 · Gris
  UPDATE public.price_list_items SET
    precio_1=44000000, precio_2=43500000, precio_lista=43000000,
    precio_financiado_12=50000000, precio_financiado_18=53000000,
    precio_financiado_24=57000000, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Vitz%' AND anio=2002 AND color ILIKE '%gris%');

  -- ── TOYOTA ALLEX / RUNX ───────────────────────────────────────────────
  -- 9. Allex 1.5 c/chapa · 2002 · Perla
  UPDATE public.price_list_items SET
    precio_1=33500000, precio_2=NULL, precio_lista=33000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=24000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Allex%' AND anio=2002 AND color ILIKE '%perla%');

  -- 10. Runx 1.5 · 2005 · Plata
  UPDATE public.price_list_items SET
    precio_1=54500000, precio_2=NULL, precio_lista=54000000,
    precio_financiado_12=62000000, precio_financiado_18=65500000,
    precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Runx%' AND anio=2005 AND color ILIKE '%plata%');

  -- ── TOYOTA AURIS ─────────────────────────────────────────────────────
  -- 11. Auris 1.8 · 2008 · Perla
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=67000000, precio_financiado_18=71000000,
    precio_financiado_24=75000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Auris%' AND anio=2008 AND color ILIKE '%perla%');

  -- 12. Auris 1.5 · 2008 · Negro
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=67000000, precio_financiado_18=71000000,
    precio_financiado_24=75000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Auris%' AND anio=2008 AND color ILIKE '%negro%');

  -- 13. Auris 1.5 · 2007 · Perla
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=67000000, precio_financiado_18=71000000,
    precio_financiado_24=75000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Auris%' AND anio=2007 AND color ILIKE '%perla%');

  -- 14. Auris 1.8 · 2007 · Negro
  UPDATE public.price_list_items SET
    precio_1=58000000, precio_2=NULL, precio_lista=57000000,
    precio_financiado_12=65500000, precio_financiado_18=69000000,
    precio_financiado_24=73000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Auris%1.8%' AND anio=2007 AND color ILIKE '%negro%');

  -- 15. Auris 1.8 · 2007 · Rojo
  UPDATE public.price_list_items SET
    precio_1=58000000, precio_2=NULL, precio_lista=57000000,
    precio_financiado_12=65500000, precio_financiado_18=69000000,
    precio_financiado_24=73000000, precio_financiado_30=NULL, entrega=25000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Auris%' AND anio=2007 AND color ILIKE '%rojo%');

  -- ── TOYOTA FUNCARGO / SIENTA / RACTIS / RUMION ────────────────────────
  -- 16. Funcargo 1.3 · 2003 · Rojo
  UPDATE public.price_list_items SET
    precio_1=44000000, precio_2=NULL, precio_lista=43000000,
    precio_financiado_12=50000000, precio_financiado_18=53500000,
    precio_financiado_24=58000000, precio_financiado_30=NULL, entrega=16000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Funcargo%' AND anio=2003 AND color ILIKE '%rojo%');

  -- 17. Sienta 1.5 · 2009 · Perla
  UPDATE public.price_list_items SET
    precio_1=47500000, precio_2=NULL, precio_lista=47000000,
    precio_financiado_12=55000000, precio_financiado_18=58500000,
    precio_financiado_24=63000000, precio_financiado_30=NULL, entrega=18000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Sienta%' AND anio=2009 AND color ILIKE '%perla%');

  -- 18. Sienta 1.5 · 2007 · Gris
  UPDATE public.price_list_items SET
    precio_1=45500000, precio_2=NULL, precio_lista=45000000,
    precio_financiado_12=53000000, precio_financiado_18=56000000,
    precio_financiado_24=60000000, precio_financiado_30=NULL, entrega=16000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Sienta%' AND anio=2007 AND color ILIKE '%gris%');

  -- 19. Ractis 1.5 · 2011 · Plata
  UPDATE public.price_list_items SET
    precio_1=55000000, precio_2=54500000, precio_lista=54000000,
    precio_financiado_12=63000000, precio_financiado_18=66000000,
    precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=23000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Ractis%' AND anio=2011 AND color ILIKE '%plata%');

  -- 20. Ractis 1.5 · 2010 · Perla
  UPDATE public.price_list_items SET
    precio_1=52500000, precio_2=NULL, precio_lista=52000000,
    precio_financiado_12=60000000, precio_financiado_18=63000000,
    precio_financiado_24=67000000, precio_financiado_30=NULL, entrega=20000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Ractis%' AND anio=2010 AND color ILIKE '%perla%');

  -- 21. Rumion 1.8 · 2008 · Bordo
  UPDATE public.price_list_items SET
    precio_1=37500000, precio_2=NULL, precio_lista=37000000,
    precio_financiado_12=43000000, precio_financiado_18=46000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Rumion%' AND anio=2008 AND color ILIKE '%bordo%');

  -- ── TOYOTA CALDINA / PREMIO / ALLION ─────────────────────────────────
  -- 22. Caldina 1.8 · 2005 · Negro
  UPDATE public.price_list_items SET
    precio_1=56000000, precio_2=NULL, precio_lista=55000000,
    precio_financiado_12=62500000, precio_financiado_18=66000000,
    precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=25000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Caldina%' AND anio=2005 AND color ILIKE '%negro%');

  -- 23. Premio 1.8 · 2009 · Perla
  UPDATE public.price_list_items SET
    precio_1=67000000, precio_2=NULL, precio_lista=66000000,
    precio_financiado_12=75000000, precio_financiado_18=78500000,
    precio_financiado_24=83000000, precio_financiado_30=NULL, entrega=29000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Premio%' AND anio=2009 AND color ILIKE '%perla%');

  -- 24. Allion 2.0 · 2008 · Perla
  UPDATE public.price_list_items SET
    precio_1=68000000, precio_2=NULL, precio_lista=67000000,
    precio_financiado_12=76000000, precio_financiado_18=79000000,
    precio_financiado_24=83000000, precio_financiado_30=NULL, entrega=29000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Allion%2.0%' AND anio=2008 AND color ILIKE '%perla%');

  -- 25. Allion 1.5 · 2003 · Blanco
  UPDATE public.price_list_items SET
    precio_1=54000000, precio_2=NULL, precio_lista=53000000,
    precio_financiado_12=61000000, precio_financiado_18=64000000,
    precio_financiado_24=68000000, precio_financiado_30=NULL, entrega=22000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Allion%' AND anio=2003 AND color ILIKE '%blanco%');

  -- ── TOYOTA COROLLA ───────────────────────────────────────────────────
  -- 26. Corolla diesel 2.0 · 2003 · Plata  (M/T)
  UPDATE public.price_list_items SET
    precio_1=28000000, precio_2=NULL, precio_lista=28000000,
    precio_financiado_12=35000000, precio_financiado_18=38000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=13000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Corolla%diesel%' AND anio=2003 AND color ILIKE '%plata%');

  -- 27. Corolla 2.0 Orig. · 1999 · Azul  (M/T)
  UPDATE public.price_list_items SET
    precio_1=33000000, precio_2=NULL, precio_lista=32000000,
    precio_financiado_12=36000000, precio_financiado_18=39000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=18000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Corolla%' AND anio=1999 AND color ILIKE '%azul%');

  -- ── TOYOTA VOXY ──────────────────────────────────────────────────────
  -- 28. Voxy Híbrido 2.0 · 2014 · Azul
  UPDATE public.price_list_items SET
    precio_1=97000000, precio_2=NULL, precio_lista=95000000,
    precio_financiado_12=110000000, precio_financiado_18=113500000,
    precio_financiado_24=118000000, precio_financiado_30=NULL, entrega=45000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Voxy%' AND anio=2014 AND color ILIKE '%azul%');

  -- 29. Voxy 2.0 · 2012 · Perla
  UPDATE public.price_list_items SET
    precio_1=66000000, precio_2=NULL, precio_lista=65000000,
    precio_financiado_12=73500000, precio_financiado_18=77000000,
    precio_financiado_24=82000000, precio_financiado_30=NULL, entrega=32000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Voxy%' AND anio=2012 AND color ILIKE '%perla%');

  -- ── MERCEDES-BENZ ────────────────────────────────────────────────────
  -- 30. Mercedes 300D 3.0 · 1989 · Blanco
  UPDATE public.price_list_items SET
    precio_1=50000000, precio_2=NULL, precio_lista=50000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Mercedes%' AND modelo ILIKE '%300D%' AND anio=1989 AND color ILIKE '%blanco%');

  -- 31. Porsche Boxter · 2000 · Negro
  UPDATE public.price_list_items SET
    precio_1=18000000, precio_2=NULL, precio_lista=18000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=12000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Porsche%' AND modelo ILIKE '%Boxter%' AND anio=2000 AND color ILIKE '%negro%');

  -- 32. Mercedes Benz Sprinter · 1998 · Blanco (M/T)
  -- Precio en planilla: Gs20-Gs19 (millones); 12m: Gs25; Entrega: Gs12M
  UPDATE public.price_list_items SET
    precio_1=20000000, precio_2=NULL, precio_lista=19000000,
    precio_financiado_12=25000000, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=12000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Mercedes%' AND modelo ILIKE '%Sprinter%' AND anio=1998 AND color ILIKE '%blanco%');

  -- 33. Mercedes Benz E350 diesel · 2013 · Beige
  UPDATE public.price_list_items SET
    precio_1=21000000, precio_2=NULL, precio_lista=20000000,
    precio_financiado_12=23000000, precio_financiado_18=NULL,
    precio_financiado_24=24000000, precio_financiado_30=NULL, entrega=55000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Mercedes%' AND modelo ILIKE '%E350%' AND anio=2013 AND color ILIKE '%beige%');

  -- ── ISUZU / TOYOTA HILUX / NISSAN ────────────────────────────────────
  -- 34. Isuzu D-Max 4x4 · 2010 · Negro
  UPDATE public.price_list_items SET
    precio_1=108000000, precio_2=NULL, precio_lista=106000000,
    precio_financiado_12=117000000, precio_financiado_18=121000000,
    precio_financiado_24=125000000, precio_financiado_30=NULL, entrega=130000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Isuzu%' AND modelo ILIKE '%D-Max%' AND anio=2010 AND color ILIKE '%negro%');

  -- 35. Toyota Hilux 4x4 2.8 · 2019 · Bordo
  UPDATE public.price_list_items SET
    precio_1=267000000, precio_2=265000000, precio_lista=260000000,
    precio_financiado_12=290000000, precio_financiado_18=295000000,
    precio_financiado_24=300000000, precio_financiado_30=NULL, entrega=95000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE 'Toyota' AND modelo ILIKE '%Hilux%' AND anio=2019 AND color ILIKE '%bordo%');

  -- ── NISSAN / VOLKSWAGEN / FIAT ────────────────────────────────────────
  -- 37. Nissan Navara 2.5 4x4 · 2009 · Plata
  UPDATE public.price_list_items SET
    precio_1=88000000, precio_2=87000000, precio_lista=85000000,
    precio_financiado_12=97000000, precio_financiado_18=100000000,
    precio_financiado_24=105000000, precio_financiado_30=NULL, entrega=45000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Nissan%' AND modelo ILIKE '%Navara%' AND anio=2009 AND color ILIKE '%plata%');

  -- 38. Volkswagen Amarok 4x2 · 2011 · Gris  (M/T)
  UPDATE public.price_list_items SET
    precio_1=88000000, precio_2=87000000, precio_lista=85000000,
    precio_financiado_12=97000000, precio_financiado_18=101000000,
    precio_financiado_24=106000000, precio_financiado_30=NULL, entrega=45000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Volkswagen%' AND modelo ILIKE '%Amarok%' AND anio=2011 AND color ILIKE '%gris%');

  -- 39. Fiat Strada · 2018 · Negro  (M/T)
  UPDATE public.price_list_items SET
    precio_1=77000000, precio_2=NULL, precio_lista=75000000,
    precio_financiado_12=90000000, precio_financiado_18=94000000,
    precio_financiado_24=98000000, precio_financiado_30=NULL, entrega=40000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Fiat%' AND modelo ILIKE '%Strada%' AND anio=2018 AND color ILIKE '%negro%');

  -- ── HYUNDAI ──────────────────────────────────────────────────────────
  -- 40. Hyundai Tucson 4x2 · 2013 · Blanco
  UPDATE public.price_list_items SET
    precio_1=81000000, precio_2=NULL, precio_lista=80000000,
    precio_financiado_12=95000000, precio_financiado_18=98000000,
    precio_financiado_24=103000000, precio_financiado_30=NULL, entrega=38000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Hyundai%' AND modelo ILIKE '%Tucson%' AND anio=2013 AND color ILIKE '%blanco%');

  -- 41. Hyundai Tucson 4x2 · 2005 · Celeste
  UPDATE public.price_list_items SET
    precio_1=39500000, precio_2=NULL, precio_lista=39000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Hyundai%' AND modelo ILIKE '%Tucson%' AND anio=2005 AND color ILIKE '%celeste%');

  -- 42. Hyundai Santa Fe 2.2 4x2 · 2019 · Plata
  UPDATE public.price_list_items SET
    precio_1=198000000, precio_2=197000000, precio_lista=195000000,
    precio_financiado_12=218000000, precio_financiado_18=222500000,
    precio_financiado_24=227000000, precio_financiado_30=232000000, entrega=95000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Hyundai%' AND modelo ILIKE '%Santa Fe%' AND anio=2019 AND color ILIKE '%plata%');

  -- 43. Hyundai Santa Fe 4x2 · 2016 · Perla
  UPDATE public.price_list_items SET
    precio_1=120000000, precio_2=119000000, precio_lista=118000000,
    precio_financiado_12=137000000, precio_financiado_18=141000000,
    precio_financiado_24=145000000, precio_financiado_30=150000000, entrega=50000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Hyundai%' AND modelo ILIKE '%Santa Fe%' AND anio=2016 AND color ILIKE '%perla%');

  -- ── KIA SPORTAGE ─────────────────────────────────────────────────────
  -- 44. Kia Sportage 2.0 diesel · 2016 · Perla
  UPDATE public.price_list_items SET
    precio_1=120000000, precio_2=119000000, precio_lista=118000000,
    precio_financiado_12=136000000, precio_financiado_18=140000000,
    precio_financiado_24=145000000, precio_financiado_30=150000000, entrega=58000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Kia%' AND modelo ILIKE '%Sportage%' AND anio=2016 AND color ILIKE '%perla%');

  -- 45. Kia Sportage 2.0 diesel · 2013 · Blanco
  UPDATE public.price_list_items SET
    precio_1=88000000, precio_2=87000000, precio_lista=86000000,
    precio_financiado_12=102000000, precio_financiado_18=106000000,
    precio_financiado_24=110000000, precio_financiado_30=NULL, entrega=42000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Kia%' AND modelo ILIKE '%Sportage%' AND anio=2013 AND color ILIKE '%blanco%');

  -- 46. Kia Sportage 2.0 diesel · 2012 · Azul
  UPDATE public.price_list_items SET
    precio_1=86000000, precio_2=85000000, precio_lista=84000000,
    precio_financiado_12=100000000, precio_financiado_18=104000000,
    precio_financiado_24=108000000, precio_financiado_30=NULL, entrega=42000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Kia%' AND modelo ILIKE '%Sportage%' AND anio=2012 AND color ILIKE '%azul%');

  -- 47. Kia Sportage 2.0 diesel · 2011 · Azul
  UPDATE public.price_list_items SET
    precio_1=84000000, precio_2=83000000, precio_lista=82000000,
    precio_financiado_12=98000000, precio_financiado_18=102000000,
    precio_financiado_24=106000000, precio_financiado_30=NULL, entrega=40000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Kia%' AND modelo ILIKE '%Sportage%' AND anio=2011 AND color ILIKE '%azul%');

  -- 48. Kia Sportage 2.0 diesel · 2011 · Blanco
  UPDATE public.price_list_items SET
    precio_1=83000000, precio_2=82000000, precio_lista=81000000,
    precio_financiado_12=96000000, precio_financiado_18=100000000,
    precio_financiado_24=104000000, precio_financiado_30=NULL, entrega=39000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Kia%' AND modelo ILIKE '%Sportage%' AND anio=2011 AND color ILIKE '%blanco%');

  -- ── CHANGAN ──────────────────────────────────────────────────────────
  -- 49. Changan CS35 · 2016 · Plata  (M/T)
  UPDATE public.price_list_items SET
    precio_1=29000000, precio_2=NULL, precio_lista=28000000,
    precio_financiado_12=38000000, precio_financiado_18=41000000,
    precio_financiado_24=45000000, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id IN (
    SELECT id FROM public.vehicles
    WHERE marca ILIKE '%Changan%' AND modelo ILIKE '%CS35%' AND anio=2016 AND color ILIKE '%plata%');

  RAISE NOTICE 'Actualización de lista de precios 11/07/2026 completada.';
END;
$$;
