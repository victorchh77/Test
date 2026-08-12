-- ─────────────────────────────────────────────────────────────────────────
-- migration_audit_log.sql
--
-- Registro de auditoría para acciones sensibles (verificar/editar/eliminar
-- transferencias, contratos de pagarés y cuotas; eliminar/desactivar/cambiar
-- rol de usuarios; eliminar vehículos). Guarda quién hizo la acción, cuándo,
-- y desde qué IP (lib/audit.ts -> logAudit(), llamado desde cada Server
-- Action sensible).
--
-- Inmutable a propósito: no hay policy de UPDATE ni DELETE, ni siquiera para
-- admin, para que el rastro no se pueda alterar después de creado.
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  action text not null,
  entity_type text not null,
  entity_id text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_insert_own on public.audit_log;
create policy audit_log_insert_own on public.audit_log
  for insert to authenticated
  with check (actor_id = auth.uid());

drop policy if exists audit_log_select_admin on public.audit_log;
create policy audit_log_select_admin on public.audit_log
  for select to authenticated
  using (is_admin());

revoke all on public.audit_log from public, anon;
grant select, insert on public.audit_log to authenticated;
