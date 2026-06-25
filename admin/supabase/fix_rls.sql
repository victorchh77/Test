-- ============================================================
-- VH Group — MIGRACIÓN COMPLETA (idempotente)
-- ============================================================
-- Crea las tablas nuevas (fotos, empleados, listas de precios)
-- y arregla la recursión infinita de RLS que rompía el login.
-- Se puede ejecutar las veces que haga falta sin romper nada.
-- Pegá TODO esto en el SQL Editor de Supabase y dale Run.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── 1. Helper SECURITY DEFINER (rompe la recursión) ──────────
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── 2. set_updated_at (por si no existe) ─────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 3. Arreglar políticas de profiles ────────────────────────
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Profiles: view own or admin views all" on public.profiles;
drop policy if exists "Profiles: update own" on public.profiles;
drop policy if exists "Profiles: admin updates all" on public.profiles;

create policy "Profiles: view own or admin views all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles: admin updates all" on public.profiles
  for update using (public.is_admin());

-- ── 4. Arreglar política de vehicles ─────────────────────────
drop policy if exists "Admin can delete vehicles" on public.vehicles;
create policy "Admin can delete vehicles" on public.vehicles
  for delete using (public.is_admin());

-- ── 5. Vehicle Photos ────────────────────────────────────────
create table if not exists public.vehicle_photos (
  id           uuid primary key default uuid_generate_v4(),
  vehicle_id   uuid not null references public.vehicles(id) on delete cascade,
  url          text not null,
  storage_path text not null,
  is_main      boolean not null default false,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now()
);
alter table public.vehicle_photos enable row level security;
drop policy if exists "Auth users can manage vehicle_photos" on public.vehicle_photos;
create policy "Auth users can manage vehicle_photos" on public.vehicle_photos
  for all using (auth.role() = 'authenticated');

-- ── 6. Employees ─────────────────────────────────────────────
create table if not exists public.employees (
  id                   uuid primary key default uuid_generate_v4(),
  profile_id           uuid references public.profiles(id) on delete set null,
  nombre               text not null,
  documento            text,
  telefono             text,
  email                text,
  cargo                text not null default 'vendedor',
  salario_base         bigint not null default 0,
  comision_porcentaje  numeric(5,2) not null default 0,
  fecha_ingreso        date not null default current_date,
  activo               boolean not null default true,
  notas                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
alter table public.employees enable row level security;
drop policy if exists "Auth users can view employees" on public.employees;
drop policy if exists "Admin can manage employees" on public.employees;
create policy "Auth users can view employees" on public.employees
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage employees" on public.employees
  for all using (public.is_admin());
drop trigger if exists employees_updated_at on public.employees;
create trigger employees_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

-- ── 7. Price Lists ───────────────────────────────────────────
create table if not exists public.price_lists (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  descripcion text,
  activa      boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.price_lists enable row level security;
drop policy if exists "Auth users can view price_lists" on public.price_lists;
drop policy if exists "Admin can manage price_lists" on public.price_lists;
create policy "Auth users can view price_lists" on public.price_lists
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_lists" on public.price_lists
  for all using (public.is_admin());
drop trigger if exists price_lists_updated_at on public.price_lists;
create trigger price_lists_updated_at before update on public.price_lists
  for each row execute function public.set_updated_at();

-- ── 8. Price List Items ──────────────────────────────────────
create table if not exists public.price_list_items (
  id            uuid primary key default uuid_generate_v4(),
  price_list_id uuid not null references public.price_lists(id) on delete cascade,
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  precio_lista  bigint not null,
  notas         text,
  created_at    timestamptz not null default now()
);
alter table public.price_list_items enable row level security;
drop policy if exists "Auth users can view price_list_items" on public.price_list_items;
drop policy if exists "Admin can manage price_list_items" on public.price_list_items;
create policy "Auth users can view price_list_items" on public.price_list_items
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_list_items" on public.price_list_items
  for all using (public.is_admin());

-- ============================================================
-- LISTO. Ahora:
-- 1. Storage > New bucket > "vehicle-photos" > Public bucket ✓
-- 2. Authentication > Add user (tu email + contraseña)
-- 3. Hacé admin tu usuario:
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'TU-EMAIL');
-- ============================================================
