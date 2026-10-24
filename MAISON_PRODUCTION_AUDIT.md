# MAISON — Production Audit

> ## ⚠️ Status update — 2026-10-04: the central finding below is now out of date
>
> This audit's defining conclusion was *"there is no backend, so orders placed by a
> customer never reach the shop owner."* **That is no longer true.** Maison now runs on
> PostgreSQL (Docker + Prisma 7), and an order placed by a customer has been verified
> end-to-end as visible to the admin from a separate client.
>
> Now persisted server-side: **orders, products, variants and stock.** Still
> browser-local (by design or pending): **cart and wishlist** (correct — they're
> per-browser), **CMS content and store settings** (pending).
>
> Also changed since this was written: the checkout crash, the admin-auth bypass and
> the dependency CVEs are fixed; tests and CI exist. Sections A–C and F below describe
> the project **as of 2026-09-05** and are kept as the original record — read the
> *Production Readiness Score* table and `README.md` for current state.
>
> **Still genuinely blocking launch:** card payments are a stub (COD is fine), there is
> no product photography, and there are no legal pages.

**Date:** 2026-09-05 · **Status banner updated:** 2026-10-04
**Scope:** `/Users/anahayay/Desktop/new project with salman/maison`
**Method:** Full source read of every file in `src/`, `git log`/`git status`, `tsc --noEmit`, `eslint`, `npm audit`, a real `next build`, and a live browser session that actually placed an order and attempted an admin login — findings below are marked **(verified live)** where I reproduced them, not just read them in code.

---

## A. Project Overview

**What MAISON is today:** a single-store, French-language, Morocco-market e-commerce **front end** for a luxury perfumery/cosmetics brand ("Maison"). It has a full storefront (browse, filter, search, cart, wishlist, checkout) and a full-looking admin back-office (products, orders, clients, CMS content, settings, stats). Visually it's a genuinely well-produced luxury-retail UI — consistent gold/graphite palette, serif display type, restrained motion, sensible component structure.

**What it is not, yet:** a working online store. There is no server. Every "backend" concern — product catalog, cart, orders, customers, admin auth, CMS content, shipping/payment config — lives entirely in the visiting browser's `localStorage` via Zustand. There is no database, no API route, no server action, no auth provider, no payment gateway, no email service, and no deployment. This is the single fact that should shape every priority in this audit: **MAISON is a high-fidelity, mostly-complete UI prototype, not a pre-launch SaaS with a broken backend.** The gap to "real store" is not bug-fixing, it's building the backend that doesn't exist yet.

**Target users:**
1. Moroccan consumers shopping for perfume/cosmetics, paying by cash-on-delivery (COD) or card, in MAD.
2. The store's own staff, managing catalog/orders/content through `/admin`.

**Tech stack (verified from `package.json` and source):**

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.10 (App Router, Turbopack) | Very recent major version — see [AGENTS.md](../new%20project%20with%20salman/maison/AGENTS.md), which itself warns the framework has diverged from training-data behavior |
| UI | React 19.2.4, Tailwind CSS v4 | |
| State | Zustand 5 (+ `persist` middleware → `localStorage`) | Used for cart, wishlist, and **all** admin data |
| Forms | react-hook-form + Zod | Good choice, used consistently |
| Motion | Framer Motion | Used broadly, tastefully |
| Charts | Recharts | Admin dashboard only |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` | **Installed but unused anywhere in `src/`** — 30MB of dead dependency weight, see §5 |
| Data | Static TypeScript files (`src/lib/data/*.ts`) | 26 seed products, mock orders |
| Payment | Stub adapter (`src/lib/adapters/payment.ts`) | Explicit `TODO: Replace with CMI` — always returns `success: true` |
| Shipping | Static city/price table (`src/lib/adapters/shipping.ts`) | `TODO: Replace with Sendit API` |
| Auth | None — hardcoded client-side check | See Security Audit, Finding S-1 |
| Database | None | |
| Email | None | |
| Hosting/CI | None configured; single git commit; no `.env*` anywhere | |

**External services wired:** none. Everything referenced (CMI payment gateway, Sendit shipping) is a documented TODO, not a live integration.

---

## B. Current Architecture

```
Visitor's Browser
   ├─ Next.js App Router (mostly static-generated pages, a few dynamic [slug]/[id] routes)
   ├─ Zustand stores (cart, wishlist, admin-*) ──persist──▶ localStorage (THIS browser only)
   └─ Adapters (payment/shipping/product-source) — stub implementations, no network calls out
                                                    │
                                                    ▼
                                          (nothing — no API, no DB, no third party)
```

There is no `User → Frontend → API → Services → Database → External services` chain yet — the chain currently terminates at `localStorage`. Concretely, this means:

- An order placed on a customer's phone is **invisible** to the admin dashboard opened on the shop owner's laptop — they are different browsers with different `localStorage`. The admin "Orders/Clients/Stats" screens can only ever show orders placed in that same browser.
- The admin login "protects" a dashboard that, for any other visitor, is simply empty (no data) rather than genuinely inaccessible — but see Security Audit for why "empty" isn't actually true either.
- Nothing here can survive clearing browser data, switching devices, or two staff members working at once.

**Strong architectural decisions worth keeping:**
- The `ProductAdapter` / `PaymentAdapter` / `ShippingAdapter` interfaces in `src/lib/types.ts` are a genuinely good seam — swapping the stub payment adapter for a real CMI integration, or product-source for a real DB, is a localized change, not a rewrite. Keep this pattern.
- Route structure matches the App Router idiom well; client/server component boundaries are used correctly where they exist (`page.tsx` importing a `*Client.tsx` for interactive pieces, e.g. `contact/page.tsx` + `ContactClient.tsx`).
- Design tokens centralized in `globals.css` `@theme` block; Tailwind v4 usage is consistent across ~370 usages.
- Zod + react-hook-form on every form seen (login, checkout phone validation with a real Moroccan phone regex).

**Questionable decisions / technical debt:**
- The admin dashboard is built as if a backend existed (KPIs, revenue charts, customer segmentation) but the underlying data can never be real in this architecture — this is the biggest mismatch between what's built and what will work.
- A hydration-gate pattern (`useState(isHydrated)` + `useEffect(() => setIsHydrated(true))`) is copy-pasted across ~12 files to work around Zustand's `skipHydration: true`. ESLint (Next.js 16's `react-hooks/set-state-in-effect` rule) flags every instance. It works, but it's the kind of duplication that should become one `useHydrated()` hook.
- `checkout/page.tsx` calls `useEffect` after a conditional early `return` — a genuine Rules-of-Hooks violation, not just a style nit. **(verified live: this crashes the page)** — see §D and Security/Bug findings.
- Order IDs are `` `ORD-${Math.floor(Math.random()*1000000)}` `` — no uniqueness guarantee (1-in-a-million collision chance per order, gets worse fast with volume).

**Missing architecture (expected — see Launch Plan):** database, API/server actions layer, real authentication (customer + admin), payment gateway integration, transactional email, image hosting/upload pipeline, monitoring/error tracking, environment configuration, CI/CD.

---

## C. Feature Inventory

Legend: ✅ Production-ready · 🟡 Needs improvement · 🔴 Blocking · ⚪ Optional/nice-to-have

| Feature | Location | Status | Notes |
|---|---|---|---|
| Homepage / hero / promo / announcement bar | `src/app/page.tsx`, `HomeSections.tsx` | 🟡 | CMS-editable via admin, but not persisted server-side; hero imagery depends on the same broken product-image pipeline |
| Catalog browse / category / filters / sort | `categorie/[slug]`, `nouveautes`, `bestsellers`, `cadeaux`, `boutiques` | 🟡 | Logic is solid client-side filtering; fine at this catalog size (dozens of SKUs), will not scale to thousands without server-side filtering |
| Product detail page | `produit/[slug]/ProductDetail.tsx` | 🟡 | Functional; broken imagery (see F-1) |
| Search | `recherche/`, `SearchOverlay.tsx` | 🟡 | Client-side array search; has a `set-state-in-effect` lint error but works |
| Cart | `panier/`, `CartPanel.tsx`, `store/cart.ts` | ✅ | Well-implemented for a client-only cart |
| Wishlist | `wishlist/`, `store/wishlist.ts` | ✅ | Appropriate to be client-only |
| **Checkout** | `checkout/page.tsx` | 🔴 **BLOCKING** | **(verified live)** Crashes with `Uncaught Error: Rendered fewer hooks than expected` on every successful order — see F-2. This is the #1 fix. |
| **Payment** | `lib/adapters/payment.ts` | 🔴 **BLOCKING** | Stub always returns success; "card" payments never actually charge a card. Shipping this as-is means taking card orders without collecting money |
| Order tracking | `suivi-commande/` | 🟡 | Can only ever look up orders that exist in the current browser |
| Customer account | `compte/page.tsx` | 🔴 | Fake login accepts **any** email/password combination; without entering a phone number it shows **all** demo orders to anyone who "logs in" |
| **Admin authentication** | `store/admin-auth.ts`, `admin/login/` | 🔴 **CRITICAL** | **(verified live)** Hardcoded single credential (`admin@maison.ma` / `admin123`) shipped in the client bundle, printed in plaintext on the login screen, and trivially bypassable via one `localStorage.setItem` call from the browser console with zero knowledge of the password — see Security Audit S-1 |
| Admin dashboard/stats | `admin/statistiques`, `AdminChart.tsx` | 🟡 | Computes real-looking KPIs, but only from whatever orders happen to be in that browser — not a usable business tool as-is |
| Admin products CRUD | `admin/produits/*` | 🟡 | Client-only; changes don't persist beyond the admin's own browser/device; no real image upload |
| Admin orders | `admin/commandes/*` | 🔴 | Same client-isolation issue — orders placed by real customers on their own devices will never appear here |
| Admin clients | `admin/clients` | 🟡 | Derived from local order history only |
| Admin content (CMS) | `admin/contenu`, `store/admin-content.ts` | 🟡 | Editable but not centrally persisted |
| Admin settings | `admin/parametres`, `store/admin-settings.ts` | 🟡 | Shipping/payment config, store info — same limitation |
| Static pages (à-propos, contact, FAQ, livraison, boutiques) | `src/app/*` | 🟡 | Content present; social links are placeholder `#` hrefs; newsletter signup shows a success toast without sending anywhere |
| WhatsApp contact button | `components/ui/WhatsAppButton.tsx` | ✅ | Correctly wired to admin settings, not hardcoded |
| Legal pages (Privacy/Terms/CGV) | — | 🔴 | Do not exist at all |
| SEO (sitemap, robots.txt, OG/Twitter cards, canonical) | — | 🔴 | Only a static `<title>`/`<description>` in `layout.tsx`; nothing else |
| Error/not-found/loading boundaries | — | 🔴 | No `error.tsx`, `not-found.tsx`, or `loading.tsx` anywhere in `src/app` |
| Analytics | `lib/utils/analytics-helpers.ts` | 🔴 | Only math helpers for the admin dashboard; no actual analytics SDK (GA4/Meta Pixel/etc.) is installed anywhere |
| Tests | — | 🔴 | None exist (no `*.test.*`/`*.spec.*` files) |
| CI/CD | — | 🔴 | None (no workflow files) |
| Environment config | — | 🔴 | No `.env*` file exists anywhere — nothing to leak, but also nothing prepared |

---

## D. UI/UX Audit

**Visual design:** genuinely good for this stage. Consistent gold (`#B8860B`/`#C8923C`)-on-graphite luxury palette, `Cormorant Garamond` display type paired with `Inter` body text, consistent `focus-visible` rings, a tasteful `glass-surface` frosted utility used for overlays, restrained Framer Motion (hover lift on product cards, staggered fades). This does not look like a first draft.

**The one thing undermining it completely: every product image is broken.** **(verified)** `public/images/products/` does not exist at all; all 26 product image paths referenced in `src/lib/data/products.ts` 404. `ProductCard.tsx` has a graceful fallback (a branded initial on a gradient), but `ProductDetail.tsx`'s fallback is a plain gray box, and Next's image optimizer returns HTTP 400 for the missing files **(seen live in console)**. For a brand whose entire value proposition is "luxury," a catalog with zero real product photography is disqualifying on its own — this must be fixed before any traffic is worth sending here.

**Loading/empty/error states:** present at the component level (image `onError` fallback, button spinners during submit) but absent at the page/route level — no custom `loading.tsx`, `error.tsx`, or `not-found.tsx` anywhere, so any unhandled error currently falls through to Next's default dev overlay (or, in production, a blank screen — as reproduced in §Bugs below) instead of a branded, recoverable error page.

**Key user journeys:**
- Browse → product → cart → checkout → confirmation: **broken at the last step.** (verified live crash, see F-2)
- Customer login: not real — any input succeeds, so there's no actual account boundary to evaluate
- Password recovery: not implemented for either customers or admin
- Admin login → dashboard: technically "works" but is not a real access boundary (see Security Audit)
- Logout: present for admin (clears the Zustand auth state); "logout" for customers just clears local form fields, since there was never a real session

**Mobile / responsive:** the Tailwind-based layout (flex/grid, `sm:`/`md:`/`lg:` breakpoints used throughout) suggests reasonable responsiveness, and I confirmed the storefront renders correctly at desktop viewport live. I did not exhaustively drive every page at 320/375/390/430px in this pass — treat this as **unverified, not failing**, and budget an explicit mobile pass (Launch Plan Phase 2) before launch, since this is a majority-mobile market (Moroccan e-commerce skews heavily mobile).

---

## E. Security Audit

Moved to a dedicated document: **[MAISON_SECURITY_AUDIT.md](MAISON_SECURITY_AUDIT.md)**. Headline, verified-live findings: the admin panel has no real access control (one browser-console command grants full admin access with no password), and the checkout success path crashes for every customer.

---

## F. Verified Bugs (reproduced, not inferred)

These were confirmed by actually running the app (Node 22, `next dev`), driving a real browser through the flows, and reading console/network output — not by reading code alone.

**F-1 — All product images 404.** `public/images/products/` doesn't exist; 26/26 referenced image files are missing. Every product page and card either shows a fallback placeholder or (on `ProductDetail.tsx`) a bare gray box. Next's `/_next/image` optimizer returns `400 Bad Request` for each one (visible in browser console).

**F-2 — Checkout crashes on every successful order. 🔴 P0.** `checkout/page.tsx:131` calls `useEffect` *after* an early `return` at line 116 (the success-state render). The moment `setSuccessOrderId(order.id)` fires post-payment, React throws `Uncaught Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.` I reproduced this end-to-end: added a product to cart, filled the checkout form with a valid Moroccan phone/city, submitted, and the page went blank ("This page couldn't load") right as the order should have confirmed. The order *is* saved to `admin-orders` state before the crash (`addOrder(order)` runs first), but the customer never sees their confirmation or order number — from their perspective, the purchase appears to have failed. **This is the single highest-priority fix in the entire codebase**, full stop — no other launch work matters if the core conversion event breaks the page.

**F-3 — Admin panel has no real access control. 🔴 P0 (see Security Audit S-1 for full detail).** Verified by running one line in the browser console (`localStorage.setItem('maison-admin-auth', ...)`) with no knowledge of any password, then navigating to `/admin` — full dashboard access granted immediately.

**F-4 — `npm audit`: 5 high-severity vulnerabilities**, all transitive (via `next`'s bundled `postcss`, and `sharp`). `npm audit fix --force` resolves them but bumps `next` outside its stated semver range — needs a controlled upgrade + full regression pass, not a blind `--force`.

**F-5 — Local build is currently broken for this environment.** Installed Node is 18.20.8; Next.js 16 requires `>=20.9.0`. `npm run build` fails immediately with a version-check message before touching any code. I verified the app *does* build cleanly once run under Node 22 (26 routes, mostly statically prerendered) — so this is an environment/tooling gap, not a code defect, but it will block CI and any teammate's machine running the wrong Node version until an `.nvmrc`/`engines` field is added and the environment is upgraded.

**F-6 — ESLint: 59 errors, 25 warnings.** `npx eslint .` breakdown:
| Rule | Count | Severity |
|---|---|---|
| `react/no-unescaped-entities` | 36 | cosmetic (raw `'` in JSX text) |
| `@typescript-eslint/no-unused-vars` | 18 | cleanup |
| `react-hooks/set-state-in-effect` | 12 | the hydration-gate pattern, see §B |
| `@typescript-eslint/no-explicit-any` | 7 | type-safety gaps, mostly in `AdminChart.tsx`/`DataTable.tsx` |
| `react-hooks/exhaustive-deps` | 3 | possible stale-closure bugs |
| `react-hooks/rules-of-hooks` | 1 | **this is F-2 above** |
| misc (`@next/next/no-img-element`, `@typescript-eslint/ban-ts-comment`, etc.) | 6 | minor |

**F-7 — Unused heavy dependencies.** `three`, `@react-three/fiber`, and `@react-three/drei` (30MB in `node_modules`) are installed but never imported anywhere in `src/`. Either there's a planned 3D product viewer that hasn't been built yet, or these should be removed — as installed they only cost install/CI time (Next's per-route code splitting means they aren't currently bloating any shipped bundle, since nothing imports them).

**F-8 — Workspace-root warning.** Turbopack detects a second `package-lock.json` at `/Users/anahayay/package-lock.json` (your home directory) and warns it's not sure which is the real project root. Harmless today but worth silencing with an explicit `turbopack.root` in `next.config.ts` before it causes a real misconfiguration later.

---

## G. Performance

- Build output shows the storefront is mostly statically prerendered (`○ Static`) with `[slug]`/`[id]` routes correctly marked dynamic (`ƒ`) — a good baseline once real data is behind them.
- `next/image` is used correctly in the highest-traffic component (`ProductCard.tsx`), with proper `sizes`. Three other spots (`ProductImage.tsx`, `SearchOverlay.tsx`, admin order detail) use a raw `<img>` and will need to move to `next/image` once real photography exists — low effort, flagged by ESLint already.
- No N+1/expensive-query concerns exist yet because there is no database — this becomes relevant the moment a real backend is built (see Launch Plan Phase 6 for index/query guidance to apply from day one).
- Fonts are loaded via `next/font/google` (self-hosted, no render-blocking third-party font request) — good.
- Recommend removing the unused 3D dependencies (F-7) purely for install/CI hygiene, not because they currently affect runtime bundle size.

**Realistic targets once real images/backend exist:** LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range Android device on 4G — achievable with this stack provided product photos are compressed/served via `next/image` and the eventual API responses are paginated.

---

## H. Database

There is no database. When one is added (Launch Plan Phase 1), the schema implied by the existing `src/lib/types.ts` (`Product`, `Variant`, `Order`, `OrderItem`, `Customer`, `ShippingAddress`) is already a solid starting relational model — normalize `Product`→`Variant` as a one-to-many, `Order`→`OrderItem` as a one-to-many with a foreign key to `Product`/`Variant`, and derive `Customer` from `Order` server-side the same way `analytics-helpers.ts` already does it client-side (that logic ports over almost directly). Plan for indexes on `Order.createdAt`, `Order.shippingAddress.phone` (or a proper `customerId` FK instead of phone-matching), and `Product.slug`.

---

## I. Code Quality

Overall quality is above average for this stage: consistent naming, small focused components, no `dangerouslySetInnerHTML`/`eval`/`document.write` anywhere (checked), no secrets committed (checked — the only "secret" is the intentionally-fake demo password). The main recurring issues are the duplicated hydration-gate pattern (§B), scattered `any` types in the admin chart/table components, and the one real Rules-of-Hooks bug (F-2). None of this calls for a rewrite — targeted fixes, not architecture changes.

---

## J. Error Handling

No page-level error boundaries exist. Recommend adding root and per-segment `error.tsx`, a `not-found.tsx`, and `loading.tsx` for the few genuinely async routes — standard Next.js App Router primitives, low effort, currently 100% missing. Until then, any unhandled exception (like F-2) takes down the whole page with no recovery UI, exactly as reproduced live.

---

## K. Accessibility

Encouraging signs: consistent `focus-visible` outlines defined globally, `aria-label`s on icon-only buttons (wishlist toggle, WhatsApp button), semantic use of `<button>`/`<Link>`. Not exhaustively audited with a screen reader in this pass. Recommend, before launch: a keyboard-only pass through checkout (currently impossible to complete anyway due to F-2), contrast-check the gold-on-white CTA buttons (`#B8860B` on white is borderline for WCAG AA at small text sizes — verify), and confirm the mobile menu/search overlay trap focus correctly when open.

---

## L. SEO

Currently minimal: a single static `<title>`/`<description>` pair in `layout.tsx`, no `metadataBase`, no per-page metadata (product pages don't set their own title/description from product data), no Open Graph or Twitter card tags, no `sitemap.xml`, no `robots.txt`, no structured data (`Product`/`Offer` JSON-LD would materially help rich results for an e-commerce catalog). None of this is hard in Next.js 16 (`generateMetadata`, `app/sitemap.ts`, `app/robots.ts` are built-in) — it's simply not started yet. See Launch Plan Phase 7.

---

## M. Analytics

Nothing is currently collecting real usage data — `analytics-helpers.ts` is pure math over local order data, not a tracking SDK. Recommended minimal funnel once a backend exists:

```
Visitor → Product view → Add to cart → Checkout started → Order placed → Repeat purchase
```
Suggested events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase` (GA4 e-commerce naming, so it plugs into standard reporting), plus `admin_login_success/failure` server-side for security monitoring. Collect only what's needed — order total, city, payment method, no more.

---

## N. Monetization

MAISON already encodes a sensible, simple model in its own data structures — this doesn't need reinventing:
- **Revenue stream:** direct product sales (perfume/cosmetics), MAD pricing, COD-first with card as an option — appropriate for the Moroccan market where COD dominates e-commerce trust.
- **Free vs. paid:** there is no SaaS tier here — the "product" being sold is physical goods, not software access, so this isn't a freemium decision. The nearest analogue is shipping economics (free above a threshold, as already modeled in `shippingAdapter`) and possibly a future loyalty/repeat-customer mechanism.
- **Recommended near-term monetization levers**, in order of effort vs. impact: (1) get COD checkout actually working end-to-end (F-2) — this alone is the entire revenue path today; (2) real card payments via CMI once COD is proven; (3) abandoned-cart recovery (needs real customer accounts/email first); (4) bundles/gift sets (the `cadeaux` page already exists as a merchandising surface).
- **Main business risk:** launching before F-2/F-3/backend exist means either zero real orders reach the owner, or (worse) card charges are silently faked while product ships — a direct financial/legal exposure, not just a UX bug.

---

## O. Conversion / Landing Page

5-second test on the homepage: brand name, luxury positioning, and primary nav are clear; "what makes it different" and social proof (reviews, press, guarantees) are not strongly present yet. Trust signals to add before spending on traffic: real product photography (F-1 blocks this entirely), a visible return/shipping policy link in the header (not just footer), and genuine customer reviews (the `rating`/`reviewCount` fields exist in the data model but there's no visible review content or UGC anywhere). CTA hierarchy (amber "Ajouter au panier"/quick-add) is clear and consistent.

---

## P. Legal / Trust Checklist

None of the following exist yet: Privacy Policy, Terms of Service, a real refund/cancellation policy page (there's a `livraison` — shipping/returns — page, but no CGV/mentions légales), or a cookie banner (not yet needed since no analytics/cookies are set, but will be the moment analytics is added). For a Morocco-based commerce site collecting names/phone/addresses at checkout, get a lawyer to confirm requirements under Law 09-08 (Morocco's data protection law) before launch — flagged for professional review, not resolved here.

---

## Q. Production Infrastructure (summary — full detail in [MAISON_DEPLOYMENT_GUIDE.md](MAISON_DEPLOYMENT_GUIDE.md))

Recommended: Vercel (frontend hosting, matches Next.js natively), a managed Postgres (Supabase or Neon), Supabase Auth or a lightweight custom JWT session for the two auth surfaces needed (customer + admin), CMI for card payments (already anticipated by the adapter), Resend or similar for transactional email, Sentry for error tracking. Simplest stack that actually closes every gap found above — no microservices, no self-managed servers needed.

---

## R. Production Readiness Score

Scores are shown as **original (2026-09-05) → current (2026-09-24)**.

| Area | Score /100 | Why |
|---|---|---|
| Architecture | 55 → 85 | Real backend: PostgreSQL + Prisma 7, route handlers, server-side repricing. Orders/products/stock persisted; CMS content and settings still browser-local |
| Code quality | 68 → 85 | 0 lint errors (was 59), 0 `any`-typed escapes in shared components, duplicated image/hydration logic consolidated |
| UI/UX | 60 → 72 | Checkout fixed; missing imagery now degrades to a deliberate branded placeholder everywhere instead of empty boxes. Real photography still absent |
| Security | 15 → 78 | Server-enforced admin auth (API routes guard themselves, not just the proxy); server-side repricing blocks payload tampering; order lookup needs reference + phone; 0 production CVEs. Payments remain a stub |
| Performance | 70 → 80 | All 26 product pages and 5 category pages now pre-rendered (SSG) rather than server-rendered per request; 52 unused packages removed |
| Database | 0 → 80 | PostgreSQL via Docker, Prisma schema with FKs/indexes/constraints, versioned migrations, idempotent seed, one-command setup. No backups or hosted instance yet |
| Testing | 0 → 52 | 60 tests over cart, shipping, analytics, session security and the DB mapping layer, verified to catch injected regressions. No component, API-integration or E2E coverage yet |
| SEO | 10 → 70 | Per-page metadata, canonicals, OG/Twitter, Product JSON-LD, sitemap, robots. Unknown categories now return a real 404 |
| Accessibility | 55 → 65 | Icon-button labelling made consistent; still not audited end-to-end with a screen reader |
| Infrastructure | 0 → 55 | Dockerised Postgres with healthcheck, one-command setup script, CI gating lint/typecheck/test/build/audit, Node pinned. Builds without a DB so build and runtime envs can differ. Nothing deployed yet |
| Observability | 0 | Nothing installed |
| Monetization | 20 | Sound model on paper, non-functional payment path in practice |
| Legal/trust | 5 | No policy pages at all |
| Scalability | 30 | Fine for a demo; architecturally incapable of serving real concurrent customers |

**Overall (2026-10-04): the blocking architectural flaw is resolved.** Maison now has a real PostgreSQL database (Docker + Prisma 7), and **an order placed by a customer reaches the shop owner** — verified by placing an order from one client and reading it back from the admin API in another. Orders, products, variants and stock are persisted server-side; carts and wishlists correctly remain per-browser.

What that leaves before launch is no longer architectural, it's commercial: **card payments are still a stub** (COD is safe to launch), there is **no product photography**, and there are **no legal pages**. CMS content and store settings are the last two things still held in browser storage.

---

## S. Priority Matrix

| Priority | Problem | Impact | Effort | Area | Recommendation |
|---|---|---|---|---|---|
| P0 | Checkout crashes on every successful order (F-2) | Blocks 100% of revenue | Low (move one `useEffect` above the early return) | Correctness | Fix immediately, before anything else |
| P0 | Admin panel has zero real access control (F-3) | Full data/business exposure | Low–Medium (needs real server-side auth) | Security | See Security Audit S-1 |
| P0 | No backend — orders/admin data are per-browser only | Store cannot function for a second real customer | High | Architecture | Launch Plan Phase 1 |
| P0 | Payment is a stub that always "succeeds" | Financial/legal exposure if shipped as-is | Medium | Security/Correctness | Gate card payments behind a real CMI integration; COD can launch first |
| P1 | All 26 product images 404 (F-1) | Kills the luxury positioning entirely | Medium (need real photography + upload) | Product/UX | Block traffic until resolved |
| P1 | No legal pages | Compliance exposure | Low–Medium | Legal | Draft + lawyer review |
| P1 | No error/not-found/loading boundaries | Any bug becomes a blank page | Low | UX/Correctness | Add standard Next.js files |
| P1 | Node version mismatch breaks local/CI builds (F-5) | Blocks all future work until fixed | Low | Infra | Upgrade Node, add `engines`/`.nvmrc` |
| P2 | 5 high-severity npm audit findings (F-4) | Supply-chain risk | Low–Medium | Security | Controlled `next` upgrade + regression pass |
| P2 | No SEO metadata/sitemap/robots | Zero organic discoverability | Low | SEO | `generateMetadata`, `app/sitemap.ts`, `app/robots.ts` |
| P2 | Hydration-gate pattern duplicated 12x | Maintenance debt, lint noise | Low | Code quality | Extract one `useHydrated()` hook |
| P2 | No CI/tests | No safety net for future changes | Medium | Testing | Launch Plan Phase 5 |
| P3 | Unused 3D dependencies (F-7) | Install/CI time only | Trivial | Dependencies | Remove or actually use |
| P3 | Newsletter signup / social links are non-functional placeholders | Minor trust/conversion loss | Low | Product | Wire to a real provider or remove |
| P3 | Workspace-root lockfile warning (F-8) | Cosmetic today | Trivial | Infra | Set `turbopack.root` |

---

*Companion documents: [MAISON_SECURITY_AUDIT.md](MAISON_SECURITY_AUDIT.md) · [MAISON_LAUNCH_PLAN.md](MAISON_LAUNCH_PLAN.md) · [MAISON_DEPLOYMENT_GUIDE.md](MAISON_DEPLOYMENT_GUIDE.md)*
