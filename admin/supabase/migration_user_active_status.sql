-- ─────────────────────────────────────────────────────────────────────────
-- migration_user_active_status.sql
--
-- Permite a los administradores DESACTIVAR una cuenta (bloquear el login)
-- sin eliminarla ni tocar el historial (ventas, vehículos, gastos, etc. que
-- referencian profiles.id con ON DELETE NO ACTION). Usa el mecanismo nativo
-- de baneo de Supabase Auth (auth.users.banned_until) en vez de una columna
-- propia: lo aplica auth.admin.updateUserById({ ban_duration }) desde
-- lib/actions/admin-users.ts (toggleUserActive), sin requerir cambios acá.
--
-- Esta migración solo extiende get_all_profiles_with_email() para que el
-- panel pueda leer el estado (activo/inactivo) de cada cuenta.
--
-- IMPORTANTE: la función se recrea con DROP + CREATE (no CREATE OR REPLACE,
-- porque cambia el conjunto de columnas de salida). Eso resetea los
-- permisos a los de Postgres por defecto (PUBLIC/anon con EXECUTE) — por
-- eso los REVOKE/GRANT de abajo son parte necesaria de esta migración, no
-- opcionales. Sin ellos se reabre la fuga de PII que ya había sido cerrada
-- en migration_security_hardening.sql.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.get_all_profiles_with_email();

create function public.get_all_profiles_with_email()
returns table(
  id uuid,
  full_name text,
  username text,
  role text,
  email text,
  created_at timestamptz,
  banned_until timestamptz
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'Unauthorized: admin only';
  end if;
  return query
    select p.id, p.full_name, p.username, p.role::text, u.email::text, p.created_at, u.banned_until
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at asc;
end;
$function$;

revoke execute on function public.get_all_profiles_with_email() from public, anon;
grant  execute on function public.get_all_profiles_with_email() to authenticated;
