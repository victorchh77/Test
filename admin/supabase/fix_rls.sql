-- ============================================================
-- VH Group — FIX: recursión infinita en políticas RLS
-- ============================================================
-- Ejecutá TODO este archivo en el SQL Editor de Supabase.
-- Soluciona el loop de login causado por políticas de `profiles`
-- que se consultaban a sí mismas.
-- ============================================================

-- 1. Función SECURITY DEFINER que lee el rol sin disparar RLS
--    (rompe la recursión infinita)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Recrear las políticas de profiles sin recursión
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;

create policy "Profiles: view own or admin views all" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles: admin updates all" on public.profiles
  for update using (public.is_admin());

-- 3. Recrear políticas de vehicles que referenciaban profiles
drop policy if exists "Admin can delete vehicles" on public.vehicles;
create policy "Admin can delete vehicles" on public.vehicles
  for delete using (public.is_admin());

-- 4. Recrear políticas de employees (si la tabla existe)
drop policy if exists "Admin can manage employees" on public.employees;
create policy "Admin can manage employees" on public.employees
  for all using (public.is_admin());

-- 5. Recrear políticas de price_lists / price_list_items
drop policy if exists "Admin can manage price_lists" on public.price_lists;
create policy "Admin can manage price_lists" on public.price_lists
  for all using (public.is_admin());

drop policy if exists "Admin can manage price_list_items" on public.price_list_items;
create policy "Admin can manage price_list_items" on public.price_list_items
  for all using (public.is_admin());

-- ============================================================
-- Listo. El login ya no debería rebotar al dashboard.
-- ============================================================
