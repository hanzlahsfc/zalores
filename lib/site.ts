/**
 * Central brand/site configuration.
 * Rebranding the store later? Edit this file plus lib/products.ts, the whole
 * site (copy, metadata, checkout, emails-to-be) reads from here.
 */
export const site = {
  name: "Zalores",
  tagline: "Metal-frame sunglasses, made to last.",
  description:
    "Hand-assembled metal sunglasses with real mineral-glass lenses. Aviators, limited editions and eyewear accessories. Free nationwide shipping over Rs 8,000.",
  url: "https://zalores.com",
  email: "hello@zalores.com",
  phone: "+92 300 0134200",
  currency: "PKR",
  currencySymbol: "Rs",
  freeShippingThreshold: 8000,
  shipping: { standard: 350, express: 750 },
  announcement: "Free shipping over Rs 8,000 · Cash on delivery · 30-day returns",
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
