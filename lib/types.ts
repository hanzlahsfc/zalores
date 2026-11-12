export type Silhouette =
  | "square"
  | "wayfarer"
  | "aviator"
  | "round"
  | "cat-eye"
  | "sport"
  | "accessory";

/** A purchasable variant, Shopify-style "Color" option. */
export interface Colorway {
  id: string;
  name: string;
  frameColor: string;
  lensColor: string;
  lensName: string;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  /** Strikethrough price for promos. */
  compareAt?: number;
  /** Collection slug, drives shop filters and collection cards. */
  collection: CollectionSlug;
  silhouette: Silhouette;
  /** Purchasable color options. Index 0 is the default. */
  colorways: Colorway[];
  /** Backdrop tint for product imagery. */
  tint: string;
  rating: number;
  reviewCount: number;
  badge?: "Best Seller" | "New" | "Low Stock" | "Sale";
  stock: number;
  features: string[];
  sku: string;
  /** Primary image, drop the real photo at public/assets/img/products/<slug>.jpg
   *  and it is picked up automatically (SVG art is the fallback). Per-colorway
   *  photos live at <slug>-<colorway-id>.jpg. */
  image: string;
  /** Extra gallery slots. */
  gallery: string[];
}

export type CollectionSlug = "classics" | "limited" | "accessories";

export interface Collection {
  slug: CollectionSlug;
  name: string;
  description: string;
  image: string;
}

export interface CartItem {
  slug: string;
  /** Colorway id, defaults to the product's first colorway. */
  colorway?: string;
  qty: number;
}
