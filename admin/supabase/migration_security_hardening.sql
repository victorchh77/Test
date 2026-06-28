-- ─────────────────────────────────────────────────────────────────────────
-- migration_security_hardening.sql
--
-- Endurecimiento de seguridad (revisión tipo ethical hacking, 2026-06).
-- Aplicado en el proyecto vh-group. Idempotente.
--
-- HALLAZGOS CRÍTICOS corregidos:
--
--  [CRÍTICO] admin_update_user_role(): era SECURITY DEFINER, ejecutable por
--    `anon`, y NO validaba que quien llamaba fuera admin. Cualquier visitante
--    anónimo podía llamar /rest/v1/rpc/admin_update_user_role y volverse admin
--    (escalada de privilegios). Ahora valida admin internamente y solo
--    `authenticated` puede ejecutarla.
--
--  [CRÍTICO] get_all_profiles_with_email(): SECURITY DEFINER, ejecutable por
--    `anon`, sin chequeo de permisos -> cualquiera podía volcar emails/nombres
--    de todos los usuarios (fuga de PII). Ahora valida admin internamente y
--    solo `authenticated` puede ejecutarla.
--
-- HARDENING adicional:
--  - search_path fijo en funciones de trigger (evita secuestro por search_path).
--  - Se revoca EXECUTE de anon/public/authenticated en funciones de trigger
--    (handle_new_user, record_price_change): se disparan solas, nadie las llama.
--  - get_profiles_with_email (duplicada, ya tenía chequeo admin): se quita anon.
--
-- NOTA: get_email_by_username() se deja accesible a `anon` a propósito: el login
-- por usuario la necesita (resuelve username -> email antes de autenticar).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Escalada de privilegios
create or replace function public.admin_update_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized: admin only';
  end if;
  if new_role not in ('admin', 'vendedor', 'secretaria') then
    raise exception 'Invalid role: %', new_role;
  end if;
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;
revoke execute on function public.admin_update_user_role(uuid, text) from public, anon;
grant  execute on function public.admin_update_user_role(uuid, text) to authenticated;

-- 2. Fuga de emails
create or replace function public.get_all_profiles_with_email()
returns table(id uuid, full_name text, username text, role text, email text, created_at timestamp with time zone)
language plpgsql security definer set search_path to 'public' as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'   -- calificado: evita ambigüedad con columnas OUT
  ) then
    raise exception 'Unauthorized: admin only';
  end if;
  return query
    select p.id, p.full_name, p.username, p.role::text, u.email::text, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at asc;
end;
$$;
revoke execute on function public.get_all_profiles_with_email() from public, anon;
grant  execute on function public.get_all_profiles_with_email() to authenticated;

-- 3. Hardening de funciones de trigger / duplicados
alter function public.record_price_change() set search_path = public;
alter function public.set_updated_at()     set search_path = public;
revoke execute on function public.handle_new_user()       from public, anon, authenticated;
revoke execute on function public.record_price_change()   from public, anon, authenticated;
revoke execute on function public.get_profiles_with_email() from public, anon;
grant  execute on function public.get_profiles_with_email() to authenticated;
