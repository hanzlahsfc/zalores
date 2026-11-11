import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Shop all sunglasses",
  description:
    "Polarized, handcrafted sunglasses — everyday icons, statement frames and sport optics. Free shipping over $75.",
};

export default function ShopPage() {
  return (
    <div className="page-wrap">
      <header className="page-head">
        <span className="eyebrow">The collection</span>
        <h1>Sunglasses</h1>
        <p className="page-sub">
          Six silhouettes, one obsession: lenses you&rsquo;ll actually notice
          the difference through.
        </p>
      </header>
      <Suspense>
        <ShopClient />
      </Suspense>
    </div>
  );
}
