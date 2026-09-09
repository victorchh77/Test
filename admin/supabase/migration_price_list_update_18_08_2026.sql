-- ─────────────────────────────────────────────────────────────────────────
-- migration_price_list_update_18_08_2026.sql
--
-- Actualiza vehiculos y la lista de precios activa segun la planilla fisica
-- "LISTA DE PRECIOS DE VEHICULOS VH AUTOMOTORES 18/08/2026" (Hoja1, 57 items).
--
-- Convenciones de la planilla (confirmadas cruzando contra precios ya
-- guardados en la base, ej. Isuzu D-Max "108-106" == Gs 108.000.000 actual):
--   - Numeros sueltos (< 1000) representan millones de Gs: "45" = Gs 45.000.000
--   - Numeros con punto o >= 1000 representan miles de Gs: "58.500"/"58500" = Gs 58.500.000
--   - CONTADO con guiones = 2 o 3 precios escalonados (mayor-medio-menor):
--       precio_1 = mayor, precio_2 = medio (si hay 3), precio_lista = menor/piso
--   - vehicles.precio_venta se actualiza al precio_1 (precio de lista estandar
--     que se cotiza primero), consistente con la mayoria de los precios ya
--     guardados (ej. Isuzu D-Max, Vitz 2011 Vino, Mercedes E350 coinciden con
--     el primer valor del guion, no el ultimo).
--   - Excepcion: Porsche Boxster y Mercedes Benz E350 (filas junto al segundo
--     encabezado) estan en USD, escritos literalmente sin el factor de
--     escala Gs (ej. "21.000-20.000" = USD 21.000/20.000 -- confirmado contra
--     el precio USD 21.000 ya guardado para el E350 desde una correccion
--     previa de esta misma sesion).
--
-- Vehiculos SIN precio en la planilla (11 filas en blanco) NO se tocan --
-- no hay forma de distinguir "vendido" de "todavia sin cargar precio" solo
-- por el formato de la celda, y el pedido fue actualizar los que siguen
-- disponibles, no marcar otros como vendidos.
--
-- Aplicar en: Supabase Dashboard -> SQL Editor. Idempotente (solo UPDATE a
-- vehiculos existentes; los 6 vehiculos nuevos se insertan con un guard
-- "WHERE NOT EXISTS" para poder re-ejecutar sin duplicar).
-- ─────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  al uuid;              -- id de la lista de precios activa
  vid uuid;              -- id de vehiculo (para altas nuevas)
  updated int;
BEGIN
  SELECT id INTO al FROM public.price_lists WHERE activa = true ORDER BY created_at DESC LIMIT 1;
  IF al IS NULL THEN
    RAISE EXCEPTION 'No hay lista de precios activa.';
  END IF;

  UPDATE public.price_lists SET titulo = 'Lista de Precios VH Automotores 18/08/2026' WHERE id = al;

  -- ══════════════ VEHICULOS EXISTENTES (actualizar precio) ══════════════

  -- #1 Toyota Vitz 1.3 · 2015 · Blanco
  UPDATE public.vehicles SET precio_venta=58000000, moneda='Gs' WHERE id='616a1690-3b81-4d1f-9620-4d713642745a';
  UPDATE public.price_list_items SET
    precio_1=58000000, precio_2=NULL, precio_lista=57500000,
    precio_financiado_12=66000000, precio_financiado_18=69500000,
    precio_financiado_24=74000000, precio_financiado_30=NULL, entrega=24000000
  WHERE price_list_id=al AND vehicle_id='616a1690-3b81-4d1f-9620-4d713642745a';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '616a1690-3b81-4d1f-9620-4d713642745a', 58000000, NULL, 57500000,
      66000000, 69500000, 74000000, NULL, 24000000);
  END IF;

  -- #4 Toyota Vitz 1.3 · 2011 · vino
  UPDATE public.vehicles SET precio_venta=50000000, moneda='Gs' WHERE id='f5f475f4-deca-4ec7-9e4d-1e65cb5d358c';
  UPDATE public.price_list_items SET
    precio_1=50000000, precio_2=49500000, precio_lista=49000000,
    precio_financiado_12=57000000, precio_financiado_18=60500000,
    precio_financiado_24=65000000, precio_financiado_30=69000000, entrega=19000000
  WHERE price_list_id=al AND vehicle_id='f5f475f4-deca-4ec7-9e4d-1e65cb5d358c';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'f5f475f4-deca-4ec7-9e4d-1e65cb5d358c', 50000000, 49500000, 49000000,
      57000000, 60500000, 65000000, 69000000, 19000000);
  END IF;

  -- #5 Toyota Vitz 1.3 · 2011 · perla
  UPDATE public.vehicles SET precio_venta=50000000, moneda='Gs' WHERE id='da150806-b7c8-453f-878f-bbfab5238294';
  UPDATE public.price_list_items SET
    precio_1=50000000, precio_2=49500000, precio_lista=49000000,
    precio_financiado_12=57000000, precio_financiado_18=60500000,
    precio_financiado_24=65000000, precio_financiado_30=69000000, entrega=19000000
  WHERE price_list_id=al AND vehicle_id='da150806-b7c8-453f-878f-bbfab5238294';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'da150806-b7c8-453f-878f-bbfab5238294', 50000000, 49500000, 49000000,
      57000000, 60500000, 65000000, 69000000, 19000000);
  END IF;

  -- #6 Toyota Vitz 1.3 · 2009 · gris
  UPDATE public.vehicles SET precio_venta=44500000, moneda='Gs' WHERE id='3ed728f5-1e3d-4102-afb9-0388f2db73eb';
  UPDATE public.price_list_items SET
    precio_1=44500000, precio_2=NULL, precio_lista=44000000,
    precio_financiado_12=52000000, precio_financiado_18=55500000,
    precio_financiado_24=60000000, precio_financiado_30=NULL, entrega=16000000
  WHERE price_list_id=al AND vehicle_id='3ed728f5-1e3d-4102-afb9-0388f2db73eb';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '3ed728f5-1e3d-4102-afb9-0388f2db73eb', 44500000, NULL, 44000000,
      52000000, 55500000, 60000000, NULL, 16000000);
  END IF;

  -- #7 Toyota Vitz 1.3 · 2007 · bordo
  UPDATE public.vehicles SET precio_venta=45000000, moneda='Gs' WHERE id='d41ed473-2bc7-43b8-bdde-8d13ea0bbc01';
  UPDATE public.price_list_items SET
    precio_1=45000000, precio_2=NULL, precio_lista=45000000,
    precio_financiado_12=52000000, precio_financiado_18=55500000,
    precio_financiado_24=60000000, precio_financiado_30=NULL, entrega=16000000
  WHERE price_list_id=al AND vehicle_id='d41ed473-2bc7-43b8-bdde-8d13ea0bbc01';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'd41ed473-2bc7-43b8-bdde-8d13ea0bbc01', 45000000, NULL, 45000000,
      52000000, 55500000, 60000000, NULL, 16000000);
  END IF;

  -- #9 Toyota Vitz RS 1.5 · 2008 · gris
  UPDATE public.vehicles SET precio_venta=53000000, moneda='Gs' WHERE id='4a5e25d9-0dcf-4684-9e4a-15ac52005804';
  UPDATE public.price_list_items SET
    precio_1=53000000, precio_2=NULL, precio_lista=52000000,
    precio_financiado_12=60000000, precio_financiado_18=63000000,
    precio_financiado_24=67000000, precio_financiado_30=NULL, entrega=21000000
  WHERE price_list_id=al AND vehicle_id='4a5e25d9-0dcf-4684-9e4a-15ac52005804';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '4a5e25d9-0dcf-4684-9e4a-15ac52005804', 53000000, NULL, 52000000,
      60000000, 63000000, 67000000, NULL, 21000000);
  END IF;

  -- #10 Toyota Vitz RS 1.3 · 2002 · gris
  UPDATE public.vehicles SET precio_venta=41000000, moneda='Gs' WHERE id='e4f446ed-4b40-44c9-989c-03c1c49ca01b';
  UPDATE public.price_list_items SET
    precio_1=41000000, precio_2=NULL, precio_lista=40000000,
    precio_financiado_12=47000000, precio_financiado_18=52000000,
    precio_financiado_24=55000000, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id='e4f446ed-4b40-44c9-989c-03c1c49ca01b';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'e4f446ed-4b40-44c9-989c-03c1c49ca01b', 41000000, NULL, 40000000,
      47000000, 52000000, 55000000, NULL, 15000000);
  END IF;

  -- #12 Toyota Allex 1.5 c/ chapa · 2002 · perla
  UPDATE public.vehicles SET precio_venta=33000000, moneda='Gs' WHERE id='3d52a51d-a4b4-42cf-a598-bd945107d07c';
  UPDATE public.price_list_items SET
    precio_1=33000000, precio_2=NULL, precio_lista=32000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id='3d52a51d-a4b4-42cf-a598-bd945107d07c';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '3d52a51d-a4b4-42cf-a598-bd945107d07c', 33000000, NULL, 32000000,
      NULL, NULL, NULL, NULL, NULL);
  END IF;

  -- #13 Toyota Runx 1.5 · 2005 · Plata
  UPDATE public.vehicles SET precio_venta=54500000, moneda='Gs' WHERE id='325de599-24c2-4123-9660-32bad70106ad';
  UPDATE public.price_list_items SET
    precio_1=54500000, precio_2=NULL, precio_lista=54000000,
    precio_financiado_12=61000000, precio_financiado_18=64500000,
    precio_financiado_24=69000000, precio_financiado_30=NULL, entrega=24000000
  WHERE price_list_id=al AND vehicle_id='325de599-24c2-4123-9660-32bad70106ad';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '325de599-24c2-4123-9660-32bad70106ad', 54500000, NULL, 54000000,
      61000000, 64500000, 69000000, NULL, 24000000);
  END IF;

  -- #14 Toyota Auris 1.8 · 2008 · perla
  UPDATE public.vehicles SET precio_venta=58500000, moneda='Gs' WHERE id='893c1893-7d4f-4a9e-99ad-8c3584d71a1c';
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=65000000, precio_financiado_18=68500000,
    precio_financiado_24=73000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id='893c1893-7d4f-4a9e-99ad-8c3584d71a1c';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '893c1893-7d4f-4a9e-99ad-8c3584d71a1c', 58500000, NULL, 58000000,
      65000000, 68500000, 73000000, NULL, 26000000);
  END IF;

  -- #15 Toyota Auris 1.5 · 2007 · perla
  UPDATE public.vehicles SET precio_venta=58500000, moneda='Gs' WHERE id='a188a86b-0e90-47d9-b91d-086e15b18df3';
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=65000000, precio_financiado_18=68500000,
    precio_financiado_24=73000000, precio_financiado_30=NULL, entrega=26000000
  WHERE price_list_id=al AND vehicle_id='a188a86b-0e90-47d9-b91d-086e15b18df3';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'a188a86b-0e90-47d9-b91d-086e15b18df3', 58500000, NULL, 58000000,
      65000000, 68500000, 73000000, NULL, 26000000);
  END IF;

  -- #16 Toyota Auris 1.8 · 2007 · Negro
  UPDATE public.vehicles SET precio_venta=58500000, moneda='Gs' WHERE id='5c624dd5-060d-43bc-b5e5-748cae6f6bfa';
  UPDATE public.price_list_items SET
    precio_1=58500000, precio_2=NULL, precio_lista=58000000,
    precio_financiado_12=64000000, precio_financiado_18=67500000,
    precio_financiado_24=72000000, precio_financiado_30=NULL, entrega=25000000
  WHERE price_list_id=al AND vehicle_id='5c624dd5-060d-43bc-b5e5-748cae6f6bfa';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '5c624dd5-060d-43bc-b5e5-748cae6f6bfa', 58500000, NULL, 58000000,
      64000000, 67500000, 72000000, NULL, 25000000);
  END IF;

  -- #18 Toyota Funcargo 1.3 · 2003 · rojo
  UPDATE public.vehicles SET precio_venta=43500000, moneda='Gs' WHERE id='c946e0ad-d949-41c7-811f-158ae38bc971';
  UPDATE public.price_list_items SET
    precio_1=43500000, precio_2=NULL, precio_lista=43000000,
    precio_financiado_12=49000000, precio_financiado_18=52000000,
    precio_financiado_24=56000000, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id='c946e0ad-d949-41c7-811f-158ae38bc971';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'c946e0ad-d949-41c7-811f-158ae38bc971', 43500000, NULL, 43000000,
      49000000, 52000000, 56000000, NULL, 15000000);
  END IF;

  -- #19 Toyota Sienta 1.5 · 2009 · perla
  UPDATE public.vehicles SET precio_venta=46500000, moneda='Gs' WHERE id='e1c33412-cda6-46e2-a182-ec0a612b7915';
  UPDATE public.price_list_items SET
    precio_1=46500000, precio_2=NULL, precio_lista=46000000,
    precio_financiado_12=53500000, precio_financiado_18=57000000,
    precio_financiado_24=61000000, precio_financiado_30=NULL, entrega=17000000
  WHERE price_list_id=al AND vehicle_id='e1c33412-cda6-46e2-a182-ec0a612b7915';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'e1c33412-cda6-46e2-a182-ec0a612b7915', 46500000, NULL, 46000000,
      53500000, 57000000, 61000000, NULL, 17000000);
  END IF;

  -- #20 Toyota Sienta 1.5 · 2007 · gris
  UPDATE public.vehicles SET precio_venta=45000000, moneda='Gs' WHERE id='798b79f1-4e24-48ba-8ff3-78a655624890';
  UPDATE public.price_list_items SET
    precio_1=45000000, precio_2=NULL, precio_lista=44500000,
    precio_financiado_12=52000000, precio_financiado_18=55000000,
    precio_financiado_24=59000000, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id='798b79f1-4e24-48ba-8ff3-78a655624890';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '798b79f1-4e24-48ba-8ff3-78a655624890', 45000000, NULL, 44500000,
      52000000, 55000000, 59000000, NULL, 15000000);
  END IF;

  -- #21 Toyota Ractis 1.5 · 2011 · Plata
  UPDATE public.vehicles SET precio_venta=54000000, moneda='Gs' WHERE id='151a3cd8-9497-4f6a-8084-8012362dbbc2';
  UPDATE public.price_list_items SET
    precio_1=54000000, precio_2=NULL, precio_lista=53000000,
    precio_financiado_12=62000000, precio_financiado_18=65000000,
    precio_financiado_24=69000000, precio_financiado_30=NULL, entrega=22000000
  WHERE price_list_id=al AND vehicle_id='151a3cd8-9497-4f6a-8084-8012362dbbc2';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '151a3cd8-9497-4f6a-8084-8012362dbbc2', 54000000, NULL, 53000000,
      62000000, 65000000, 69000000, NULL, 22000000);
  END IF;

  -- #22 Toyota Ractis 1.5 · 2010 · perla
  UPDATE public.vehicles SET precio_venta=51000000, moneda='Gs' WHERE id='fecf1bab-7de4-4f70-8e17-48a8d99acffe';
  UPDATE public.price_list_items SET
    precio_1=51000000, precio_2=NULL, precio_lista=50000000,
    precio_financiado_12=58000000, precio_financiado_18=61000000,
    precio_financiado_24=65000000, precio_financiado_30=NULL, entrega=20000000
  WHERE price_list_id=al AND vehicle_id='fecf1bab-7de4-4f70-8e17-48a8d99acffe';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'fecf1bab-7de4-4f70-8e17-48a8d99acffe', 51000000, NULL, 50000000,
      58000000, 61000000, 65000000, NULL, 20000000);
  END IF;

  -- #26 Toyota Rumion 1.8 · 2008 · Bordo
  UPDATE public.vehicles SET precio_venta=35000000, moneda='Gs' WHERE id='3e6658fa-e6fc-41d3-a617-016765a3aaaa';
  UPDATE public.price_list_items SET
    precio_1=35000000, precio_2=NULL, precio_lista=35000000,
    precio_financiado_12=40000000, precio_financiado_18=43000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=15000000
  WHERE price_list_id=al AND vehicle_id='3e6658fa-e6fc-41d3-a617-016765a3aaaa';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '3e6658fa-e6fc-41d3-a617-016765a3aaaa', 35000000, NULL, 35000000,
      40000000, 43000000, NULL, NULL, 15000000);
  END IF;

  -- #28 Toyota Caldina 1.8 · 2005 · Negro
  UPDATE public.vehicles SET precio_venta=55000000, moneda='Gs' WHERE id='153235ee-0083-4a87-b080-5c2eadcadb5a';
  UPDATE public.price_list_items SET
    precio_1=55000000, precio_2=NULL, precio_lista=54000000,
    precio_financiado_12=62500000, precio_financiado_18=66000000,
    precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=25000000
  WHERE price_list_id=al AND vehicle_id='153235ee-0083-4a87-b080-5c2eadcadb5a';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '153235ee-0083-4a87-b080-5c2eadcadb5a', 55000000, NULL, 54000000,
      62500000, 66000000, 70000000, NULL, 25000000);
  END IF;

  -- #29 Toyota Premio 1.8 · 2009 · perla
  UPDATE public.vehicles SET precio_venta=66000000, moneda='Gs' WHERE id='36eb980a-0938-425c-9c46-eded08efabc9';
  UPDATE public.price_list_items SET
    precio_1=66000000, precio_2=NULL, precio_lista=65000000,
    precio_financiado_12=73000000, precio_financiado_18=76000000,
    precio_financiado_24=80000000, precio_financiado_30=NULL, entrega=28000000
  WHERE price_list_id=al AND vehicle_id='36eb980a-0938-425c-9c46-eded08efabc9';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '36eb980a-0938-425c-9c46-eded08efabc9', 66000000, NULL, 65000000,
      73000000, 76000000, 80000000, NULL, 28000000);
  END IF;

  -- #31 Toyota Allion 1.5 · 2003 · Blanco
  UPDATE public.vehicles SET precio_venta=53000000, moneda='Gs' WHERE id='e4983501-aba3-4659-8da2-9ec9ce523659';
  UPDATE public.price_list_items SET
    precio_1=53000000, precio_2=NULL, precio_lista=52000000,
    precio_financiado_12=59000000, precio_financiado_18=62000000,
    precio_financiado_24=66000000, precio_financiado_30=NULL, entrega=20000000
  WHERE price_list_id=al AND vehicle_id='e4983501-aba3-4659-8da2-9ec9ce523659';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'e4983501-aba3-4659-8da2-9ec9ce523659', 53000000, NULL, 52000000,
      59000000, 62000000, 66000000, NULL, 20000000);
  END IF;

  -- #32 Corolla diesel 2.0 · 2003 · plata
  UPDATE public.vehicles SET precio_venta=27000000, moneda='Gs' WHERE id='199cdca9-2579-4f5b-bc6d-712b99bb9420';
  UPDATE public.price_list_items SET
    precio_1=27000000, precio_2=NULL, precio_lista=27000000,
    precio_financiado_12=34000000, precio_financiado_18=37000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=13000000
  WHERE price_list_id=al AND vehicle_id='199cdca9-2579-4f5b-bc6d-712b99bb9420';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '199cdca9-2579-4f5b-bc6d-712b99bb9420', 27000000, NULL, 27000000,
      34000000, 37000000, NULL, NULL, 13000000);
  END IF;

  -- #33 Toyota Corolla 2.0 Orig. · 1999 · Azul
  UPDATE public.vehicles SET precio_venta=33000000, moneda='Gs' WHERE id='2626e322-3490-4bac-b478-db59da45eafb';
  UPDATE public.price_list_items SET
    precio_1=33000000, precio_2=NULL, precio_lista=32000000,
    precio_financiado_12=36000000, precio_financiado_18=39000000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=18000000
  WHERE price_list_id=al AND vehicle_id='2626e322-3490-4bac-b478-db59da45eafb';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '2626e322-3490-4bac-b478-db59da45eafb', 33000000, NULL, 32000000,
      36000000, 39000000, NULL, NULL, 18000000);
  END IF;

  -- #34 Toyota Voxy Hybrido 2.0 · 2014 · Azul
  UPDATE public.vehicles SET precio_venta=95000000, moneda='Gs' WHERE id='f32c63be-bc5b-4e65-b650-5033c32f566e';
  UPDATE public.price_list_items SET
    precio_1=95000000, precio_2=94000000, precio_lista=93000000,
    precio_financiado_12=108000000, precio_financiado_18=112000000,
    precio_financiado_24=116000000, precio_financiado_30=NULL, entrega=45000000
  WHERE price_list_id=al AND vehicle_id='f32c63be-bc5b-4e65-b650-5033c32f566e';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'f32c63be-bc5b-4e65-b650-5033c32f566e', 95000000, 94000000, 93000000,
      108000000, 112000000, 116000000, NULL, 45000000);
  END IF;

  -- #35 Toyota Voxy 2.0 · 2012 · perla
  UPDATE public.vehicles SET precio_venta=66000000, moneda='Gs' WHERE id='51c04451-1d98-45d2-aed9-c886fdee50b7';
  UPDATE public.price_list_items SET
    precio_1=66000000, precio_2=NULL, precio_lista=65000000,
    precio_financiado_12=73500000, precio_financiado_18=77000000,
    precio_financiado_24=82000000, precio_financiado_30=NULL, entrega=32000000
  WHERE price_list_id=al AND vehicle_id='51c04451-1d98-45d2-aed9-c886fdee50b7';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '51c04451-1d98-45d2-aed9-c886fdee50b7', 66000000, NULL, 65000000,
      73500000, 77000000, 82000000, NULL, 32000000);
  END IF;

  -- #37 Mercedes 300D 3.0 · 1989 · Blanco
  UPDATE public.vehicles SET precio_venta=50000000, moneda='Gs' WHERE id='d3ea857a-df0f-4b48-aa6b-87dcdea92362';
  UPDATE public.price_list_items SET
    precio_1=50000000, precio_2=NULL, precio_lista=50000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id='d3ea857a-df0f-4b48-aa6b-87dcdea92362';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'd3ea857a-df0f-4b48-aa6b-87dcdea92362', 50000000, NULL, 50000000,
      NULL, NULL, NULL, NULL, NULL);
  END IF;

  -- #38 Porshe Boxter · 2000 · Negro
  UPDATE public.vehicles SET precio_venta=18000, moneda='USD' WHERE id='a246e84c-d5d1-44cb-9822-c8ff67c37cdc';
  UPDATE public.price_list_items SET
    precio_1=18000, precio_2=NULL, precio_lista=18000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id='a246e84c-d5d1-44cb-9822-c8ff67c37cdc';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'a246e84c-d5d1-44cb-9822-c8ff67c37cdc', 18000, NULL, 18000,
      NULL, NULL, NULL, NULL, NULL);
  END IF;

  -- #39 Mercedez Benz Sprinter · 1998 · Blanco
  UPDATE public.vehicles SET precio_venta=20000000, moneda='Gs' WHERE id='7cc6f3f7-92e0-498f-9925-6291494fb897';
  UPDATE public.price_list_items SET
    precio_1=20000000, precio_2=NULL, precio_lista=19000000,
    precio_financiado_12=25000000, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=12000000
  WHERE price_list_id=al AND vehicle_id='7cc6f3f7-92e0-498f-9925-6291494fb897';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '7cc6f3f7-92e0-498f-9925-6291494fb897', 20000000, NULL, 19000000,
      25000000, NULL, NULL, NULL, 12000000);
  END IF;

  -- #40 Mercedez Benz E350-diesel · 2013 · Beige (color en la base decia "Plata"; la planilla nueva dice "Beige" — se corrige)
  UPDATE public.vehicles SET precio_venta=21000, moneda='USD', color='Beige' WHERE id='7e290564-aada-4183-8803-20765587c697';
  UPDATE public.price_list_items SET
    precio_1=21000, precio_2=NULL, precio_lista=20000,
    precio_financiado_12=23000, precio_financiado_18=24000,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=12000
  WHERE price_list_id=al AND vehicle_id='7e290564-aada-4183-8803-20765587c697';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '7e290564-aada-4183-8803-20765587c697', 21000, NULL, 20000,
      23000, 24000, NULL, NULL, 12000);
  END IF;

  -- #41 Isuzu D-Max 4x4 · 2010 · Negro
  UPDATE public.vehicles SET precio_venta=108000000, moneda='Gs' WHERE id='6b7957de-f556-4e48-9e58-558082bed2cc';
  UPDATE public.price_list_items SET
    precio_1=108000000, precio_2=NULL, precio_lista=106000000,
    precio_financiado_12=117000000, precio_financiado_18=121000000,
    precio_financiado_24=125000000, precio_financiado_30=NULL, entrega=55000000
  WHERE price_list_id=al AND vehicle_id='6b7957de-f556-4e48-9e58-558082bed2cc';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '6b7957de-f556-4e48-9e58-558082bed2cc', 108000000, NULL, 106000000,
      117000000, 121000000, 125000000, NULL, 55000000);
  END IF;

  -- #42 Hilux 4X4 2.8 · 2019 · Bordo
  UPDATE public.vehicles SET precio_venta=253000000, moneda='Gs' WHERE id='30e80dc1-facd-4d92-b4ae-fcce00801f29';
  UPDATE public.price_list_items SET
    precio_1=253000000, precio_2=NULL, precio_lista=250000000,
    precio_financiado_12=280000000, precio_financiado_18=285000000,
    precio_financiado_24=290000000, precio_financiado_30=NULL, entrega=130000000
  WHERE price_list_id=al AND vehicle_id='30e80dc1-facd-4d92-b4ae-fcce00801f29';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '30e80dc1-facd-4d92-b4ae-fcce00801f29', 253000000, NULL, 250000000,
      280000000, 285000000, 290000000, NULL, 130000000);
  END IF;

  -- #44 Hilux 4X4 3.0 · 2014 · Beige
  UPDATE public.vehicles SET precio_venta=182000000, moneda='Gs' WHERE id='87648173-0cda-4485-80bf-2bd2683392d6';
  UPDATE public.price_list_items SET
    precio_1=182000000, precio_2=NULL, precio_lista=180000000,
    precio_financiado_12=200000000, precio_financiado_18=204000000,
    precio_financiado_24=210000000, precio_financiado_30=NULL, entrega=85000000
  WHERE price_list_id=al AND vehicle_id='87648173-0cda-4485-80bf-2bd2683392d6';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '87648173-0cda-4485-80bf-2bd2683392d6', 182000000, NULL, 180000000,
      200000000, 204000000, 210000000, NULL, 85000000);
  END IF;

  -- #45 Nissan Navara 2.5 4x4 · 2009 · Plata
  UPDATE public.vehicles SET precio_venta=86000000, moneda='Gs' WHERE id='8fe4f6db-5fff-4022-a0b9-07f8f92bfd2b';
  UPDATE public.price_list_items SET
    precio_1=86000000, precio_2=NULL, precio_lista=85000000,
    precio_financiado_12=95000000, precio_financiado_18=98000000,
    precio_financiado_24=102000000, precio_financiado_30=NULL, entrega=40000000
  WHERE price_list_id=al AND vehicle_id='8fe4f6db-5fff-4022-a0b9-07f8f92bfd2b';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '8fe4f6db-5fff-4022-a0b9-07f8f92bfd2b', 86000000, NULL, 85000000,
      95000000, 98000000, 102000000, NULL, 40000000);
  END IF;

  -- #46 Fiat Strada · 2018 · negro
  UPDATE public.vehicles SET precio_venta=75000000, moneda='Gs' WHERE id='961f086b-98ed-4019-a308-3b7cb27213e9';
  UPDATE public.price_list_items SET
    precio_1=75000000, precio_2=74000000, precio_lista=73000000,
    precio_financiado_12=85000000, precio_financiado_18=89000000,
    precio_financiado_24=94000000, precio_financiado_30=NULL, entrega=38000000
  WHERE price_list_id=al AND vehicle_id='961f086b-98ed-4019-a308-3b7cb27213e9';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '961f086b-98ed-4019-a308-3b7cb27213e9', 75000000, 74000000, 73000000,
      85000000, 89000000, 94000000, NULL, 38000000);
  END IF;

  -- #47 Hyundai Tucson 4x2 · 2005 · celeste
  UPDATE public.vehicles SET precio_venta=36000000, moneda='Gs' WHERE id='4de25384-c238-410a-a84e-4d05ea9d9359';
  UPDATE public.price_list_items SET
    precio_1=36000000, precio_2=NULL, precio_lista=35000000,
    precio_financiado_12=NULL, precio_financiado_18=NULL,
    precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
  WHERE price_list_id=al AND vehicle_id='4de25384-c238-410a-a84e-4d05ea9d9359';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '4de25384-c238-410a-a84e-4d05ea9d9359', 36000000, NULL, 35000000,
      NULL, NULL, NULL, NULL, NULL);
  END IF;

  -- #48 Hyundai Santa Fe 2.2- 4x2 · 2019 · Plata
  UPDATE public.vehicles SET precio_venta=193000000, moneda='Gs' WHERE id='a0ef5d22-3859-4883-ba6a-5b4f3e7a6915';
  UPDATE public.price_list_items SET
    precio_1=193000000, precio_2=192000000, precio_lista=190000000,
    precio_financiado_12=214000000, precio_financiado_18=218500000,
    precio_financiado_24=222500000, precio_financiado_30=228000000, entrega=85000000
  WHERE price_list_id=al AND vehicle_id='a0ef5d22-3859-4883-ba6a-5b4f3e7a6915';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'a0ef5d22-3859-4883-ba6a-5b4f3e7a6915', 193000000, 192000000, 190000000,
      214000000, 218500000, 222500000, 228000000, 85000000);
  END IF;

  -- #49 Hyundai Santa Fe 4x2 · 2016 · perla
  UPDATE public.vehicles SET precio_venta=117000000, moneda='Gs' WHERE id='cb1b7a4d-7279-4ee6-b867-4455333e8d88';
  UPDATE public.price_list_items SET
    precio_1=117000000, precio_2=116000000, precio_lista=115000000,
    precio_financiado_12=134000000, precio_financiado_18=138000000,
    precio_financiado_24=143000000, precio_financiado_30=148000000, entrega=50000000
  WHERE price_list_id=al AND vehicle_id='cb1b7a4d-7279-4ee6-b867-4455333e8d88';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'cb1b7a4d-7279-4ee6-b867-4455333e8d88', 117000000, 116000000, 115000000,
      134000000, 138000000, 143000000, 148000000, 50000000);
  END IF;

  -- #50 Kia sportage 2.0 diesel · 2016 · perla
  UPDATE public.vehicles SET precio_venta=117000000, moneda='Gs' WHERE id='96410820-683e-413c-80bd-af3de15ae054';
  UPDATE public.price_list_items SET
    precio_1=117000000, precio_2=116000000, precio_lista=115000000,
    precio_financiado_12=133000000, precio_financiado_18=137000000,
    precio_financiado_24=142000000, precio_financiado_30=146000000, entrega=55000000
  WHERE price_list_id=al AND vehicle_id='96410820-683e-413c-80bd-af3de15ae054';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '96410820-683e-413c-80bd-af3de15ae054', 117000000, 116000000, 115000000,
      133000000, 137000000, 142000000, 146000000, 55000000);
  END IF;

  -- #55 Kia sportage 2.0 diesel · 2011 · Azul
  UPDATE public.vehicles SET precio_venta=81000000, moneda='Gs' WHERE id='25136930-5744-4f01-a04b-65f30d8c15d2';
  UPDATE public.price_list_items SET
    precio_1=81000000, precio_2=NULL, precio_lista=80000000,
    precio_financiado_12=92000000, precio_financiado_18=96000000,
    precio_financiado_24=100000000, precio_financiado_30=NULL, entrega=35000000
  WHERE price_list_id=al AND vehicle_id='25136930-5744-4f01-a04b-65f30d8c15d2';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, '25136930-5744-4f01-a04b-65f30d8c15d2', 81000000, NULL, 80000000,
      92000000, 96000000, 100000000, NULL, 35000000);
  END IF;

  -- #56 Kia sportage 2.0 diesel · 2011 · Blanco
  UPDATE public.vehicles SET precio_venta=79000000, moneda='Gs' WHERE id='b239a72a-6164-452a-ad19-dfb14cee850c';
  UPDATE public.price_list_items SET
    precio_1=79000000, precio_2=NULL, precio_lista=78000000,
    precio_financiado_12=90000000, precio_financiado_18=94000000,
    precio_financiado_24=98000000, precio_financiado_30=NULL, entrega=35000000
  WHERE price_list_id=al AND vehicle_id='b239a72a-6164-452a-ad19-dfb14cee850c';
  GET DIAGNOSTICS updated = ROW_COUNT;
  IF updated = 0 THEN
    INSERT INTO public.price_list_items
      (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
    VALUES (al, 'b239a72a-6164-452a-ad19-dfb14cee850c', 79000000, NULL, 78000000,
      90000000, 94000000, 98000000, NULL, 35000000);
  END IF;

  -- ══════════════════════ VEHICULOS NUEVOS (alta) ════════════════════════

  -- #23 Toyota Ractis 1.5 · 2009 · Beige (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Toyota' AND modelo ILIKE 'Ractis 1.5' AND anio=2009 AND color ILIKE 'Beige') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Toyota', 'Ractis 1.5', 2009, 'Beige', 'Automático', 1, 47500000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=47500000, precio_2=NULL, precio_lista=47000000,
      precio_financiado_12=54500000, precio_financiado_18=58000000,
      precio_financiado_24=62000000, precio_financiado_30=NULL, entrega=17000000
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 47500000, NULL, 47000000,
        54500000, 58000000, 62000000, NULL, 17000000);
    END IF;
  END IF;

  -- #30 Toyota Premio 2.2 · 2000 · Blanco (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Toyota' AND modelo ILIKE 'Premio 2.2' AND anio=2000 AND color ILIKE 'Blanco') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Toyota', 'Premio 2.2', 2000, 'Blanco', 'Manual', 1, 17000000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=17000000, precio_2=NULL, precio_lista=16000000,
      precio_financiado_12=NULL, precio_financiado_18=NULL,
      precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 17000000, NULL, 16000000,
        NULL, NULL, NULL, NULL, NULL);
    END IF;
  END IF;

  -- #36 Toyota Voxy 2.0 · 2007 · Vino (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Toyota' AND modelo ILIKE 'Voxy 2.0' AND anio=2007 AND color ILIKE 'Vino') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Toyota', 'Voxy 2.0', 2007, 'Vino', 'Automático', 1, 54000000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=54000000, precio_2=NULL, precio_lista=53000000,
      precio_financiado_12=62000000, precio_financiado_18=65500000,
      precio_financiado_24=70000000, precio_financiado_30=NULL, entrega=25000000
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 54000000, NULL, 53000000,
        62000000, 65500000, 70000000, NULL, 25000000);
    END IF;
  END IF;

  -- #43 Hilux 4X4 3.0 · 2015 · Negro (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Toyota' AND modelo ILIKE 'Hilux 4x4 3.0' AND anio=2015 AND color ILIKE 'Negro') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Toyota', 'Hilux 4x4 3.0', 2015, 'Negro', 'Automático', 1, 205000000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=205000000, precio_2=203000000, precio_lista=200000000,
      precio_financiado_12=221000000, precio_financiado_18=225000000,
      precio_financiado_24=230000000, precio_financiado_30=NULL, entrega=100000000
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 205000000, 203000000, 200000000,
        221000000, 225000000, 230000000, NULL, 100000000);
    END IF;
  END IF;

  -- #54 Kia sportage 2.0 diesel · 2012 · Azul (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Kia' AND modelo ILIKE 'Sportage 2.0 diesel' AND anio=2012 AND color ILIKE 'Azul') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Kia', 'Sportage 2.0 diesel', 2012, 'Azul', 'Automático', 1, 83000000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=83000000, precio_2=NULL, precio_lista=82000000,
      precio_financiado_12=95000000, precio_financiado_18=99000000,
      precio_financiado_24=103000000, precio_financiado_30=NULL, entrega=37000000
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 83000000, NULL, 82000000,
        95000000, 99000000, 103000000, NULL, 37000000);
    END IF;
  END IF;

  -- #57 Kia Sorento · 2004 · Negro (no existia en la base)
  IF NOT EXISTS (SELECT 1 FROM public.vehicles WHERE marca ILIKE 'Kia' AND modelo ILIKE 'Sorento' AND anio=2004 AND color ILIKE 'Negro') THEN
    INSERT INTO public.vehicles (marca, modelo, anio, color, cambio, precio_compra, precio_venta, moneda, estado)
    VALUES ('Kia', 'Sorento', 2004, 'Negro', 'Automático', 1, 24000000, 'Gs', 'Disponible')
    RETURNING id INTO vid;
    UPDATE public.price_list_items SET
      precio_1=24000000, precio_2=NULL, precio_lista=23000000,
      precio_financiado_12=NULL, precio_financiado_18=NULL,
      precio_financiado_24=NULL, precio_financiado_30=NULL, entrega=NULL
    WHERE price_list_id=al AND vehicle_id=vid;
    GET DIAGNOSTICS updated = ROW_COUNT;
    IF updated = 0 THEN
      INSERT INTO public.price_list_items
        (price_list_id, vehicle_id, precio_1, precio_2, precio_lista, precio_financiado_12, precio_financiado_18, precio_financiado_24, precio_financiado_30, entrega)
      VALUES (al, vid, 24000000, NULL, 23000000,
        NULL, NULL, NULL, NULL, NULL);
    END IF;
  END IF;

  RAISE NOTICE 'Actualizacion de lista de precios 18/08/2026 completada.';
END;
$$;
