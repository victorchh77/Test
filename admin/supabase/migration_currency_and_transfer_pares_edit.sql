-- ─────────────────────────────────────────────────────────────────────────
-- migration_currency_and_transfer_pares_edit.sql
--
-- 1) Soporte de moneda (Gs / USD) para vehículos, transferencias y contratos
--    de pagarés. No hay conversión de cambio en ningún lado — el monto
--    guardado se muestra tal cual con la etiqueta de moneda que corresponda.
--    Motivo: algunos vehículos (ej. Mercedes-Benz E350) se venden en dólares,
--    y el catálogo mostraba el monto etiquetado como "Gs." incorrectamente.
-- 2) vehiculos_publicos recreada (DROP+CREATE) para incluir `moneda`.
-- 3) sales_with_details recreada (DROP+CREATE) para incluir el `moneda` del
--    vehículo vendido, así ventas/dashboard muestran la moneda correcta.
-- 4) Grant explícito de la columna `moneda` a `anon` en `vehicles` —
--    vehiculos_publicos tiene security_invoker=true, así que anon necesita
--    grants a nivel de columna en la tabla base para cada columna expuesta.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.vehicles          add column if not exists moneda text not null default 'Gs' check (moneda in ('Gs','USD'));
alter table public.transfers         add column if not exists moneda text not null default 'Gs' check (moneda in ('Gs','USD'));
alter table public.pagares_contracts add column if not exists moneda text not null default 'Gs' check (moneda in ('Gs','USD'));

-- Vehículo real que se vende en dólares (no convertir, solo etiquetar).
update public.vehicles set moneda = 'USD' where id = '7e290564-aada-4183-8803-20765587c697';

drop view if exists public.vehiculos_publicos;
create view public.vehiculos_publicos as
  select id, marca, modelo, anio, km, color, precio_venta, estado,
         descripcion, fecha_ingreso, created_at, km_publico, ocultar_km, moneda
  from public.vehicles
  where estado = 'Disponible' and oculto = false;
alter view public.vehiculos_publicos set (security_invoker = true);
grant select on public.vehiculos_publicos to anon, authenticated;
grant select (moneda) on public.vehicles to anon;

drop view if exists public.sales_with_details;
create view public.sales_with_details as
  select
    s.*,
    v.marca, v.modelo, v.anio, v.precio_compra, v.moneda,
    c.nombre as client_nombre, c.telefono as client_telefono,
    p.full_name as vendedor_nombre,
    (s.precio_final - v.precio_compra - coalesce((
      select sum(e.monto) from public.expenses e where e.vehicle_id = v.id
    ), 0)) as ganancia
  from public.sales s
  join public.vehicles v on s.vehicle_id = v.id
  left join public.clients c on s.client_id = c.id
  left join public.profiles p on s.vendedor_id = p.id;

revoke all on public.sales_with_details from public, anon, authenticated;
grant select on public.sales_with_details to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Nota: la edición/eliminación de transferencias y contratos de pagarés
-- (nuevas Server Actions updateTransfer/deleteTransfer y
-- updateParesContract/deleteParesContract) no requiere cambios de schema
-- adicionales — pagares_cuotas y pagares_payments ya tenían
-- ON DELETE CASCADE hacia pagares_contracts, así que eliminar un contrato
-- elimina automáticamente sus cuotas y pagos asociados.
-- ─────────────────────────────────────────────────────────────────────────
