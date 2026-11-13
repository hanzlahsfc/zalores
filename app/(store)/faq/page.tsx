import type { Metadata } from "next";
import Link from "next/link";
import Accordion from "@/components/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers on fit, lenses, shipping, returns and warranty for Zalores sunglasses.",
};

const faqs = [
  {
    title: "Are the lenses really polarized?",
    body: "Every frame ships with UV400 lenses that block 100% of UVA and UVB rays, with polarized options on most models. Our mineral-glass lenses are harder and optically clearer than polycarbonate.",
  },
  {
    title: "How do I pick the right size?",
    body: "All frames are a standard medium fit with lens widths of 52 to 58mm. If most sunglasses fit you, ours will. Between sizes? The Concorde is the most forgiving.",
  },
  {
    title: "Do the frames fit wide faces?",
    body: "The Concorde and Shelby Aviator II have the widest fits, and bayonet temples flex naturally around wider heads without pressure points.",
  },
  {
    title: "How fast is shipping?",
    body: "Orders placed before 2pm ET ship the same business day. Standard delivery takes 3 to 5 business days and is free over $75. Express takes 1 to 2 business days for $12.95.",
  },
  {
    title: "What is your return policy?",
    body: "Return unworn frames within 30 days for a full refund, with no restocking fees. Refunds are issued within 5 business days of receiving your return.",
  },
  {
    title: "What does the warranty cover?",
    body: "Two years against manufacturing defects, including hinges, coatings and finish. Scratched lenses are not covered, but discounted replacements are always available.",
  },
  {
    title: "Do you offer prescription lenses?",
    body: "Not yet. Our current frames are non-prescription sunglasses. Subscribe to our emails to hear when prescription lenses launch.",
  },
];

export default function FaqPage() {
  return (
    <div className="page-width page-width--narrow main-page">
      <h1 className="main-page-title">Frequently asked questions</h1>
      <Accordion items={faqs} />
      <p style={{ marginTop: 32 }}>
        Still have a question? <Link href="/contact/" className="link">Contact us</Link> and
        we will reply within one business day.
      </p>
    </div>
  );
}
