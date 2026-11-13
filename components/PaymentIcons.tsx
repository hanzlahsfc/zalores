import type { ReactNode } from "react";

/** Payment marks in the 38x24 card format Shopify themes render. */
const marks: { title: string; body: ReactNode }[] = [
  {
    title: "American Express",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" style={{ fill: "#016fd0", stroke: "#016fd0" }} />
        <text x="19" y="15.5" textAnchor="middle" fontSize="8" fontWeight="800" style={{ fill: "#fff" }}>AMEX</text>
      </>
    ),
  },
  {
    title: "Apple Pay",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" />
        <text x="19" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="600" style={{ fill: "#000" }}>Pay</text>
      </>
    ),
  },
  {
    title: "Google Pay",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" />
        <text x="19" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="600" style={{ fill: "#5f6368" }}>G Pay</text>
      </>
    ),
  },
  {
    title: "Mastercard",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" />
        <circle cx="15" cy="12" r="7" fill="#eb001b" />
        <circle cx="23" cy="12" r="7" fill="#f79e1b" fillOpacity=".9" />
      </>
    ),
  },
  {
    title: "PayPal",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" />
        <text x="19" y="15.5" textAnchor="middle" fontSize="8" fontWeight="800" fontStyle="italic" style={{ fill: "#003087" }}>PayPal</text>
      </>
    ),
  },
  {
    title: "Shop Pay",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" style={{ fill: "#5a31f4", stroke: "#5a31f4" }} />
        <text x="19" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="800" style={{ fill: "#fff" }}>shop</text>
      </>
    ),
  },
  {
    title: "Visa",
    body: (
      <>
        <rect x=".5" y=".5" width="37" height="23" rx="3" />
        <text x="19" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fontStyle="italic" style={{ fill: "#1a1f71" }}>VISA</text>
      </>
    ),
  },
];

export default function PaymentIcons({ only }: { only?: string[] }) {
  const list = only ? marks.filter((m) => only.includes(m.title)) : marks;
  return (
    <ul className="list-payment" role="list" aria-label="Payment methods">
      {list.map((m) => (
        <li key={m.title} className="pay-icon">
          <svg viewBox="0 0 38 24" role="img" aria-label={m.title}>
            {m.body}
          </svg>
        </li>
      ))}
    </ul>
  );
}
