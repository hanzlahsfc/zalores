/**
 * Central brand/site configuration.
 * Rebranding the store later? Edit this file plus lib/products.ts, the whole
 * site (copy, metadata, checkout, emails-to-be) reads from here.
 */
export const site = {
  name: "Zalores",
  tagline: "Metal-frame sunglasses, made to last.",
  description:
    "Hand-assembled metal sunglasses with real mineral-glass lenses. Aviators, limited editions and eyewear accessories. Free shipping over $75.",
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
  heroKicker: "Handcrafted metal eyewear",
  heroTitle: "Metal frames. Real glass. Built to last.",
  heroSub:
    "Hand-assembled aviators with genuine mineral-glass lenses. Pilot heritage since 1978.",
} as const;

export type Site = typeof site;
