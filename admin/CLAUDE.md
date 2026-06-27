# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `/workspaces/Test/admin/`:

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

There is no test suite — verify changes by running the dev server.

## Environment

Copy `.env.example` to `.env.local` and fill in real Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The middleware fails gracefully when these are missing or contain `placeholder` — it redirects all dashboard routes to `/login` instead of crashing.

## Architecture

**VH Group S.R.L.** — a car dealership admin panel (Next.js 14 App Router, Supabase, Tailwind). The app is Spanish-language; all routes, labels, and database column names are in Spanish.

### Route Groups

- `app/(landing)/` — Public landing page served at `/`. Loads its own CSS (`/public/landing-style.css`) and JS (`/public/landing-main.js`) via `useEffect` to avoid polluting the dashboard's Tailwind styles.
- `app/(auth)/login/` — Login page, outside the dashboard layout.
- `app/(dashboard)/` — Protected admin panel. All routes here require an authenticated `profiles` row.

### Auth & Role System

Authentication uses Supabase Auth. On sign-up, a trigger auto-creates a `profiles` row with `role = 'vendedor'` by default.

Three roles control access:
- **admin** — full access, can create/edit/delete vehicles, users, etc.
- **vendedor** — read-only on vehicles; can register sales and view clients/price lists.
- **secretaria** — limited to transferencias and planilla-pagarés.

Role checks live in `lib/auth/roles.ts`. Server components and Server Actions call `isAdmin()`, `getRole()`, or `requireAdmin()` from there. The sidebar (`components/layout/Sidebar.tsx`) shows different nav items per role.

### Data Flow

All database access goes through **Server Actions** in `lib/actions/`. Pages are server components that call these actions directly — there is no API layer. Client components that need to trigger mutations import the action and call it from a `<form action={...}>` or event handler.

Pattern for a new feature:
1. Add/extend types in `types/database.ts` (and `types/index.ts` for complex shapes)
2. Add Zod schema in `lib/validations/`
3. Add Server Actions in `lib/actions/`
4. Build the page as a server component in `app/(dashboard)/`

### Supabase Client Helpers

- `lib/supabase/server.ts` — `createClient()` for Server Components and Server Actions (uses `next/headers` cookies)
- `lib/supabase/client.ts` — browser client for Client Components
- `lib/supabase/middleware.ts` — session refresh + auth redirect logic

Never use the browser client in a Server Component or action.

### UI Components

Custom component library in `components/ui/` (Button, Card, Badge, Input, Modal, Select, Table, Textarea) and shared components in `components/shared/`. These are not shadcn — they are hand-written with Tailwind.

The dashboard chrome is `components/layout/DashboardShell.tsx` (client component) wrapping `Sidebar` and `Header`. The shell is mounted by `app/(dashboard)/layout.tsx`, which fetches the profile server-side and passes it down.

### Key Database Views

- `sales_with_details` — Supabase view that joins `sales` + `vehicles` + `clients` + `profiles`. Used for the sales list and dashboard stats. Do not try to join these manually.

### Utility Functions

- `lib/utils/format.ts` — `formatCurrency` (Guaraníes, `es-PY` locale), `formatDate`, `formatDatetime`, `formatKm`, `calcRentabilidad`
- `lib/utils/constants.ts` — shared constant values

### Schema Migrations

SQL files in `supabase/` are applied manually in the Supabase dashboard SQL editor. `schema.sql` is the canonical base; numbered `migration_*.sql` files are incremental patches.
