-- ─────────────────────────────────────────────────────────────────────────
-- migration_km_publico.sql
--
-- Permite al admin definir un texto alternativo para el kilometraje en el
-- CATÁLOGO WEB (landing/catalogo). Útil para vehículos recién importados donde
-- mostrar el km real (o "0 km") no corresponde: se puede poner "Recién
-- importado", "Consultar", el representante, etc.
--
-- El km real (columna `km`) NO se toca: sigue siendo el valor interno del panel.
-- Solo el catálogo público usa `km_publico` cuando está cargado.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- Requiere que migration_vehiculo_oculto.sql ya esté aplicada.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.vehicles add column if not exists km_publico text;

-- Re-crear la vista pública agregando km_publico (al final, para que
-- CREATE OR REPLACE conserve las columnas existentes y los permisos).
create or replace view public.vehiculos_publicos as
  select
    id, marca, modelo, anio, km, color, precio_venta, estado,
    descripcion, fecha_ingreso, created_at, km_publico
  from public.vehicles
  where estado = 'Disponible' and oculto = false;

alter view public.vehiculos_publicos set (security_invoker = true);

-- anon necesita leer la columna para el filtro/lectura del invoker view.
grant select (km_publico) on public.vehicles to anon;
