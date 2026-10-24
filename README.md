# Maison

Parfumerie and cosmetics storefront for the Moroccan market (French UI, MAD pricing,
cash-on-delivery first), with an admin back-office at `/admin`.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · PostgreSQL via Prisma 7.

---

## Requirements

- **Node.js ≥ 20.9** (see `.nvmrc`; Next.js 16 refuses to build on older versions)
- **Docker** — runs the Postgres database locally

## Getting started

```bash
npm install
./scripts/db-setup.sh   # starts Postgres, applies migrations, seeds the catalogue
npm run dev
```

`db-setup.sh` is idempotent — re-run it any time. It starts the container, waits for
Postgres to actually accept connections, writes `DATABASE_URL` into `.env.local` if it
isn't already there, then migrates and seeds.

The app runs at http://localhost:3000.

### Admin access

`/admin` is protected server-side. Credentials come from `.env.local`:

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Email used to sign in |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the password — never the plaintext |
| `SESSION_SECRET` | Signs the session cookie |

Generate a new password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
```

> **Escape every `$` as `\$` in `.env.local`.** Next.js's env loader performs
> shell-style `$VAR` interpolation, which silently corrupts bcrypt hashes
> (`$2b$12$...`) into unusable garbage. This fails as "wrong password" with no
> other symptom.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm test` | Unit tests (Vitest) — no database needed |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:setup` | Start Postgres, migrate, seed |
| `npm run db:reset` | Same, but destroys the volume first (**deletes local data**) |
| `npm run db:stop` | Stop the container (data is preserved) |
| `npm run db:studio` | Prisma Studio — browse the database |
| `npm run db:migrate` | Create a migration after editing `prisma/schema.prisma` |

## Architecture

```
Browser
  ├─ Storefront (mostly SSG; product and category pages pre-rendered)
  ├─ Cart + wishlist          → localStorage (correctly per-browser)
  └─ fetch
        ↓
  Route handlers (src/app/api/*)
        ↓
  Prisma 7 + pg driver adapter  →  PostgreSQL (Docker)
```

**Orders, products and stock live in Postgres.** Cart and wishlist remain in the
browser, which is where they belong.

Notes on the data layer:

- `prisma/schema.prisma` has no `url` — Prisma 7 moved it to `prisma.config.ts`, and
  the runtime connects through a driver adapter (`src/lib/server/db.ts`).
- The database uses `SCREAMING_CASE` enums and a flat address; the app's domain types
  use lowercase unions and a nested `shippingAddress`. `src/lib/server/mappers.ts`
  converts between them so components keep the types they already expected.

### Theme

Dark "futuristic luxury": near-black with a violet cast, brand gold as the primary
accent, iridescent cyan/violet secondaries, glass surfaces and glow. The tokens live in
`src/app/globals.css` — `graphite`/`obsidian`/`quartz` always described dark materials
and now hold the dark values they were named for, which is why most components restyled
without being edited.

Shared utilities worth knowing: `glass-surface`, `panel-edge`, `ring-iridescent`,
`aurora`, `grid-veil`, `rule-fade`, `glow-amber`. The admin keeps its own palette and
is unaffected.

### Product photography

Stock photos come from Unsplash's CDN and are declared in
`src/lib/data/product-images.ts`, pooled by category and cycled by position so
neighbouring products in a grid never repeat.

**Every id in that file was fetched and confirmed to return `200 image/jpeg` before
being committed.** Add nothing without checking it first — a dead id silently recreates
the "every product image 404s" bug these replaced.

```bash
npx tsx scripts/backfill-product-images.ts          # fill in missing/broken only
npx tsx scripts/backfill-product-images.ts --force  # reassign everything
```

`next.config.ts` allowlists `images.unsplash.com` only; the optimizer returns 400 for
any other host, which keeps it from being used as an open proxy.

These are generic fragrance/cosmetics photographs, **not** the actual branded products.
Real photography must come from the brands before launch.

### Security notes

- `/admin/*` pages are gated in `src/proxy.ts`. That matcher does **not** cover
  `/api/*`, so every admin route calls `isAdminRequest()` itself.
- `POST /api/orders` accepts only product/variant ids and quantities. Prices are read
  from the database and the basket repriced server-side, so a tampered payload cannot
  change what is charged. Stock is decremented in the same transaction with a
  conditional update, so two orders can't both take the last unit.
- `POST /api/orders/lookup` requires the order reference **and** the phone it was
  placed with, returning one generic message either way, so references can't be
  enumerated.

## Still outstanding

- **Card payments are a stub.** `src/lib/adapters/payment.ts` never contacts a gateway.
  Launch cash-on-delivery only until CMI is integrated.
- **No customer accounts.** `/compte` points customers at order tracking rather than
  offering a sign-in that authenticates nobody.
- **No product photography.** Every image path 404s; the UI falls back to a branded
  placeholder.
- **CMS content and store settings** are still browser-local, so edits don't reach
  other devices. Orders, products and stock have already moved to the database.

See `MAISON_PRODUCTION_AUDIT.md`, `MAISON_SECURITY_AUDIT.md` and
`MAISON_LAUNCH_PLAN.md` for the full picture.
