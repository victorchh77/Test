-- ─────────────────────────────────────────────────────────────────────────
-- migration_ocultar_km.sql
--
-- Permite ocultar por completo el dato de kilometraje en el catálogo web,
-- para vehículos donde no corresponde mostrar ni el km real ni un texto
-- alternativo (km_publico ya cubre ese caso). Si ocultar_km = true, el
-- catálogo no muestra ese recuadro de la ficha (ni en la tarjeta ni en el
-- detalle).
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- Requiere que migration_km_publico.sql ya esté aplicada.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.vehicles add column if not exists ocultar_km boolean not null default false;

create or replace view public.vehiculos_publicos as
  select
    id, marca, modelo, anio, km, color, precio_venta, estado,
    descripcion, fecha_ingreso, created_at, km_publico, ocultar_km
  from public.vehicles
  where estado = 'Disponible' and oculto = false;

alter view public.vehiculos_publicos set (security_invoker = true);

-- anon necesita leer la columna para el filtro/lectura del invoker view.
grant select (ocultar_km) on public.vehicles to anon;
