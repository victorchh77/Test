-- ─────────────────────────────────────────────────────────────────────────
-- migration_rls_storage_hardening.sql
--
-- Continuación del endurecimiento de seguridad (aplicado en vh-group, 2026-06).
-- Cubre tres frentes pedidos:
--   #1 Documentos financieros en buckets PRIVADOS + URLs firmadas.
--   #3 RLS por rol en transfers / pagares (antes: cualquier autenticado).
--   #4 Vistas públicas como security_invoker, protegiendo columnas internas
--      (precio_compra) con permisos a nivel de COLUMNA.
--
-- Idempotente. Requiere cambios de app que acompañan este commit:
--   - transferencias/nueva y planilla-pagares/nueva guardan el PATH (no URL).
--   - transferencias/page y planilla-pagares/page generan URL firmada al ver.
-- ─────────────────────────────────────────────────────────────────────────

-- Helper de rol staff (admin o secretaria)
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','secretaria')
  );
$$;
revoke execute on function public.is_staff() from public, anon;
grant  execute on function public.is_staff() to authenticated;

-- ── #3: RLS por rol ─────────────────────────────────────────────────────────
drop policy if exists transfers_all on public.transfers;
create policy transfers_staff on public.transfers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists pagares_contracts_all on public.pagares_contracts;
create policy pagares_contracts_staff on public.pagares_contracts for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists pagares_payments_all on public.pagares_payments;
create policy pagares_payments_staff on public.pagares_payments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ── #1: buckets privados ────────────────────────────────────────────────────
update storage.buckets set public = false where id in ('transfer-receipts','pagares-contracts');

drop policy if exists transfer_receipts_public_read on storage.objects;
drop policy if exists transfer_receipts_auth_write  on storage.objects;
create policy transfer_receipts_staff_read   on storage.objects for select to authenticated
  using (bucket_id = 'transfer-receipts' and public.is_staff());
create policy transfer_receipts_staff_write  on storage.objects for insert to authenticated
  with check (bucket_id = 'transfer-receipts' and public.is_staff());
create policy transfer_receipts_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'transfer-receipts' and public.is_staff());

drop policy if exists pagares_contracts_public_read on storage.objects;
drop policy if exists pagares_contracts_auth_write  on storage.objects;
create policy pagares_contracts_staff_read   on storage.objects for select to authenticated
  using (bucket_id = 'pagares-contracts' and public.is_staff());
create policy pagares_contracts_staff_write  on storage.objects for insert to authenticated
  with check (bucket_id = 'pagares-contracts' and public.is_staff());
create policy pagares_contracts_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'pagares-contracts' and public.is_staff());

-- ── #4: vistas públicas como security_invoker + columnas protegidas ─────────
-- Reemplaza el SELECT a nivel tabla de anon por SELECT a nivel de columna,
-- excluyendo precio_compra / created_by / updated_at.
revoke select on public.vehicles from anon;
grant  select (id, marca, modelo, anio, km, color, precio_venta, estado, descripcion, fecha_ingreso, created_at)
  on public.vehicles to anon;

revoke select on public.vehicle_photos from anon;
grant  select (id, vehicle_id, url, is_main) on public.vehicle_photos to anon;

drop policy if exists vehicles_anon_public on public.vehicles;
create policy vehicles_anon_public on public.vehicles for select to anon
  using (estado <> 'Vendido');

drop policy if exists vehicle_photos_anon_public on public.vehicle_photos;
create policy vehicle_photos_anon_public on public.vehicle_photos for select to anon
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.estado <> 'Vendido'));

alter view public.vehiculos_publicos     set (security_invoker = true);
alter view public.vehiculo_fotos_publicas set (security_invoker = true);

-- vehicle-photos sigue público (descarga por CDN), pero quitamos el SELECT
-- amplio para que no se pueda listar/enumerar todo el bucket.
drop policy if exists vh_photos_select on storage.objects;
