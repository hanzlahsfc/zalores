import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop all sunglasses",
  description:
    "Hand-assembled aviators with mineral-glass lenses — classics, limited runs and accessories. Free shipping over $75.",
};

export default function ShopPage() {
  return (
    <div className="page-wrap">
      <header className="page-head">
        <span className="eyebrow">The collection</span>
        <h1>Sunglasses</h1>
        <p className="page-sub">
          Hand-assembled frames and real mineral-glass lenses — plus the gear
          that keeps them pristine.
        </p>
      </header>
      <Suspense>
        <ShopClient />
      </Suspense>
    </div>
  );
}
