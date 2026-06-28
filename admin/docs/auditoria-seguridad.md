# Auditoría de Seguridad y Rendimiento — VH Group

> Estado vivo del proyecto. Leyenda: ✅ hecho · ⚠️ pendiente (código/SQL) · 🔧 acción tuya en dashboards · severidad 🔴 alta · 🟠 media · 🟡 baja.

## 1. Resumen ejecutivo

El panel (Next.js 14 + Supabase) tiene una base sólida: RLS en todas las tablas, datos internos (`precio_compra`) ocultos al público, documentos financieros en buckets privados, y el panel protegido server-side (no solo middleware). Durante la auditoría se corrigieron **2 vulnerabilidades críticas** (escalada de privilegios a admin por `anon`, y volcado de emails) y varias mejoras (rate limiting, sanitización, headers, env). 

Quedan acciones **que solo vos podés hacer en el dashboard de Supabase** (desactivar auto-registro, leaked-password protection, MFA) — son hoy el mayor riesgo residual.

## 2. Hallazgos por capa

### 2.1 Infraestructura (Supabase / hosting / Codespaces)
- ✅ 🔴 `service_role key` solo en servidor (`SUPABASE_SERVICE_ROLE_KEY`, sin `NEXT_PUBLIC_`).
- ✅ 🟠 Buckets `transfer-receipts` y `pagares-contracts` → **privados** + URLs firmadas. `vehicle-photos` público pero sin listado.
- 🔧 🔴 **Auto-registro de Supabase Auth** posiblemente habilitado → cualquiera podría crear cuenta vía API y entrar como `vendedor`. Mitigado en DB (trigger solo crea perfil para emails `@vhgroup.internal`), pero **desactivalo igual** en Authentication.
- 🔧 🟠 **Leaked Password Protection** (HaveIBeenPwned) y **MFA** desactivados.
- 🟡 Codespaces/devcontainer: solo expone el puerto 3000 (dev). Sin riesgo en producción.

### 2.2 Autenticación, usuarios y contraseñas
- ✅ 🔴 `admin_update_user_role` y `get_all_profiles_with_email` ahora validan admin **dentro** de la función y no son ejecutables por `anon`.
- ✅ 🟠 Rate limiting en login (8/min por IP+usuario) → anti fuerza bruta.
- ✅ 🟠 Login devuelve error **genérico** (no revela si el usuario existe).
- ✅ 🟡 Contraseña mínima 8 caracteres al crear usuarios.
- ⚠️ 🟠 Enumeración de usuarios vía `get_email_by_username`: el login ya lo resuelve server-side con service-role; falta correr `supabase/harden_username_lookup.sql` para revocar el acceso `anon`.
- 🔧 🟡 Activar expiración/rotación de sesiones y MFA para admins.

### 2.3 Backend (RLS, funciones, queries)
- ✅ 🔴 RLS habilitado en todas las tablas (`supabase/ensure_rls.sql` como red de seguridad).
- ✅ 🟠 `transfers` / `pagares_*` restringidas a admin+secretaria (antes `USING(true)`).
- ✅ 🟠 Inyección de filtros PostgREST en el buscador de vehículos → **sanitizada**.
- ✅ 🟡 `search_path` fijo en funciones `SECURITY DEFINER`.
- ✅ 🟡 Vistas públicas como `security_invoker` con grants por columna (sin exponer `precio_compra`).

### 2.4 Frontend
- ✅ 🟠 Headers de seguridad (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `HSTS`) + `X-Powered-By` oculto.
- ✅ 🟠 Server Actions con `allowedOrigins` (anti-CSRF; Next ya exige Origin==Host).
- ✅ 🟡 Sin `dangerouslySetInnerHTML` con datos de usuario (solo el script de tema, contenido fijo). React escapa el resto → bajo riesgo XSS.
- ⚠️ 🟠 **CSP** (Content-Security-Policy) no configurada. Requiere nonces para los scripts inline de Next → cambio con cuidado (ver plan P2).

### 2.5 Datos sensibles
- ✅ 🔴 `precio_compra` (margen) nunca expuesto al público.
- ✅ 🟠 PII de clientes/empleados protegida por RLS (solo autenticados).
- 🟡 Considerar enmascarar documentos/teléfonos en logs y exportaciones.

### 2.6 Puertos y accesos
| Puerto | Servicio | Exposición | Recomendación |
|---|---|---|---|
| 3000 | Next.js dev (Codespaces) | Solo dev, reenviado | OK. No usar en prod. |
| 443 | App en prod (Vercel) | Público (HTTPS) | OK + HSTS (hecho). |
| 5432 / 6543 | Postgres / pooler Supabase | Gestionado por Supabase | No exponer; usar pooler (6543) en serverless. Rotar credenciales si se filtran. |

No hay puertos propios abiertos fuera de los gestionados. La DB no se expone directamente: todo pasa por la API de Supabase (anon key + RLS).

## 3. Plan de remediación (priorizado)

**P0 — sensible, hacer ya (dashboard, sin código):**
1. 🔧 Desactivar **auto-registro** en Authentication → Providers (Email → "Allow new users to sign up" OFF).
2. 🔧 Activar **Leaked Password Protection** y **MFA** para admins.
3. ⚠️ Correr SQL pendientes en el SQL editor: `ensure_rls.sql`, `migration_km_publico.sql`, `update_recien_importado.sql`, y `harden_username_lookup.sql` (este último solo si `SUPABASE_SERVICE_ROLE_KEY` ya está en Vercel).

**P1 — corto plazo:**
4. Configurar env en Vercel: `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS=tudominio.com`, `NEXT_PUBLIC_WHATSAPP`.
5. Backups automáticos de la DB (Supabase → Database → Backups) y probar restore.
6. Rate limiting respaldado por store compartido (Upstash) si se escala a varias instancias.

**P2 — endurecimiento:**
7. CSP con nonces (middleware) — mejora anti-XSS; requiere pruebas.
8. Vista `sales_with_details` (advisor `security_definer_view`) — evaluar `security_invoker`.
9. Política de rotación de claves (service_role) y revisión trimestral de roles/usuarios.

## 4. Análisis de rendimiento

Build de producción (First Load JS):
- Landing `/` y `/catalogo`: **estáticas (ISR 10 min)** → excelente. ~150 KB JS compartido.
- Dashboard: server-rendered on demand, 96–167 KB por ruta. Razonable.
- Middleware: 83 KB (corre en cada request no estático).

Observaciones y mejoras:
- 🟠 **`public/logo.png` ≈ 600 KB**: pesado para algo que se muestra chico. Comprimir/convertir a WebP (<50 KB) o usar `next/image` con `sizes`. Impacta la landing.
- 🟡 Catálogo usa `<img>` para fotos de Supabase (no `next/image`): aceptable, pero perder optimización/lazy nativo. Considerar `next/image` con `remotePatterns` (ya configurado).
- 🟡 `getFeaturedVehicles(200)` en `/catalogo` hace 2 queries (vehículos + fotos) — OK con ISR; si crece el stock, paginar.
- ✅ Listas con muchas filas: render server-side + tablas; en móvil ahora son tarjetas (menos DOM pesado).
- 🟡 Animaciones Framer Motion: respetan `prefers-reduced-motion`. Vigilar el costo en equipos lentos.

## 5. Mantenimiento (rutina recomendada)

- **Cada deploy:** `npm run build` (corre lint+types) y revisar que pase. Revisar `get_advisors` (security/performance) en Supabase.
- **Semanal:** revisar usuarios activos y roles (`/usuarios`); revisar intentos de login fallidos si se agrega logging.
- **Mensual:** rotar/revisar accesos; verificar backups (restore de prueba); `npm audit` de dependencias.
- **Trimestral:** revisión de políticas RLS y funciones `SECURITY DEFINER`; actualizar dependencias mayores (Next, Supabase).
- **Siempre:** ningún secreto en el código (usar env); `precio_compra` y datos internos nunca en vistas públicas; nuevas tablas → habilitar RLS + políticas antes de exponer.

---
_Última actualización: auditoría inicial. Mantener este archivo al día con cada cambio de seguridad._
