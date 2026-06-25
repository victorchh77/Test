-- ============================================================
-- VH Group — MIGRACIÓN v2 (idempotente)
-- ============================================================
-- Corrige: subida de fotos (Storage), historial de precios con motivo,
-- y agrega gestión de pagos y aumentos de sueldo de empleados.
-- Pegá TODO esto en el SQL Editor de Supabase y dale Run.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── 1. POLÍTICAS DE STORAGE (para subir fotos) ───────────────
-- Sin esto, la subida de fotos falla con "row-level security".
drop policy if exists "vh_photos_select" on storage.objects;
drop policy if exists "vh_photos_insert" on storage.objects;
drop policy if exists "vh_photos_update" on storage.objects;
drop policy if exists "vh_photos_delete" on storage.objects;

create policy "vh_photos_select" on storage.objects
  for select using (bucket_id = 'vehicle-photos');
create policy "vh_photos_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'vehicle-photos');
create policy "vh_photos_update" on storage.objects
  for update to authenticated using (bucket_id = 'vehicle-photos');
create policy "vh_photos_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'vehicle-photos');

-- ── 2. Quitar el trigger automático de historial de precios ──
-- Ahora el historial se registra desde la app (con el motivo).
drop trigger if exists vehicles_price_history on public.vehicles;

-- ── 3. PAGOS A EMPLEADOS ─────────────────────────────────────
create table if not exists public.employee_payments (
  id          uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  monto       bigint not null,
  tipo        text not null default 'salario'
              check (tipo in ('salario','comision','aguinaldo','adelanto','bonificacion','otro')),
  fecha       date not null default current_date,
  notas       text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
alter table public.employee_payments enable row level security;
drop policy if exists "Auth view employee_payments" on public.employee_payments;
drop policy if exists "Admin manage employee_payments" on public.employee_payments;
create policy "Auth view employee_payments" on public.employee_payments
  for select using (auth.role() = 'authenticated');
create policy "Admin manage employee_payments" on public.employee_payments
  for all using (public.is_admin());

-- ── 4. HISTORIAL DE SUELDOS (aumentos) ───────────────────────
create table if not exists public.employee_salary_history (
  id               uuid primary key default uuid_generate_v4(),
  employee_id      uuid not null references public.employees(id) on delete cascade,
  salario_anterior bigint not null,
  salario_nuevo    bigint not null,
  motivo           text,
  changed_by       uuid references public.profiles(id),
  created_at       timestamptz not null default now()
);
alter table public.employee_salary_history enable row level security;
drop policy if exists "Auth view salary_history" on public.employee_salary_history;
drop policy if exists "Admin manage salary_history" on public.employee_salary_history;
create policy "Auth view salary_history" on public.employee_salary_history
  for select using (auth.role() = 'authenticated');
create policy "Admin manage salary_history" on public.employee_salary_history
  for all using (public.is_admin());

-- ============================================================
-- LISTO. Recordá tener creado el bucket "vehicle-photos" (Public).
-- ============================================================
