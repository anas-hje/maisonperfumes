# MAISON — Launch Plan

Grounded in `MAISON_PRODUCTION_AUDIT.md` and `MAISON_SECURITY_AUDIT.md`. Read those first — this document assumes their findings.

**Framing:** MAISON is a polished frontend prototype with no backend. The plan below is ordered so the single highest-leverage piece of work — a real backend — comes early, because it's the prerequisite for fixing security (S-1), making orders real (F-2's fix is trivial and independent, done first), and everything downstream (testing, monitoring, SEO of dynamic content). Phases are sequential but not all-or-nothing; each phase lists what can ship independently.

---

## Phase 0 — Critical blockers (before anyone else touches the site)

**Objective:** Stop the two things that make the site actively unsafe or non-functional to demo, even internally.

| Task | Files | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Fix checkout Rules-of-Hooks crash | `src/app/checkout/page.tsx` | none | Move the `useEffect` (currently line 131) above the `if (successOrderId) return (...)` block (currently line 116) so all hooks run unconditionally on every render | Re-run the exact repro: add item → checkout → submit → confirm the success screen renders instead of crashing; `npx eslint src/app/checkout/page.tsx` shows no `rules-of-hooks` error |
| Upgrade local/CI Node to ≥20.9 | `package.json` (`engines`), `.nvmrc`, dev machine | none | `npm run build` succeeds without a Node-version error on a clean checkout | `node --version` ≥ 20.9; `npm run build` exits 0 |
| Remove/hide the "Carte bancaire" option until a real gateway exists | `src/app/checkout/page.tsx`, `src/lib/adapters/payment.ts` | none | Only COD is selectable at checkout; card option returns once S-3 is resolved in Phase 3/6 | Manually confirm checkout only offers COD |

---

## Phase 1 — Core product correctness: build the backend that doesn't exist

**Objective:** Give the app a real, shared source of truth so admin and customers aren't isolated to their own browsers. This is the biggest single phase and unlocks nearly everything else.

| Task | Files/scope | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Choose and provision a database | new: Prisma/Drizzle schema, migrations | Decide Postgres provider (Supabase/Neon — see Deployment Guide) | Schema for `Product`, `Variant`, `Order`, `OrderItem`, `Customer`, `CmsContent`, `Settings` mirroring `src/lib/types.ts` | Migrations run cleanly against a fresh DB |
| Build API/server-action layer | new: `src/app/api/**/route.ts` or server actions | DB provisioned | CRUD endpoints for products, orders, customers, CMS content, settings — replacing what Zustand stores currently fake | Manual Postman/curl pass per endpoint; auth-gated writes reject unauthenticated calls |
| Real customer auth | new: NextAuth/Auth.js or Supabase Auth | DB provisioned | Real signup/login/logout/password-reset for customers; `compte` page reads the authenticated user's own orders only (server-side filter, not client) | Two test accounts each see only their own orders |
| Real admin auth | same auth provider, role-gated | Real auth in place | Admin routes protected by server-side session + role check (middleware or server component), not the current Zustand store | Attempt the S-1 bypass again post-fix — confirm it no longer works; unauthenticated `/admin/*` requests redirect or 401/403 server-side |
| Migrate adapters from stub/local to real | `src/lib/adapters/product-source.ts`, `admin-*` stores | API layer exists | Product/order/CMS data reads and writes go through the API, not `localStorage`; existing adapter interfaces (`ProductAdapter`, etc.) mean this is a swap, not a rewrite | Place an order in one browser, confirm it appears in `/admin/commandes` opened in a *different* browser/profile |
| Collision-safe order IDs | wherever orders are created | DB in place | Use DB-generated UUID/sequential ID instead of `Math.random()` | New orders have unique, non-guessable IDs |

---

## Phase 2 — UI/UX polish

**Objective:** Make the product feel finished and trustworthy, now that data is real.

| Task | Files | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Real product photography | `public/images/products/`, `src/lib/data/products.ts` (or DB once migrated) | none (can start immediately, in parallel with Phase 1) | All 26+ product images load; no 400s from `/_next/image` | Visual pass through catalog + browser console shows zero image errors |
| Add `error.tsx`, `not-found.tsx`, `loading.tsx` | `src/app/**` | none | Branded fallback UI instead of blank pages on any future bug | Manually trigger a thrown error in dev, confirm branded boundary renders |
| Mobile pass at 320/375/390/430/768/1024+ | all pages | Phase 0 checkout fix (so the full flow is testable) | No layout breakage at any width; WhatsApp button doesn't overlap cart/scroll controls | Resize/emulate each breakpoint, screenshot each key page |
| Wire newsletter signup + social links to something real | `Footer.tsx` | Pick an email provider (Phase 6) | Newsletter form actually subscribes; social icons link to real profiles or are removed | Submit form, confirm subscriber appears in provider dashboard |
| Extract shared `useHydrated()` hook | 12 files using the hydration-gate pattern | none | One hook, no `react-hooks/set-state-in-effect` warnings | `npx eslint .` — count drops to 0 for that rule |

---

## Phase 3 — Security hardening

**Objective:** Close S-1 through S-6 now that a real backend exists to enforce them against.

| Task | Files | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Confirm admin bypass is closed | `admin/**`, auth middleware | Phase 1 admin auth | Repeat the exact `localStorage` exploit from the Security Audit — it must fail | Manual re-test; also add an automated test for it (Phase 5) |
| Integrate real payment gateway (CMI) for card | `src/lib/adapters/payment.ts` | Phase 1 API layer, CMI merchant account | Card payments actually charge; COD remains available | Test transaction in CMI sandbox succeeds and reflects in order status |
| Add security headers | `next.config.ts` or `middleware.ts` | none | HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protection present | Check response headers via `curl -I` against deployed URL |
| Rate-limit auth endpoints | new auth routes | Phase 1 auth | Repeated failed logins throttled | Automated test hits endpoint 20x, confirms 429 after threshold |
| Resolve `npm audit` high findings | `package.json` | none | Controlled `next` upgrade, full regression pass | `npm audit --omit=dev` shows 0 high/critical |
| `.env.example` + secret separation documented | repo root | Phase 1 integrations known | Every env var documented, no secret has a `NEXT_PUBLIC_` prefix | Manual review against Deployment Guide checklist |

---

## Phase 4 — Performance

| Task | Files | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Move remaining `<img>` to `next/image` | `ProductImage.tsx`, `SearchOverlay.tsx`, admin order detail | Real images (Phase 2) | ESLint `no-img-element` warnings resolved | `npx eslint .` clean of that rule |
| Remove or implement `three`/`@react-three/*` | `package.json` | Product decision: is a 3D viewer planned? | Either dependency removed (`npm uninstall`) or a real feature ships using it | `npm ls three` reflects the decision; no dead weight left ambiguous |
| Set `turbopack.root` | `next.config.ts` | none | Workspace-root warning gone | `npm run build` output has no root-inference warning |
| Paginate product/order API responses | Phase 1 API routes | Phase 1 | No unbounded list queries once catalog/order volume grows | Load-test with 500+ seeded rows, confirm paged responses |

---

## Phase 5 — Testing

**Objective:** Build the safety net that currently doesn't exist at all.

| Task | Scope | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Unit tests for business logic | `analytics-helpers.ts`, cart/shipping calculations | none | Core math (totals, KPIs, shipping cost) covered | `npm test` passes, meaningful coverage on these files |
| Integration tests for API/DB | Phase 1 endpoints | Phase 1 | CRUD + auth-rejection paths covered | CI-runnable test suite green |
| E2E tests for critical journeys | signup, login, logout, password recovery, browse→checkout→confirmation, admin login, permission boundaries, account deletion | Phases 1–3 | Playwright/Cypress suite covers every flow listed in the original audit brief | Suite passes in CI headless |
| Regression test for S-1 and F-2 specifically | dedicated tests | Phases 0, 3 | Automated proof the two headline bugs stay fixed | Test fails loudly if either regresses |

---

## Phase 6 — Production infrastructure

Full detail in `MAISON_DEPLOYMENT_GUIDE.md`. Summary of what this phase provisions: hosting (Vercel), managed Postgres, auth provider, CMI payment account, transactional email, error tracking (Sentry), uptime monitoring, domain + DNS + SSL.

---

## Phase 7 — SEO / analytics

| Task | Files | Dependencies | Expected result | Verification |
|---|---|---|---|---|
| Per-page metadata | every `page.tsx` | Real product data (Phase 1) | `generateMetadata` per product/category with real title/description | View page source, confirm unique tags per route |
| `sitemap.ts` / `robots.ts` | `src/app/sitemap.ts`, `src/app/robots.ts` | Real routes/products known | Valid sitemap listing all public routes and products | `curl /sitemap.xml` validates |
| OG/Twitter cards | `layout.tsx` + per-page metadata | Real images (Phase 2) | Rich link previews on share | Test with a social-card debugger against the deployed URL |
| Structured data (Product/Offer JSON-LD) | product pages | Real product/price data | Valid JSON-LD per product | Google Rich Results Test passes |
| Install analytics | `layout.tsx` | Pick a provider (GA4 recommended) | `view_item`/`add_to_cart`/`begin_checkout`/`purchase` events firing | Real-time view in analytics dashboard during a manual test purchase |

---

## Phase 8 — Monetization

| Task | Dependencies | Expected result | Verification |
|---|---|---|---|
| Enable card payments in production (CMI live mode) | Phase 3 CMI integration proven in sandbox | Real card orders process and reconcile | First live transaction confirmed against CMI merchant dashboard |
| Confirm COD fee/free-shipping thresholds reflect real business economics | Admin settings, now backed by real DB | Shipping/payment config matches actual costs | Finance sign-off on the numbers currently hardcoded as demo defaults |

---

## Phase 9 — Launch

Domain connected, smoke tests run against production, monitoring active, rollback plan ready. Full checklist to be produced as `MAISON_LAUNCH_CHECKLIST.md` once Phases 0–6 are actually complete — producing it earlier would just be a wishlist, not a checklist.

---

## Phase 10 — Post-launch

Monitor error rates (Sentry), conversion funnel (analytics), and payment failure rate daily for the first two weeks. Revisit the Priority Matrix P2/P3 items (SEO depth, code-quality cleanup, unused dependencies) once real user feedback exists to prioritize against.

---

## What I'd actually do first, concretely

If you want a single next action rather than the full ten-phase view: **Phase 0's checkout fix is a five-line change with an already-verified repro** — I'd do that in the next session regardless of what else gets decided, since it costs almost nothing and unblocks testing everything downstream of it. Phase 1 (the real backend) is the one that needs your input before I start, because it involves account-level decisions (which DB/auth/payment provider, whether you already have a CMI merchant account) — see the Deployment Guide for the recommended defaults and what I'd need from you to proceed.
