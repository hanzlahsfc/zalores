/**
 * Central brand/site configuration.
 * Rebranding the store later? Edit this file plus lib/products.ts — the whole
 * site (copy, metadata, checkout, emails-to-be) reads from here.
 */
export const site = {
  name: "Zalores",
  tagline: "Eyewear, elevated.",
  description:
    "Premium polarized sunglasses designed for long light. Handcrafted acetate frames, UV400 protection, free shipping over $75.",
  url: "https://zalores.com",
  email: "hello@zalores.com",
  phone: "+1 (555) 013-4200",
  currency: "USD",
  currencySymbol: "$",
  freeShippingThreshold: 75,
  announcement: "Free shipping on orders over $75 · 30-day returns · 2-year warranty",
  social: {
    instagram: "https://instagram.com/zalores",
    tiktok: "https://tiktok.com/@zalores",
    pinterest: "https://pinterest.com/zalores",
  },
  heroKicker: "The Solstice Collection",
  heroTitle: "See the world in better light.",
  heroSub:
    "Polarized lenses. Hand-finished acetate. Frames built to be worn every day — and noticed every time.",
} as const;

export type Site = typeof site;
