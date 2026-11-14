import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Hand-assembled metal sunglasses with mineral-glass lenses, plus cases, straps and lens care. Free delivery on orders of 2 or more items.",
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
