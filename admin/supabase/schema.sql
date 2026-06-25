-- ============================================================
-- VH Group S.R.L. — Supabase Schema
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null default 'vendedor' check (role in ('admin','vendedor')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admin can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Trigger: auto-create profile on signup
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
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Vehicles ─────────────────────────────────────────────────
create table if not exists public.vehicles (
  id             uuid primary key default uuid_generate_v4(),
  marca          text not null,
  modelo         text not null,
  anio           integer not null,
  km             integer not null default 0,
  color          text,
  precio_compra  bigint not null,
  precio_venta   bigint not null,
  estado         text not null default 'Disponible' check (estado in ('Disponible','Reservado','Vendido')),
  descripcion    text,
  fecha_ingreso  date not null default current_date,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.vehicles enable row level security;
create policy "Auth users can read vehicles" on public.vehicles
  for select using (auth.role() = 'authenticated');
create policy "Auth users can insert vehicles" on public.vehicles
  for insert with check (auth.role() = 'authenticated');
create policy "Auth users can update vehicles" on public.vehicles
  for update using (auth.role() = 'authenticated');
create policy "Admin can delete vehicles" on public.vehicles
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ── Expenses ─────────────────────────────────────────────────
create table if not exists public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  vehicle_id  uuid not null references public.vehicles(id) on delete cascade,
  tipo        text not null check (tipo in ('mecanica','limpieza','pintura','documentacion','otros')),
  descripcion text,
  monto       bigint not null,
  fecha       date not null default current_date,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

alter table public.expenses enable row level security;
create policy "Auth users can manage expenses" on public.expenses
  for all using (auth.role() = 'authenticated');

-- ── Clients ──────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  documento   text,
  telefono    text,
  email       text,
  ciudad      text,
  notas       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Auth users can manage clients" on public.clients
  for all using (auth.role() = 'authenticated');

-- ── Sales ────────────────────────────────────────────────────
create table if not exists public.sales (
  id           uuid primary key default uuid_generate_v4(),
  vehicle_id   uuid not null references public.vehicles(id),
  client_id    uuid not null references public.clients(id),
  precio_final bigint not null,
  fecha_venta  date not null default current_date,
  comision     bigint default 0,
  vendedor_id  uuid references public.profiles(id),
  notas        text,
  created_at   timestamptz not null default now()
);

alter table public.sales enable row level security;
create policy "Auth users can manage sales" on public.sales
  for all using (auth.role() = 'authenticated');

-- ── Price History ─────────────────────────────────────────────
create table if not exists public.price_history (
  id              uuid primary key default uuid_generate_v4(),
  vehicle_id      uuid not null references public.vehicles(id) on delete cascade,
  precio_anterior bigint not null,
  precio_nuevo    bigint not null,
  motivo          text,
  changed_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

alter table public.price_history enable row level security;
create policy "Auth users can read price_history" on public.price_history
  for select using (auth.role() = 'authenticated');
create policy "Auth users can insert price_history" on public.price_history
  for insert with check (auth.role() = 'authenticated');

-- ── Triggers: updated_at ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();

-- ── Trigger: auto price_history on precio_venta change ────────
create or replace function public.record_price_change()
returns trigger language plpgsql security definer as $$
begin
  if old.precio_venta is distinct from new.precio_venta then
    insert into public.price_history (vehicle_id, precio_anterior, precio_nuevo, changed_by)
    values (new.id, old.precio_venta, new.precio_venta, auth.uid());
  end if;
  return new;
end;
$$;

create trigger vehicles_price_history before update on public.vehicles
  for each row execute function public.record_price_change();

-- ── Views ─────────────────────────────────────────────────────
create or replace view public.sales_with_details as
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
  join public.clients c on s.client_id = c.id
  left join public.profiles p on s.vendedor_id = p.id;

-- ── Vehicle Photos ──────────────────────────────────────────────
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
create policy "Auth users can manage vehicle_photos" on public.vehicle_photos
  for all using (auth.role() = 'authenticated');

-- ── Employees ──────────────────────────────────────────────────
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
create policy "Auth users can view employees" on public.employees
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage employees" on public.employees
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create trigger employees_updated_at before update on public.employees
  for each row execute function public.set_updated_at();

-- ── Price Lists ────────────────────────────────────────────────
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
create policy "Auth users can view price_lists" on public.price_lists
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_lists" on public.price_lists
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create trigger price_lists_updated_at before update on public.price_lists
  for each row execute function public.set_updated_at();

-- ── Price List Items ───────────────────────────────────────────
create table if not exists public.price_list_items (
  id            uuid primary key default uuid_generate_v4(),
  price_list_id uuid not null references public.price_lists(id) on delete cascade,
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  precio_lista  bigint not null,
  notas         text,
  created_at    timestamptz not null default now()
);

alter table public.price_list_items enable row level security;
create policy "Auth users can view price_list_items" on public.price_list_items
  for select using (auth.role() = 'authenticated');
create policy "Admin can manage price_list_items" on public.price_list_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ── Storage bucket (run in Supabase dashboard) ─────────────────
-- 1. Go to Storage > New bucket
-- 2. Name: vehicle-photos
-- 3. Enable "Public bucket"
-- This allows public URLs for vehicle photos.
