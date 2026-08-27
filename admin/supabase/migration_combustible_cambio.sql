-- ─────────────────────────────────────────────────────────────────────────
-- migration_combustible_cambio.sql
--
-- Agrega dos campos al vehículo para reflejar la planilla en papel
-- "AUTOMOVIL" que ya se usa en la empresa: combustible (Nafta/Diésel/etc.)
-- y "Cambio (volante)" (texto libre — transmisión, conversión de volante,
-- lo que el equipo quiera anotar ahí). Solo uso interno del panel, no se
-- exponen en el catálogo público (vehiculos_publicos no los incluye).
--
-- Aplicar UNA vez en el SQL editor de Supabase. Idempotente.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.vehicles add column if not exists combustible text;
alter table public.vehicles add column if not exists cambio text;
