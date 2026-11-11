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
    body: "Every frame ships with real mineral-glass lenses — UV400 (100% UVA/UVB) with polarized options on most models. Mineral glass is harder and optically truer than polycarbonate.",
  },
  {
    title: "How do I pick the right size?",
    body: "All our frames are a standard medium fit (lens width 52–58mm). If most sunglasses fit you, ours will. If you're between sizes, the Concorde runs the most forgiving.",
  },
  {
    title: "Do the frames fit wide faces?",
    body: "The Concorde and Shelby Aviator II have the widest fits, and bayonet temples flex naturally around wider heads without pressure points.",
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
