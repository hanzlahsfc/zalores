import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Hand-assembled metal sunglasses with mineral-glass lenses, plus cases, straps and lens care. Free nationwide shipping over Rs 8,000.",
};

export default function ShopPage() {
  return (
    <div className="page-width" style={{ paddingBottom: 60 }}>
      <Suspense>
        <ShopClient />
      </Suspense>
    </div>
  );
}
