# MAISON — Deployment Guide

Recommendations here are scoped to what MAISON's actual architecture needs (per `MAISON_PRODUCTION_AUDIT.md`) — a single-region Next.js storefront + admin panel for one store, Morocco-first. No microservices, no Kubernetes, no multi-region complexity: none of that is justified by this product's scale.

---

## Phase 1 — Domain

- Register through a mainstream registrar (Namecheap, Google Domains successor, or a Moroccan registrar like `.ma` via ANRT-accredited providers if a `.ma` TLD matters for local trust — worth considering for a Morocco-only luxury brand, alongside a `.com`).
- Enable WHOIS privacy and auto-renewal; lock the domain (registrar transfer lock) to prevent hijacking.
- Point DNS at your host once chosen (below) — Vercel's own nameservers or your registrar's DNS both work; Vercel's are simplest if this is the only property on the domain.

## Phase 2 — Production services

Based on what's actually missing (per the audit — no DB, no auth, no payments, no email, no monitoring):

| Need | Recommendation | Why |
|---|---|---|
| Frontend/app hosting | **Vercel** | Built by the Next.js team; zero-config App Router support, matches the existing `next build` output exactly; generous free tier for a launch-stage single store |
| Database | **Supabase** (managed Postgres) | Gives you Postgres + built-in Auth + Storage in one product — directly closes three gaps at once (DB, auth, image uploads) with minimal moving parts. Neon is a fine alternative if you want Postgres only and a separate auth solution |
| Auth | **Supabase Auth** (if using Supabase) or **Auth.js (NextAuth)** against your own Postgres | Either avoids hand-rolling password hashing/session management — don't build this yourself |
| Payments | **CMI** (Centre Monétique Interbancaire) | Already anticipated by `src/lib/adapters/payment.ts`'s own TODO comments — this is the standard Moroccan card gateway; COD needs no gateway at all and can launch first |
| Shipping | **Sendit** (or continue with the static city-cost table already in `shippingAdapter` if you don't need live carrier rates yet) | Already anticipated by the adapter's TODO |
| Object storage (product images) | **Supabase Storage** (bundled) or Vercel Blob | For admin-uploaded product photos |
| Transactional email (order confirmations, password reset) | **Resend** | Simple API, generous free tier, good Next.js integration examples |
| Error tracking | **Sentry** | Would have caught F-2 (the checkout crash) in production automatically, with a stack trace, the moment it first happened |
| Uptime monitoring | **Better Uptime** or **UptimeRobot** (free tier) | Pings the production URL, alerts on downtime |
| Analytics | **GA4** (free) or **Plausible** (privacy-friendlier, paid) | Either is fine; GA4 if you want free + standard e-commerce reporting |

This is deliberately the *simplest* stack that closes every gap — no self-hosted servers, no separate message queue, no cache layer needed at this scale.

## Phase 3 — Environment variables

Maintain a `.env.example` at the repo root (currently missing entirely) documenting every variable and its category, with no real values committed:

**Public (safe in client bundle, `NEXT_PUBLIC_` prefix):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_SITE_URL=
```

**Server-only (never prefixed with `NEXT_PUBLIC_`):**
```
DATABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SENTRY_DSN=
```

**Secrets (server-only, highest sensitivity — CMI credentials specifically, per the existing adapter's own TODO comments):**
```
CMI_MERCHANT_ID=
CMI_API_KEY=
CMI_SECRET=
NEXTAUTH_SECRET=   # if using Auth.js instead of Supabase Auth
```

Never commit real values for any of these. Store production values only in Vercel's Environment Variables UI (or your host's equivalent), scoped separately for Production/Preview/Development. Rotate immediately if any value is ever accidentally committed — do not just remove it from a future commit, since git history retains it; rotate the credential at the provider.

## Phase 4 — Database

1. Create the production Postgres instance in Supabase (or Neon).
2. Write migrations (Prisma or Drizzle — either works well with Next.js; Prisma has the gentler learning curve, Drizzle is lighter-weight) modeling the schema already implied by `src/lib/types.ts`.
3. Seed initial data from the existing `src/lib/data/products.ts`/`categories.ts` — this can be a one-time migration script, not hand-entry.
4. Add indexes: `Product.slug` (unique), `Order.createdAt`, `Order.customerId` (once real customer FKs replace phone-matching).
5. Enable automated daily backups (Supabase/Neon both offer this on paid tiers — confirm retention period meets your needs, e.g. 7–30 days).
6. Connect over SSL only; never expose the database's direct connection string to the client.

## Phase 5 — CI/CD

Recommended GitHub Actions pipeline (none exists today):

```
Pull Request
  → npm ci
  → npm run lint
  → npx tsc --noEmit
  → npm test (once Phase 5 of the Launch Plan adds tests)
  → npm audit --audit-level=high
  → npm run build
  → (on merge to main) Vercel auto-deploys
  → smoke test against the deployed preview/production URL
```

Vercel's GitHub integration handles the build+deploy step automatically once connected — the GitHub Actions workflow only needs to own lint/typecheck/test/audit as required status checks before merge is allowed.

## Phase 6 — Domain connection

1. Add the domain in Vercel's project settings.
2. Vercel issues instructions for either nameserver delegation or a CNAME/A record — follow whichever it recommends for your registrar.
3. SSL is automatic and free via Vercel (Let's Encrypt) — no manual certificate work needed.
4. Confirm both `www` and apex domain resolve correctly, with one redirecting to the other (pick one as canonical).

## Phase 7 — Production verification (pre-launch smoke test)

Before pointing real traffic at the domain, manually verify in the deployed production environment (not just locally):
- Full checkout flow completes without crashing (this is F-2 — verify the fix actually shipped)
- Admin login is enforced server-side (attempt the Security Audit's S-1 bypass against production — confirm it fails)
- A test order placed on one device appears in the admin panel on a different device
- COD order confirmation email/SMS (if implemented) actually arrives
- Security headers present (`curl -I https://yourdomain.com`)
- `sitemap.xml` and `robots.txt` are reachable and correct
- Error tracking receives a deliberately-triggered test error

---

*See `MAISON_LAUNCH_PLAN.md` for the phase ordering that gets you to this point, and `MAISON_SECURITY_AUDIT.md` for what each hardening step above is closing.*
