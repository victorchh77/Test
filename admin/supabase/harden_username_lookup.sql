-- Cierra la enumeración de usuarios: get_email_by_username deja de ser
-- ejecutable por anon/público. El login lo resuelve del lado servidor con el
-- cliente service-role (ver lib/actions/auth.ts).
--
-- PRE-REQUISITO: SUPABASE_SERVICE_ROLE_KEY debe estar configurada en el entorno
-- (Vercel), porque el login usa el cliente service-role para esta consulta.
-- Si no lo está, NO apliques este revoke (el login por usuario dejaría de
-- resolver el email).

revoke execute on function public.get_email_by_username(text) from public, anon, authenticated;
grant  execute on function public.get_email_by_username(text) to service_role;
