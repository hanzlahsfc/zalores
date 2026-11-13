# Zalores

Premium sunglasses storefront — Next.js (App Router) + TypeScript, built as a
**static export** so it can be hosted anywhere: Hostinger shared hosting,
any static host, or a Node server.

It's designed to look and behave like a real Shopify OS 2.0 storefront:
announcement bar, predictive search, variant swatches, quantity selector,
buy-it-now, sticky add-to-cart, cart drawer with free-shipping progress and
order notes, express checkout buttons, BNPL line, payment badges, related
products, and a post-purchase upsell.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & deploy

```bash
npm run build      # static site emitted to ./out
```

- **Hostinger shared hosting:** upload the contents of `out/` to
  `public_html/` (trailing-slash export, works on Apache/LiteSpeed).
- **Git-based deploy (Hostinger or any host):** connect the repo; build
  command `npm run build`, publish directory `out`.

## Rebranding / new products

- Brand name, tagline, copy, socials, shipping threshold:
  **`lib/site.ts`** — one file.
- Catalog: **`lib/products.ts`** — products, colorway variants,
  collections. Every page, filter, cart line and checkout item is generated
  from it, so swapping sunglasses for different products is a data change,
  not a code change.
- Legal pages: `lib/legal.ts`.

## Product photography

Real product and lifestyle photography already ships in `public/assets/img/`
— sourced from Randolph Engineering's public CDN and optimized locally
(transparent PNGs composited on white, oversized files downscaled to web
weight). If you don't have a reseller/affiliate relationship with Randolph,
swap these for your own photos or licensed assets before selling.

The fallback chain still applies per product:

- `<slug>.jpg` — main product shot
- `<slug>-<colorway>.jpg` — per-variant shot (auto-switches with swatches)
- `<slug>-2/3/4.jpg` — gallery frames
- `hero.jpg`, `editorial.jpg`, `about.jpg`, `collections/*.jpg`, `og.jpg`

Any missing file falls back to the SVG product art automatically.
**[IMAGE_PROMPTS.md](./IMAGE_PROMPTS.md)** has a ready-to-paste art
direction + one prompt per file if you generate replacements.

## Payments & forms (wire before launch)

- `components/CheckoutClient.tsx` — submit handler is marked where a real
  processor (Stripe, Shopify checkout, etc.) goes.
- `components/ContactForm.tsx` / `NewsletterForm.tsx` — success states are
  local; connect a form backend (Formspree, Resend, …).

## Structure

```
app/                 routes (static export, generateStaticParams)
components/          header, cart drawer, product detail, checkout, etc.
lib/                 site config, catalog, types, legal copy
public/assets/img/   drop generated photography here
```

## Admin backend (`/admin`)

Supabase-backed store admin, all client-side so it still works as a static
export:

- **Login** — Supabase Auth (email/password). Create users in the Supabase
  dashboard → Authentication. Seeded admin: `admin@zalores.com`.
- **Dashboard** — revenue, orders today, pending count, COD-to-collect,
  recent orders, low-stock alerts.
- **Orders** — filterable/searchable list, detail page with items, address,
  fulfillment status (pending → confirmed → shipped → delivered/cancelled),
  "Mark COD collected", internal notes.
- **Receipt printing** — per order: 80mm thermal receipt and A4 invoice,
  both auto-open the print dialog (`/admin/receipt/?id=<id>&type=thermal|invoice`).
- **Products** — price/stock/active flags used by checkout validation.
- **Customers** — aggregated from order history.
- **Discounts** — percent/fixed codes, validated server-side at checkout.
- **Settings** — store name/address/phone, receipt footer, shipping rates.

### Backend pieces

- `supabase/functions/storefront-api` — public edge function. `create-order`
  prices everything server-side from `zl_products` (client totals are never
  trusted), applies discount codes, writes `zl_orders` + `zl_order_items`,
  decrements stock, and sends a confirmation email via Resend when
  `RESEND_API_KEY` (+ optional `RESEND_FROM`) is set as a function secret:
  `supabase secrets set RESEND_API_KEY=... RESEND_FROM="Zalores <orders@yourdomain.com>"`
- Tables `zl_products`, `zl_orders`, `zl_order_items`, `zl_discounts`,
  `zl_settings` self-bootstrap on cold start. RLS: anon gets nothing,
  authenticated users (admins) get full access.
- `NEXT_PUBLIC_SUPABASE_API_URL` — edge function URL.
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used by
  /admin only (RLS enforces authenticated-only access).

### admin.yourdomain.com

`vercel.json` rewrites any request on host `admin.zalores.com` to `/admin`.
When you add a domain: point `admin.<domain>` at the same Vercel project
(Vercel → Domains → add `admin.<domain>`) and update the host value in
`vercel.json`. On Hostinger, create the `admin` subdomain and point its
document root at the same `out/` upload — `/admin` paths resolve via the
exported `admin/` directory.
