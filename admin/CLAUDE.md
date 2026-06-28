# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Your Role

You are an **expert full-stack web developer** proficient in:
- **Frontend**: TypeScript, React 18, Next.js 14 App Router, Tailwind CSS, Framer Motion
- **Backend**: Node.js, SQL, Supabase, Server Actions, middleware patterns
- **Languages & Paradigms**: JavaScript/TypeScript (primary), HTML5, CSS3, REST, GraphQL-ready

**Core Principles** (non-negotiable):
1. **User Experience First** — Every interaction should feel smooth, responsive, and intentional. Animations enhance, never distract.
2. **Performance** — Code splitting, lazy loading, optimized queries, minimal bundle size. Measure with DevTools regularly.
3. **Accessibility** — WCAG AAA compliance, semantic HTML, keyboard navigation, screen reader support, sufficient contrast (especially financial data).

---

## Commands

All commands run from `/home/user/Test/admin/`:

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

Verify changes by running the dev server. No automated test suite — manual verification is the source of truth.

---

## Environment

Copy `.env.example` to `.env.local` and fill in real Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The middleware fails gracefully when these are missing or contain `placeholder` — it redirects all dashboard routes to `/login` instead of crashing.

---

## Architecture

**VH Group S.R.L.** — a car dealership admin panel (Next.js 14 App Router, Supabase, Tailwind, Framer Motion). 
The app is **Spanish-language throughout**; all routes, labels, database column names, and UI copy are in Spanish.

### Design Language

- **Dark Mode**: Primary BG `#080C11`, Sidebar `#0B0F18`, Cards `#0F1520`
- **Accent Color**: Orange `#FF8C00` (brand energy, confidence, forward-thinking)
- **Secondary Accents**: Success `#00C984`, Error `#FF4D6A`, Warning `#FFB800`
- **Typography**: Inter 300–700 weights, tabular nums for financial data
- **Animations**: Smooth easing `[0.25, 0.46, 0.45, 0.94]`, duration 200–400ms (fast, responsive)
- **Visual Effects**: Ambient orbs, tilt 3D on cards, shimmer sweeps, breathing glows, scan lines — all subtle, non-blocking

### Route Groups

- `app/(landing)/` — Public marketing landing page served at `/` (not auth-gated; middleware lets `/` through). Built with the dashboard's own Tailwind design system + Framer Motion. Composed in `page.tsx` (async server component, `revalidate = 600` ISR) with client islands in `app/(landing)/_components/`: `LandingNav` (sticky glass nav), `Hero` (animated hero + search bar), `ContactForm` (builds a WhatsApp prefill link), and `Reveal`/`RevealGroup`/`RevealItem` (scroll-triggered reveals). The **featured vehicles are real stock** from `getFeaturedVehicles()` (`lib/actions/vehicles.ts`), which reads the public Supabase views `vehiculos_publicos` / `vehiculo_fotos_publicas` via `lib/supabase/public.ts` (anon client, no cookies). Falls back to demo units if Supabase is unconfigured or the migration hasn't run. Stats/services/testimonials are still static copy. Vehicle cards show the real main photo when present, else a gradient + lucide `Car` icon.

> ⚠️ The landing requires `supabase/migration_landing_public.sql` to be applied in the Supabase SQL editor. It creates two read-only views exposing only public columns (never `precio_compra`) of non-sold vehicles, granted to `anon`. Without it, RLS blocks anonymous reads and the landing shows demo units.
- `app/(auth)/login/` — Login page, outside the dashboard layout.
- `app/(dashboard)/` — Protected admin panel. All routes here require an authenticated `profiles` row.

### Auth & Role System

Authentication uses Supabase Auth. On sign-up, a trigger auto-creates a `profiles` row with `role = 'vendedor'` by default.

Three roles control access:
- **admin** — full access, can create/edit/delete vehicles, users, etc.
- **vendedor** — read-only on vehicles; can register sales and view clients/price lists.
- **secretaria** — limited to transferencias and planilla-pagarés.

Role checks live in `lib/auth/roles.ts`. Server components and Server Actions call `isAdmin()`, `getRole()`, or `requireAdmin()` from there. The sidebar shows role-specific nav items via `components/layout/Sidebar.tsx`.

### Data Flow

All database access goes through **Server Actions** in `lib/actions/`. Pages are server components that call these actions directly — there is **no REST API layer**. Client components that need to trigger mutations import the action and call it from a `<form action={...}>` or event handler.

**Pattern for a new feature:**
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

### Global Styles & Animations

- `app/globals.css` — CSS variables, keyframes (orbFloat, shimmer, fadeSlideUp, borderSpin, glowBreath, scanDown, valuePop), utility classes (glass, glow-orange, shimmer, gradient-border-animated, glow-text-orange, ring-glow-breath, scan-line)
- `tailwind.config.ts` — extended theme (colors, shadows, animations, box-shadows)

---

## Performance & Accessibility Checklist

When implementing features:
- [ ] Images use `next/image` with explicit width/height
- [ ] Async data fetches use Suspense boundaries
- [ ] Client components are isolated to interactive parts only
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 7:1 for financial figures
- [ ] All interactive elements are keyboard-accessible (Tab, Enter, Escape)
- [ ] Form labels associate with inputs via `htmlFor`
- [ ] Modals trap focus and close on Escape
- [ ] Animations respect `prefers-reduced-motion`
- [ ] SVG icons include `aria-label` when used standalone
- [ ] Tables have `<thead>`, `<tbody>`, proper `scope` attributes
- [ ] Error messages are clear and associative (not just red color)

---

## Schema Migrations

SQL files in `supabase/` are applied **manually** in the Supabase dashboard SQL editor. 
- `schema.sql` — canonical base schema
- `migration_*.sql` — incremental patches (apply in order by number)

Document each migration with a comment explaining the change and reason.

---

## Design Principles (Non-Negotiable)

1. **Speed is a feature** — Every extra click costs a sale. Common paths (register sale, look up vehicle) must be frictionless.
2. **Role clarity** — Each user's scope should be obvious without labels. Admins see everything; vendedores see their lane; secretaría has a clean minimal view.
3. **Earn trust through precision** — Financial figures and client records must look exact. Typography, spacing, and alignment signal reliability.
4. **Ambition made visible** — The design should feel ahead of what regional competitors ship. Orange-on-dark is the bet: bold enough to feel intentional, professional enough to close deals.
5. **Local roots, global craft** — Paraguayan dealership, world-class execution. No apologizing for being regional; the craft stands on its own.

---

## Notes for AI

- Prioritize **user experience** over clever engineering. A boring solution that users love beats a clever one they avoid.
- When in doubt, **measure**. Use DevTools (Lighthouse, Network, Performance) to validate changes.
- **Animate sparingly**. Motion should guide attention or reward interaction, never distract.
- **Accessibility is not negotiable.** If a change breaks keyboard navigation or contrast, reject it.
- **Spanish first**. All copy, labels, and error messages are in Spanish unless explicitly global (e.g., "Next.js").
- When adding routes or data, update this CLAUDE.md to keep it current.
