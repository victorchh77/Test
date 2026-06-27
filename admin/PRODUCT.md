# Product

## Register

product

## Users

Mixed internal team at VH Group S.R.L. — admins (business owners with full access), vendedores (salespeople who register sales, look up vehicles, and check prices daily), and secretaría (handles transfers and promissory note schedules). All three roles are active users; salespeople are the highest-frequency users. Everyone works from desktop in a dealership office environment; mobile is secondary but must not break.

## Product Purpose

Internal admin panel for VH Group S.R.L., a car dealership in Encarnación, Paraguay (10+ years). Manages vehicles, sales, clients, employees, expenses, transfers, price lists, and promissory note (pagaré) schedules. Success looks like: a salesperson registers a sale in under 2 minutes; an admin spots profitability at a glance; a secretary processes a transfer without friction. The app is Spanish-language throughout.

A secondary surface exists — a public brand landing page at `/` — that uses a different visual register (white-background, separate CSS). The landing page is out of scope for the default product register but can be targeted explicitly with `/impeccable bolder|craft|polish` using `brand` context.

## Brand Personality

Moderno · Ágil · Ambicioso — modern craft, fast-moving workflows, growth-oriented ambition. The UI should feel as forward-thinking as VH Group's aspirations: precise, sharp, premium — not a generic tool. Orange is the brand energy; the dark shell is the professional foundation.

## Anti-references

- **Admin dashboard**: Not a generic SaaS-cream or navy-and-gray admin template (Stripe Dashboard clone, shadcn defaults, indistinguishable from 1,000 other tools). Should feel purpose-built for a car dealership in motion.
- **Landing page**: Not a stock-photo hero slider with badge-heavy layouts and "LOWEST PRICE" CTA banners — the typical dealership template aesthetic.

## Design Principles

1. **Speed is a feature** — Every extra click costs a sale. Common paths (register a sale, look up a vehicle) must be frictionless. Information density over decorative breathing room.
2. **Role clarity** — Each user's scope should feel obvious without labels. Admins see everything; vendedores see their lane; secretaría has a clean minimal view. The UI should never feel cluttered to the person who only has 3 menu items.
3. **Earn trust through precision** — Financial figures, client records, and transfer data must feel exact. Typography, spacing, and alignment signal reliability. Sloppy layout = untrustworthy product.
4. **Ambition made visible** — The design should feel ahead of what competitors in Encarnación ship. Orange-on-dark is the design bet: bold enough to feel intentional, professional enough to close deals.
5. **Local roots, global craft** — Paraguayan dealership, world-class execution. No apologizing for being regional; the craft should stand on its own.

## Accessibility & Inclusion

WCAG AAA target. Strong contrast on all text (especially financial figures, form labels, and nav items). Full keyboard navigation in dashboards and modals. Reduced-motion alternatives for all animations. The dark theme is the default; no light-mode toggle required, but contrast must hold throughout the existing dark palette.
