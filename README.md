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

Until real photos exist, each product renders a consistent brand-style SVG
illustration. Drop files into `public/assets/img/` using the naming in
**[IMAGE_PROMPTS.md](./IMAGE_PROMPTS.md)** and they go live automatically:

- `<slug>.jpg` — main product shot
- `<slug>-<colorway>.jpg` — per-variant shot (auto-switches with swatches)
- `<slug>-2/3/4.jpg` — gallery frames
- `hero.jpg`, `editorial.jpg`, `about.jpg`, `collections/*.jpg`, `og.jpg`

IMAGE_PROMPTS.md contains a ready-to-paste art direction + one prompt per file.

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
