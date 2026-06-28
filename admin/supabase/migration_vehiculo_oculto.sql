-- ─────────────────────────────────────────────────────────────────────────
-- migration_vehiculo_oculto.sql
--
-- 1) Permite al admin OCULTAR manualmente un vehículo del catálogo web.
-- 2) El catálogo de la landing ahora muestra SOLO vehículos 'Disponible' y no
--    ocultos: al pasar a 'Reservado'/'Vendido' desaparecen solos de la web,
--    pero siguen visibles en el panel (lista de vehículos lee la tabla directo).
-- 3) Red de seguridad anti auto-registro.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Columna de visibilidad manual
alter table public.vehicles add column if not exists oculto boolean not null default false;

-- 2. Vistas públicas: solo Disponible y no oculto
create or replace view public.vehiculos_publicos as
  select id, marca, modelo, anio, km, color, precio_venta, estado, descripcion, fecha_ingreso, created_at
  from public.vehicles
  where estado = 'Disponible' and oculto = false;

create or replace view public.vehiculo_fotos_publicas as
  select p.id, p.vehicle_id, p.url, p.is_main
  from public.vehicle_photos p
  join public.vehicles v on v.id = p.vehicle_id
  where v.estado = 'Disponible' and v.oculto = false;

-- CREATE OR REPLACE VIEW puede resetear opciones: reafirmar security_invoker
alter view public.vehiculos_publicos      set (security_invoker = true);
alter view public.vehiculo_fotos_publicas set (security_invoker = true);

-- anon necesita leer la columna oculto para el filtro del invoker view
grant select (oculto) on public.vehicles to anon;

-- RLS anon: solo Disponible y no oculto (defensa en profundidad)
drop policy if exists vehicles_anon_public on public.vehicles;
create policy vehicles_anon_public on public.vehicles for select to anon
  using (estado = 'Disponible' and oculto = false);

drop policy if exists vehicle_photos_anon_public on public.vehicle_photos;
create policy vehicle_photos_anon_public on public.vehicle_photos for select to anon
  using (exists (
    select 1 from public.vehicles v
    where v.id = vehicle_id and v.estado = 'Disponible' and v.oculto = false
  ));

-- 3. Red de seguridad anti auto-registro: solo se crea perfil para usuarios
-- provisionados por el panel (email interno @vhgroup.internal). Un auto-registro
-- con otro email NO obtiene perfil => el layout del panel lo redirige a /login.
-- (Igual conviene desactivar el signup público en Authentication del dashboard.)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if NEW.email like '%@vhgroup.internal' then
    insert into public.profiles (id, full_name, role)
    values (
      NEW.id,
      coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'vendedor'
    )
    on conflict (id) do nothing;
  end if;
  return NEW;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
