-- ============================================================
-- VH Group S.R.L. — SETUP COMPLETO (idempotente)
-- ============================================================
-- Pegá TODO este archivo en Supabase → SQL Editor → Run.
-- Es seguro correrlo aunque ya hayas ejecutado scripts antes:
-- crea lo que falta, arregla lo que estaba mal y no rompe datos.
-- Incluye: tablas, políticas RLS, bucket de fotos y sus permisos.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Helper: rol admin sin recursión ──────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'vendedor' check (role in ('admin','vendedor')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
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

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'vendedor')
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ── vehicles ─────────────────────────────────────────────────
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  marca text not null, modelo text not null, anio integer not null,
  km integer not null default 0, color text,
  precio_compra bigint not null, precio_venta bigint not null,
  estado text not null default 'Disponible' check (estado in ('Disponible','Reservado','Vendido')),
  descripcion text, fecha_ingreso date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.vehicles enable row level security;
drop policy if exists "Auth users can read vehicles" on public.vehicles;
drop policy if exists "Auth users can insert vehicles" on public.vehicles;
drop policy if exists "Auth users can update vehicles" on public.vehicles;
drop policy if exists "Admin can delete vehicles" on public.vehicles;
create policy "Auth users can read vehicles" on public.vehicles for select using (auth.role() = 'authenticated');
create policy "Auth users can insert vehicles" on public.vehicles for insert with check (auth.role() = 'authenticated');
create policy "Auth users can update vehicles" on public.vehicles for update using (auth.role() = 'authenticated');
create policy "Admin can delete vehicles" on public.vehicles for delete using (public.is_admin());
drop trigger if exists vehicles_updated_at on public.vehicles;
create trigger vehicles_updated_at before update on public.vehicles for each row execute function public.set_updated_at();
-- NOTE: el historial de precios ahora lo registra la app (con motivo),
-- por eso quitamos el trigger automático para evitar duplicados.
drop trigger if exists vehicles_price_history on public.vehicles;

-- ── expenses ─────────────────────────────────────────────────
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  tipo text not null check (tipo in ('mecanica','limpieza','pintura','documentacion','otros')),
  descripcion text, monto bigint not null, fecha date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.expenses enable row level security;
drop policy if exists "Auth users can manage expenses" on public.expenses;
create policy "Auth users can manage expenses" on public.expenses for all using (auth.role() = 'authenticated');

-- ── clients ──────────────────────────────────────────────────
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null, documento text, telefono text, email text, ciudad text, notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.clients enable row level security;
drop policy if exists "Auth users can manage clients" on public.clients;
create policy "Auth users can manage clients" on public.clients for all using (auth.role() = 'authenticated');
drop trigger if exists clients_updated_at on public.clients;
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();

-- ── sales ────────────────────────────────────────────────────
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id),
  client_id uuid not null references public.clients(id),
  precio_final bigint not null, fecha_venta date not null default current_date,
  comision bigint default 0, vendedor_id uuid references public.profiles(id),
  notas text, created_at timestamptz not null default now()
);
alter table public.sales enable row level security;
drop policy if exists "Auth users can manage sales" on public.sales;
create policy "Auth users can manage sales" on public.sales for all using (auth.role() = 'authenticated');

-- ── price_history ────────────────────────────────────────────
create table if not exists public.price_history (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  precio_anterior bigint not null, precio_nuevo bigint not null,
  motivo text, changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.price_history enable row level security;
drop policy if exists "Auth users can read price_history" on public.price_history;
drop policy if exists "Auth users can insert price_history" on public.price_history;
create policy "Auth users can read price_history" on public.price_history for select using (auth.role() = 'authenticated');
create policy "Auth users can insert price_history" on public.price_history for insert with check (auth.role() = 'authenticated');

-- ── vehicle_photos ───────────────────────────────────────────
create table if not exists public.vehicle_photos (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  url text not null, storage_path text not null, is_main boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.vehicle_photos enable row level security;
drop policy if exists "Auth users can manage vehicle_photos" on public.vehicle_photos;
create policy "Auth users can manage vehicle_photos" on public.vehicle_photos for all using (auth.role() = 'authenticated');

-- ── employees ────────────────────────────────────────────────
create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  nombre text not null, documento text, telefono text, email text,
  cargo text not null default 'vendedor',
  salario_base bigint not null default 0,
  comision_porcentaje numeric(5,2) not null default 0,
  fecha_ingreso date not null default current_date,
  activo boolean not null default true, notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.employees enable row level security;
drop policy if exists "Auth users can view employees" on public.employees;
drop policy if exists "Admin can manage employees" on public.employees;
create policy "Auth users can view employees" on public.employees for select using (auth.role() = 'authenticated');
create policy "Admin can manage employees" on public.employees for all using (public.is_admin());
drop trigger if exists employees_updated_at on public.employees;
create trigger employees_updated_at before update on public.employees for each row execute function public.set_updated_at();

-- ── employee_payments ────────────────────────────────────────
create table if not exists public.employee_payments (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  monto bigint not null,
  tipo text not null default 'salario' check (tipo in ('salario','comision','aguinaldo','adelanto','bonificacion','otro')),
  fecha date not null default current_date, notas text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.employee_payments enable row level security;
drop policy if exists "Auth view employee_payments" on public.employee_payments;
drop policy if exists "Admin manage employee_payments" on public.employee_payments;
create policy "Auth view employee_payments" on public.employee_payments for select using (auth.role() = 'authenticated');
create policy "Admin manage employee_payments" on public.employee_payments for all using (public.is_admin());

-- ── employee_salary_history ──────────────────────────────────
create table if not exists public.employee_salary_history (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  salario_anterior bigint not null, salario_nuevo bigint not null,
  motivo text, changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.employee_salary_history enable row level security;
drop policy if exists "Auth view salary_history" on public.employee_salary_history;
drop policy if exists "Admin manage salary_history" on public.employee_salary_history;
create policy "Auth view salary_history" on public.employee_salary_history for select using (auth.role() = 'authenticated');
create policy "Admin manage salary_history" on public.employee_salary_history for all using (public.is_admin());

-- ── price_lists ──────────────────────────────────────────────
create table if not exists public.price_lists (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null, descripcion text, activa boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.price_lists enable row level security;
drop policy if exists "Auth users can view price_lists" on public.price_lists;
drop policy if exists "Admin can manage price_lists" on public.price_lists;
create policy "Auth users can view price_lists" on public.price_lists for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_lists" on public.price_lists for all using (public.is_admin());
drop trigger if exists price_lists_updated_at on public.price_lists;
create trigger price_lists_updated_at before update on public.price_lists for each row execute function public.set_updated_at();

-- ── price_list_items ─────────────────────────────────────────
create table if not exists public.price_list_items (
  id uuid primary key default uuid_generate_v4(),
  price_list_id uuid not null references public.price_lists(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  precio_lista bigint not null, notas text,
  created_at timestamptz not null default now()
);
alter table public.price_list_items enable row level security;
drop policy if exists "Auth users can view price_list_items" on public.price_list_items;
drop policy if exists "Admin can manage price_list_items" on public.price_list_items;
create policy "Auth users can view price_list_items" on public.price_list_items for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_list_items" on public.price_list_items for all using (public.is_admin());

-- ── Vista de ventas con detalles ─────────────────────────────
create or replace view public.sales_with_details as
  select s.*, v.marca, v.modelo, v.anio, v.precio_compra,
    c.nombre as client_nombre, c.telefono as client_telefono,
    p.full_name as vendedor_nombre,
    (s.precio_final - v.precio_compra - coalesce(
      (select sum(e.monto) from public.expenses e where e.vehicle_id = v.id), 0)) as ganancia
  from public.sales s
  join public.vehicles v on s.vehicle_id = v.id
  join public.clients c on s.client_id = c.id
  left join public.profiles p on s.vendedor_id = p.id;

-- ── BUCKET DE FOTOS + permisos de Storage ────────────────────
insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "vh_photos_select" on storage.objects;
drop policy if exists "vh_photos_insert" on storage.objects;
drop policy if exists "vh_photos_update" on storage.objects;
drop policy if exists "vh_photos_delete" on storage.objects;
create policy "vh_photos_select" on storage.objects for select using (bucket_id = 'vehicle-photos');
create policy "vh_photos_insert" on storage.objects for insert to authenticated with check (bucket_id = 'vehicle-photos');
create policy "vh_photos_update" on storage.objects for update to authenticated using (bucket_id = 'vehicle-photos');
create policy "vh_photos_delete" on storage.objects for delete to authenticated using (bucket_id = 'vehicle-photos');

-- ============================================================
-- LISTO. Todo creado. Si todavía no tenés un admin:
--   1) Authentication → Add user (email + contraseña)
--   2) update public.profiles set role = 'admin'
--      where id = (select id from auth.users where email = 'TU-EMAIL');
-- ============================================================
