import { site } from "./site";

/** Shopify-style money: always two decimals, e.g. "$149.00". */
export function formatPrice(amount: number): string {
  return `${site.currencySymbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
