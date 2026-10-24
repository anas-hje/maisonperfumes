# Claude Code prompt — Moroccan luxury parfumerie & cosmetics e-commerce site

Paste everything inside the fenced block below as your first message to Claude Code, in a fresh project folder. After phase 1 (the design plan), stop and review before letting it continue — that's the checkpoint most worth your time, since everything downstream depends on getting the visual direction right first.

---

```
I'm building [Maison — replace with your brand name], a Moroccan online parfumerie and cosmetics retailer. Design and build a complete, production-quality e-commerce website from scratch.

CONTEXT
- Market: Morocco. Primary language French, currency MAD. Cash on delivery is the dominant payment method nationally; card payment (via a gateway like CMI) is secondary — design checkout COD-first.
- Categories: parfums (homme, femme, niche, décants, coffrets), cosmétiques (teint, yeux, lèvres, sourcils, ongles), soin visage, corps & bain, cheveux.
- Most products are variable: perfumes vary by volume (50ml / 100ml / etc.) with a different price per volume; cosmetics vary by shade/reference. Every product needs independent price and stock per variant.

DESIGN DIRECTION
Before writing any code, work out a short design plan and show it to me: a 4-6 color palette (named, with hex values), two typefaces with defined roles (a characterful display face used with restraint, a clean body face), a one-paragraph layout concept, and one signature element — the single thing this site will be remembered for.

Ground the look in the actual material world of perfume, not generic "futuristic UI": light through glass and liquid, refraction, precision, atomization. Avoid anything that reads as a generic AI-generated site — specifically avoid (a) a warm cream background with a high-contrast serif and a terracotta/clay accent, (b) a plain near-black background with one single bright neon accent color, (c) a broadsheet newspaper layout with hairline rules and zero border-radius. A futurist maison de parfum can be dark and precise without collapsing into flat neon-on-black — consider a near-black or deep charcoal/graphite base with two or three considered accent tones pulled from the products themselves (amber, brass, smoked glass), used with intention, with glass/refraction material effects doing the actual "futurist" work rather than color alone.

Spend your boldest design decision on ONE signature moment — this should be the interactive 3D product viewer. Keep typography, spacing, and everything else around it disciplined and quiet so the signature element stands out. Motion should be deliberate (one orchestrated hero sequence, considered micro-interactions on add-to-cart and variant selection) rather than animating everything.

3D REQUIREMENTS
- Hero section: an interactive 3D perfume bottle (React Three Fiber) that rotates on drag/scroll, with a realistic glass material (transmission/refraction, not flat-shaded) and studio environment lighting.
- Product detail pages: the same style of 3D viewer per product, built procedurally (lathe/extrude geometry for bottle silhouettes + MeshPhysicalMaterial or drei's MeshTransmissionMaterial) so it doesn't depend on external 3D asset files.
- Lazy-load the 3D canvas and provide a static high-quality image fallback for low-power devices — don't let 3D tank mobile performance or block first paint.

TECH STACK
- Next.js (App Router) + TypeScript, Tailwind CSS
- React Three Fiber + drei for 3D, Framer Motion for animation
- Cart/checkout state in Zustand or React context
- Data layer: a typed local product dataset structured exactly like a real commerce API response, so the whole site is fully functional and demoable with zero setup — but write the data-fetching layer as swappable adapters, so plugging in a real backend later (Shopify Storefront API, or Postgres) means rewriting one file, not the app. Same pattern for payment (stub a CMI adapter) and shipping (stub a Sendit adapter), clearly marked with TODO comments and documented in the README.

FUNCTIONALITY
- Home: hero (3D), featured categories, best sellers, active promotions, trust bar (delivery / support / guarantee)
- Category and subcategory pages with filters (brand, gender, price, volume) and sorting
- Product detail: variant selector with independent price/stock, image gallery + 3D viewer, sale badge, add to cart, related products
- Persistent cart with editable quantities
- Checkout: COD as the default flow (name, phone, city, address); card payment as a secondary option behind the CMI stub
- Minimal account area: order history, saved address (mock auth is fine)
- Search with live filtering, wishlist
- Fully responsive and mobile-first — most e-commerce traffic in this market is mobile

DATA
Seed 20-30 realistic sample products spread across every category so the site is fully browsable immediately.

PROCESS
Work in phases and check in with me after each:
1. Design plan (palette, type, layout concept, signature element) — show me before building anything
2. Scaffold + design system + layout shell
3. Product data layer + catalog/category pages
4. Product detail page + 3D viewer
5. Cart + checkout flow
6. Home page, polish, and motion pass

DEFINITION OF DONE
- `npm run dev` runs with no setup, and the full flow — browse, pick a variant, add to cart, checkout — works end to end on the seed data
- Nothing looks like an unstyled default component library
- Mobile Lighthouse performance isn't wrecked by the 3D scene
- Keyboard focus is visible everywhere, and reduced motion is respected
```

---

## Using this

- Run `claude` inside an empty project folder and paste the block above as your opening message.
- The design plan (phase 1) is the one checkpoint worth actually reading closely — if the palette or signature element feels generic, say so and ask for a second pass before any code gets written. It's far cheaper to redirect there than after the build.
- Swap `[Maison — replace with your brand name]` for your actual name before pasting, or ask Claude Code to propose 2-3 name options as part of phase 1.
- When you're ready to go from demo to live: the CMI, Sendit, and Shopify adapter stubs are where your real credentials plug in — that's the point where the earlier automation strategy (Apify sourcing, n8n order routing) connects to this frontend.
