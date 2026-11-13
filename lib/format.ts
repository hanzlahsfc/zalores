import { site } from "./site";

/** PKR money: whole rupees, e.g. "Rs 14,999". */
export function formatPrice(amount: number): string {
  return `${site.currencySymbol} ${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}
