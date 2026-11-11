import type { Metadata } from "next";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout.",
};

export default function CheckoutPage() {
  return (
    <div className="page-wrap page-narrow">
      <CheckoutClient />
    </div>
  );
}
