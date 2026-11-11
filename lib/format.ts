import { site } from "./site";

export function formatPrice(amount: number): string {
  return `${site.currencySymbol}${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}
