# MAISON — Security Audit

**Date:** 2026-09-05 · **Last updated:** 2026-09-24
**Method:** Source review of every auth/data-boundary file, `npm audit`, dependency-secret grep, and **live exploitation** of the two headline findings in a real browser against a real `next dev` build (Node 22) — not theoretical.

> ## Remediation status — 2026-09-24
>
> **Fixed and re-verified live:** S-1 (admin auth is now server-enforced; the documented
> `localStorage` exploit was re-run against the fix and no longer grants access), S-2
> (checkout crash), S-5 (dependency vulnerabilities — `npm audit` now reports 0, including
> a *newly disclosed* critical unauthenticated RCE in Next.js ≤16.3.2 that was not present
> at the time of the original audit), S-6 (security headers), S-7 (login rate limiting),
> S-8 (order IDs), S-9 (`.env.example` + secret handling), S-11 (dependency scanning in CI).
>
> **Still open — needs decisions or a backend, not code:** S-3 (card payments remain a
> stub; COD-only is safe to launch), S-4 (customer accounts are still fake — no backend
> exists to authenticate against), S-10 (placeholder social links).
>
> The findings below are preserved as originally written, with per-finding status added.

**Top-line context:** MAISON currently has no server, no database, and no real session model — everything is client-side Zustand state persisted to `localStorage`. This changes what "security" means here: there is no SQL injection surface (no SQL), no server-side IDOR in the traditional sense (no server), and no session-fixation risk (no sessions). But it also means the *access control that does exist is entirely cosmetic* — it's JavaScript in the visitor's own browser, which the visitor fully controls. That is the through-line of every Critical/High finding below.

---

## 🔴 CRITICAL

### S-1. Admin panel has no real access control — verified full bypass with zero credentials

- **Location:** `src/lib/store/admin-auth.ts`, `src/app/admin/layout.tsx`, `src/app/admin/login/page.tsx`
- **Vulnerability:** Admin "authentication" is a client-side Zustand store. The credential check is a literal string comparison in code shipped to every visitor's browser:
  ```ts
  if (email === 'admin@maison.ma' && password === 'admin123') { ... }
  ```
  The login page even prints this credential in plaintext under the form: *"Demo: admin@maison.ma / admin123"*. Route protection in `admin/layout.tsx` is a `useEffect` that redirects to `/admin/login` if `isAuthenticated` is `false` — a client-side check, not a server-side one.
- **Impact:** Complete, unauthenticated access to the entire admin surface: orders, customer PII (name, phone, address), revenue figures, product CRUD, and CMS content editing. Since there's no server, there's no way to "just" leak data — an attacker with admin UI access has the same capability as the real store owner.
- **Exploit scenario (verified live, 2026-09-05):** Opened the storefront in a browser with no prior login. Ran one line in the DevTools console:
  ```js
  localStorage.setItem('maison-admin-auth', JSON.stringify({
    state: { isAuthenticated: true, adminUser: { id: 'admin-1', name: 'Administrateur', email: 'hacker@evil.com', role: 'admin' } },
    version: 0
  }));
  location.href = '/admin';
  ```
  Navigated to `/admin` and landed directly on the full dashboard (revenue: 34 895 MAD, 21 orders, 19 active clients) with zero knowledge of any password. No network request was involved — this is not even really an "attack," it's using the app exactly as its own code allows. A curious visitor doesn't even need this: the real password is printed on the login screen itself.
- **Recommended fix:** This cannot be patched — it requires the architectural fix in Launch Plan Phase 0/1: move admin auth to the server (a real backend + session, e.g. NextAuth/Auth.js or Supabase Auth with a role check enforced in middleware/server components, never in a client Zustand store), hash and store the admin credential server-side, and gate every admin data read/write through server-side authorization, not a client-side redirect. Until that exists, **do not put any real business data behind `/admin`** — anything placed there today is exposed to any visitor.
- **Priority:** P0 — blocks launch entirely.

### S-2. Checkout crashes on every successful order (correctness bug with a security-adjacent consequence)

- **Location:** `src/app/checkout/page.tsx:131` (a `useEffect` called after an early `return` at line 116)
- **Vulnerability:** Rules-of-Hooks violation. When `setSuccessOrderId()` fires after a successful payment, the component's early-return branch changes which hooks run, and React throws `Uncaught Error: Rendered fewer hooks than expected.`
- **Impact:** Not a data-exposure issue, but flagged here because it directly enables S-3/S-4 below (customers cannot complete or verify orders, so any silent payment-processing issue is invisible to them) and because it is the top business-continuity risk in the app. See `MAISON_PRODUCTION_AUDIT.md` F-2 for the full reproduction.
- **Priority:** P0 — fix before anything else ships.

### S-3. Payment adapter always reports success — no real money changes hands for "card" orders

- **Location:** `src/lib/adapters/payment.ts`
- **Vulnerability:** `processPayment()` for `paymentMethod === 'card'` returns `{ success: true, transactionId: 'CARD-'+Date.now() }` unconditionally — there is no card data capture, no gateway call, nothing. The code comments make clear this is intentional scaffolding for a future CMI integration, not a bug someone introduced by accident.
- **Impact:** If this were deployed as-is with the "Carte bancaire" option visible to customers (it currently is, in the checkout UI), the store would accept and fulfill "paid" orders for which no payment was ever actually collected — a direct financial loss, and depending on how it's presented, a consumer-protection/fraud concern.
- **Exploit scenario:** Any customer selects "Carte bancaire," enters no real payment details (none are even requested), and the order is marked paid.
- **Recommended fix:** Either hide the card option entirely until CMI is integrated (COD can launch alone — it's the dominant Moroccan payment method anyway), or integrate CMI server-side before enabling it. Never process real "card" orders through a client-side-only stub.
- **Priority:** P0 if card payment is customer-facing before a gateway exists; N/A if COD-only for initial launch.

---

## 🟠 HIGH

### S-4. Customer "login" accepts any credentials and can reveal other customers' order history

- **Location:** `src/app/compte/page.tsx`
- **Vulnerability:** `handleLogin` sets `isLoggedIn = true` unconditionally, regardless of what's typed. Worse, the order list shown is *all* orders in the local store unless the visitor also happens to type a phone number that matches — the code's own comment says `// show all orders in demo mode`.
- **Impact:** In the current architecture (single browser, no shared backend), this can't leak a *different person's* data across devices — but the pattern itself is the exact shape of an IDOR, and it is currently live code, not a mockup comment. If a naive backend is bolted onto this exact client logic later (e.g., an API that returns "all orders" and lets the client filter), it becomes a real cross-customer data leak the moment two real customers share infrastructure.
- **Recommended fix:** When real customer accounts are built (Launch Plan Phase 1), authorization must happen server-side (`WHERE customer_id = :authenticated_user_id`), never as a client-side filter over a full dataset the client already received.
- **Priority:** P1 — must be designed correctly from the start of the real-backend work, not patched after.

### S-5. `npm audit`: 5 high-severity vulnerabilities in transitive dependencies

- **Location:** `postcss` (bundled via `next`), `sharp` (bundled via `next`'s image optimizer)
- **Vulnerability:** PostCSS XSS-via-unescaped-`</style>` (GHSA-qx2v-qp2m-jg93) and multiple source-map path-traversal/info-disclosure advisories; `sharp`'s bundled `libvips` has known CVEs (2026-33327/33328/35590/35591).
- **Impact:** These are build-time/server-side tooling paths (CSS processing, image transformation), not directly attacker-reachable from the public site today in an obvious way, but they should not be left unpatched, especially once `next/image` is serving user-relevant traffic.
- **Recommended fix:** `npm audit fix --force` resolves them but upgrades `next` to `16.3.4`, outside the currently-pinned range — do this as a deliberate, tested upgrade (full regression pass, not a blind `--force` in CI).
- **Priority:** P1.

### S-6. No security headers configured

- **Location:** `next.config.ts` (currently empty defaults)
- **Vulnerability:** No CSP, no `Strict-Transport-Security`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`, no explicit frame protection (`X-Frame-Options`/`frame-ancestors`).
- **Impact:** Increases blast radius of any future XSS or clickjacking attempt; no defense-in-depth currently exists beyond React's default JSX escaping (which is intact — no `dangerouslySetInnerHTML` was found anywhere in `src/`).
- **Recommended fix:** Add a `headers()` function in `next.config.ts` (or middleware) setting at minimum: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restricting camera/mic/geolocation, and `frame-ancestors 'none'` unless embedding is needed. A CSP can be added incrementally starting in report-only mode once real third-party scripts (analytics, payment SDK) are known.
- **Priority:** P1, cheap to fix, do it alongside the deployment setup (Launch Plan Phase 6).

---

## 🟡 MEDIUM

### S-7. No rate limiting or brute-force protection (not yet applicable, but must ship with the backend)

- **Location:** N/A today (no server endpoints exist to rate-limit)
- **Vulnerability:** The moment a real login endpoint (admin or customer) exists, it needs throttling — today's client-only "auth" has no concept of failed-attempt tracking at all.
- **Recommended fix:** When building real auth (Phase 1), add rate limiting on login/password-reset endpoints (e.g., Upstash Redis + a sliding window, or your auth provider's built-in throttling) and generic error messages that don't reveal whether an email exists (avoid account enumeration).
- **Priority:** P2 — bundle into the auth build-out, not a standalone task.

### S-8. Order IDs are not collision-resistant

- **Location:** `src/app/checkout/page.tsx` — `` `ORD-${Math.floor(Math.random() * 1000000)}` ``
- **Vulnerability:** `Math.random()` is not cryptographically secure and the ID space (1M values) will collide at realistic order volumes (birthday-paradox collision becomes non-trivial well under 1,000 orders).
- **Impact:** Order ID collisions could let one customer's order-tracking lookup return another's order once a real backend exists with a lookup-by-ID feature (`suivi-commande`).
- **Recommended fix:** Use a database-generated ID (UUID or sequential PK) once a real backend exists; never derive customer-facing identifiers from `Math.random()`.
- **Priority:** P2 — resolves naturally once Phase 1 (real database) lands.

### S-9. No `.env` / secrets hygiene established yet

- **Location:** repo root
- **Finding:** No secrets are currently committed (verified — grepped for API keys, tokens, `sk_live`/`pk_live`, AWS-style keys; nothing found beyond the intentionally-fake demo password). This is good, but there is also *no* `.env.example`, no documented separation of public vs. server-only vs. secret variables, because none are needed yet.
- **Recommended fix:** As real integrations are added (Launch Plan Phase 1+), maintain a `.env.example` with every variable name and no real values, and strictly prefix client-exposed variables with `NEXT_PUBLIC_` — never put a payment/database secret behind that prefix. Full checklist in `MAISON_DEPLOYMENT_GUIDE.md`.
- **Priority:** P2 — process to establish now, before secrets exist, not after.

---

## 🟢 LOW

### S-10. Placeholder social/contact links

- **Location:** `Footer.tsx` — Instagram/Facebook links are `href="#"`.
- **Impact:** No security impact; minor trust/UX issue. Noted here only because unresolved `#` links are sometimes mistaken for tracking pixels or dead click-jacking targets during a review — confirmed they are inert.
- **Priority:** P3.

### S-11. No dependency-scanning automation

- **Finding:** `npm audit` was run manually for this report; there is no CI to run it automatically on every change.
- **Recommended fix:** Add `npm audit --audit-level=high` (or Dependabot/Snyk) as a required CI check (Launch Plan Phase 5/6).
- **Priority:** P3.

---

## Data Privacy Notes

MAISON collects, at checkout: first/last name, phone number, city, and street address (no email required for guest checkout). This is a reasonable, minimal data footprint for order fulfillment — no unnecessary PII is being requested. The `compte` page's phone-based customer matching is currently harmless (all client-side, one browser) but must not become the sole authorization mechanism once real accounts exist (see S-4). No personal data currently reaches any third party, because no third party is integrated yet — this will need re-review the moment analytics, a payment gateway, or a shipping API are added, specifically for what fields (phone, address) get sent to each.

---

## Summary Table

| ID | Finding | Severity | Status (2026-09-24) |
|---|---|---|---|
| S-1 | Admin panel fully bypassable, no real auth | 🔴 CRITICAL | ✅ **Fixed** — bcrypt + HMAC-signed httpOnly session, enforced in `src/proxy.ts`; exploit re-run and now fails |
| S-2 | Checkout crashes on success | 🔴 CRITICAL | ✅ **Fixed** — hook order corrected; order completion re-verified live |
| S-3 | Card payments never actually charged | 🔴 CRITICAL | ⛔ **Open** — needs a CMI merchant account. Launch COD-only until then |
| S-4 | Customer login accepts anything / shows all orders | 🟠 HIGH | ⛔ **Open** — needs a backend to authenticate against (Launch Plan Phase 1) |
| S-5 | Dependency vulnerabilities | 🟠 HIGH | ✅ **Fixed** — `npm audit` reports 0; included a critical Next.js RCE disclosed after the original audit |
| S-6 | No security headers | 🟠 HIGH | ✅ **Fixed** — HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy; `x-powered-by` disabled |
| S-7 | No rate limiting | 🟡 MEDIUM | ✅ **Fixed** for the login endpoint (in-memory, per-instance). Move to a shared store when running multi-instance |
| S-8 | Non-collision-resistant order IDs | 🟡 MEDIUM | ✅ **Fixed** — `crypto.randomUUID()`-derived |
| S-9 | No secrets process established | 🟡 MEDIUM | ✅ **Fixed** — `.env.example` documents every variable, including the `$`-escaping gotcha that silently corrupts bcrypt hashes |
| S-10 | Placeholder social links | 🟢 LOW | ⛔ **Open** — needs the real profile URLs |
| S-11 | No automated dependency scanning | 🟢 LOW | ✅ **Fixed** — `npm audit --audit-level=high` runs in CI |

### Regression cover

The session layer now has tests (`src/lib/server/session.test.ts`) asserting that a
tampered payload, a token signed with a different secret, an expired token, and malformed
input are all rejected. These were confirmed to fail against deliberately broken code, so
they genuinely guard S-1 rather than passing vacuously.

*See [MAISON_PRODUCTION_AUDIT.md](MAISON_PRODUCTION_AUDIT.md) for full functional context and [MAISON_LAUNCH_PLAN.md](MAISON_LAUNCH_PLAN.md) for how these get fixed.*
