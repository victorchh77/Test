-- ─────────────────────────────────────────────────────────────────────────
-- migration_sale_type_and_purchase_date.sql
--
-- 1) Vehículos: fecha_compra (interna) separada de fecha_ingreso (alta en
--    el panel) — para llevar registro de cuándo se compró el vehículo.
-- 2) Ventas: forma de venta — financiado (bool), es_permuta (bool) +
--    permuta_detalle (texto libre: qué vehículo se recibió a cambio).
-- 3) Fix: la UI de "Registrar venta" ya ofrecía la opción "Sin cliente",
--    pero sales.client_id era NOT NULL — guardar sin cliente rompía.
-- 4) sales_with_details recreada (DROP+CREATE: agregar columnas a sales.*
--    desplaza las columnas nombradas más adelante, que CREATE OR REPLACE
--    VIEW no permite) con LEFT JOIN a clients (antes INNER, ocultaría las
--    ventas sin cliente) y permisos mínimos (antes tenía los grants por
--    defecto de Postgres, que incluían anon con INSERT/UPDATE/DELETE sobre
--    una vista con márgenes y datos de clientes).
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.vehicles add column if not exists fecha_compra date;

alter table public.sales add column if not exists financiado boolean not null default false;
alter table public.sales add column if not exists es_permuta boolean not null default false;
alter table public.sales add column if not exists permuta_detalle text;

alter table public.sales alter column client_id drop not null;

drop view if exists public.sales_with_details;

create view public.sales_with_details as
  select
    s.*,
    v.marca, v.modelo, v.anio, v.precio_compra,
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
