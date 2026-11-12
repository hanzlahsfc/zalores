/**
 * Payment brand marks as compact SVG pills, the row every Shopify footer,
 * PDP and checkout carries.
 */
export default function PaymentIcons({ light = false }: { light?: boolean }) {
  const cls = `pay-icon${light ? " light" : ""}`;
  return (
    <span className="pay-row" aria-label="Accepted payment methods">
      <span className={cls} title="Visa">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <text x="19" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fontStyle="italic" letterSpacing="1">VISA</text>
        </svg>
      </span>
      <span className={cls} title="Mastercard">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <circle cx="15" cy="12" r="7" fill="#eb001b" />
          <circle cx="23" cy="12" r="7" fill="#f79e1b" opacity=".85" />
        </svg>
      </span>
      <span className={cls} title="American Express">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <text x="19" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="800" letterSpacing=".5">AMEX</text>
        </svg>
      </span>
      <span className={cls} title="PayPal">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <text x="19" y="15" textAnchor="middle" fontSize="8" fontWeight="800" fontStyle="italic">PayPal</text>
        </svg>
      </span>
      <span className={cls} title="Apple Pay">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <text x="19" y="15" textAnchor="middle" fontSize="8" fontWeight="700">Apple Pay</text>
        </svg>
      </span>
      <span className={cls} title="Google Pay">
        <svg viewBox="0 0 38 24" width="38" height="24" aria-hidden="true">
          <rect x=".5" y=".5" width="37" height="23" rx="4" />
          <text x="19" y="15" textAnchor="middle" fontSize="8.5" fontWeight="700">G Pay</text>
        </svg>
      </span>
    </span>
  );
}
