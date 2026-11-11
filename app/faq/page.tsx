import type { Metadata } from "next";
import Accordion from "@/components/Accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers on fit, lenses, shipping, returns and warranty for Zalores sunglasses.",
};

const faqs = [
  {
    title: "Are the lenses really polarized?",
    body: "Yes — every pair ships with nylon polarized lenses rated UV400 (100% UVA/UVB). Polarization kills reflected glare off water, roads and glass; UV400 handles the rays you can't see.",
  },
  {
    title: "How do I pick the right size?",
    body: "All our frames are a standard medium fit (lens width 50–54mm). If most sunglasses fit you, ours will. If you're between sizes, the Meridian and Verano run most forgiving.",
  },
  {
    title: "Do the frames fit wide faces?",
    body: "Meridian, Coastline and Ridgeline have the widest fits and flexible hinges that accommodate wider faces comfortably. Check each product page for measurements.",
  },
  {
    title: "How fast is shipping?",
    body: "Orders before 2pm ET ship the same business day. Standard is 3–5 business days (free over $75); express is 1–2 days for $12.95.",
  },
  {
    title: "What's the return policy?",
    body: "30 days, unworn, full refund — no questions and no restocking fees. Refunds land within 5 business days of us receiving the return.",
  },
  {
    title: "What does the warranty cover?",
    body: "Two years against manufacturing defects: hinges, coatings and finish. Scratched lenses aren't covered, but lifetime discounted replacements are available — just email us.",
  },
  {
    title: "Can I get prescription lenses?",
    body: "Not yet — our current frames are plano (non-prescription) sunglasses. Prescription is on the roadmap; join the newsletter to hear first.",
  },
];

export default function FaqPage() {
  return (
    <div className="page-wrap page-narrow">
      <header className="page-head">
        <span className="eyebrow">Good questions</span>
        <h1>FAQ</h1>
        <p className="page-sub">
          Can&rsquo;t find your answer? <a href="/contact/">Contact us</a> — we
          reply within one business day.
        </p>
      </header>
      <Accordion items={faqs} />
    </div>
  );
}
