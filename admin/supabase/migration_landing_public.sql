-- ─────────────────────────────────────────────────────────────────────────
-- migration_landing_public.sql
--
-- Motivo: la landing page pública (ruta `/`) la ven visitantes ANÓNIMOS, pero
-- las políticas RLS de `vehicles` y `vehicle_photos` solo permiten lectura a
-- usuarios autenticados. Sin esto, la landing no puede mostrar el stock real.
--
-- Solución: dos VISTAS de solo-lectura que exponen ÚNICAMENTE las columnas
-- públicas de los vehículos que NO están vendidos, con permiso de lectura para
-- el rol `anon`. Las tablas base siguen protegidas: columnas internas como
-- `precio_compra` nunca quedan expuestas al público.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Es idempotente (se puede
-- volver a correr sin romper nada).
-- ─────────────────────────────────────────────────────────────────────────

-- Vehículos públicos: solo columnas seguras + solo unidades a la venta.
create or replace view public.vehiculos_publicos as
  select
    id,
    marca,
    modelo,
    anio,
    km,
    color,
    precio_venta,
    estado,
    descripcion,
    fecha_ingreso,
    created_at
  from public.vehicles
  where estado <> 'Vendido';

-- Fotos públicas: solo de vehículos a la venta.
create or replace view public.vehiculo_fotos_publicas as
  select
    p.id,
    p.vehicle_id,
    p.url,
    p.is_main
  from public.vehicle_photos p
  join public.vehicles v on v.id = p.vehicle_id
  where v.estado <> 'Vendido';

-- Permitir lectura pública (anon) y autenticada de las vistas.
grant select on public.vehiculos_publicos to anon, authenticated;
grant select on public.vehiculo_fotos_publicas to anon, authenticated;

-- Nota: las vistas corren como su owner (security definer por defecto en
-- Postgres), por lo que leen las tablas base sin requerir políticas RLS para
-- `anon` en dichas tablas. Esto mantiene `precio_compra` y el resto del panel
-- completamente privado.
