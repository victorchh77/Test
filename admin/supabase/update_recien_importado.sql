-- Marca km_publico = 'Recién importado' en el catálogo web para todos los
-- vehículos EXCEPTO:
--   - los que tienen chapa (modelo contiene 'chapa')
--   - cualquier Hilux
--   - la Santa Fe 2019
-- (esos mantienen su km real en el catálogo)
--
-- Requiere migration_km_publico.sql aplicada. Idempotente.

update public.vehicles
set km_publico = 'Recién importado'
where modelo not ilike '%chapa%'
  and modelo not ilike '%hilux%'
  and not (modelo ilike '%santa fe%' and anio = 2019);
