export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}

export const legalDocs: LegalDoc[] = [
  {
    slug: "shipping-returns",
    title: "Shipping & Returns",
    updated: "November 2026",
    sections: [
      {
        heading: "Shipping",
        body: [
          "Orders placed before 2pm PKT ship the same business day. Standard delivery (3–5 working days) is free on orders over Rs 8,000, otherwise a flat Rs 350. Express delivery (1–2 working days) is available at checkout for Rs 750.",
          "We deliver across Pakistan via TCS and Leopards, with cash on delivery in most cities.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "You have 30 days from delivery to return any unworn pair for a full refund, no questions, no restocking fees. Start a return from the link in your order email or by contacting us.",
          "Refunds are issued to the original payment method, or by bank transfer for cash-on-delivery orders, within 5 business days of your return arriving at our studio.",
        ],
      },
      {
        heading: "Warranty",
        body: [
          "Every frame carries a 2-year warranty against manufacturing defects: hinges, coatings, and finish. If something fails under normal use, we repair or replace it free.",
          "Scratched lenses and accidental damage aren't covered, but reach out anyway. We offer discounted replacements for life-of-product.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "November 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "We collect the information you give us at checkout (name, email, shipping address) and standard analytics about how you use the site. We never sell your data.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "Order information is used to fulfill and support your purchase. Email is used for order updates and, only if you opt in, occasional product news. You can unsubscribe at any time.",
        ],
      },
      {
        heading: "Your choices",
        body: [
          "Email hello@zalores.com to access, correct, or delete your personal data. Analytics cookies can be declined via your browser settings.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    updated: "November 2026",
    sections: [
      {
        heading: "The basics",
        body: [
          "By using this site you agree to these terms. We reserve the right to update them; material changes are announced on this page.",
        ],
      },
      {
        heading: "Orders",
        body: [
          "All orders are subject to acceptance and availability. Prices are shown in PKR and may change without notice. We may cancel orders that appear fraudulent or that contain pricing errors.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Our liability is limited to the purchase price of the product. Nothing in these terms limits your statutory consumer rights.",
        ],
      },
    ],
  },
];
