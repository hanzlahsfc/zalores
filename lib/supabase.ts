import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = Boolean(url && anon);

export const supabase = supabaseConfigured
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_API_URL ?? "";

export interface OrderRow {
  id: number;
  order_number: string;
  email: string;
  phone: string | null;
  customer_name: string | null;
  address: {
    address?: string;
    apt?: string;
    city?: string;
    province?: string;
    postal?: string;
    country?: string;
  };
  payment_method: "cod" | "card" | "bank" | string;
  shipping_method: string;
  shipping_label: string | null;
  subtotal: number;
  discount: number;
  discount_code: string | null;
  shipping: number;
  total: number;
  status: string;
  payment_status: string;
  note: string | null;
  email_sent: boolean;
  created_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  slug: string;
  name: string;
  colorway: string | null;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface ProductRow {
  slug: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  active: boolean;
  colorways: { id: string; name: string; lens: string }[];
  updated_at: string;
}

export interface DiscountRow {
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  created_at: string;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "dispatched",
  "delivered",
  "completed",
  "returned",
  "cancelled",
] as const;

export const STATUS_HINTS: Record<string, string> = {
  pending: "New order — call the customer to confirm it is genuine.",
  confirmed: "Customer confirmed — pack the order and book the courier.",
  dispatched: "Handed to the courier, in transit to the customer.",
  delivered: "Reached the customer. Collect the cash if it is COD.",
  completed: "Order closed — delivered and payment collected.",
  returned: "Rider brought it back (refused or unreachable).",
  cancelled: "Cancelled before dispatch.",
};

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  card: "Debit/Credit card",
  bank: "Bank transfer",
};

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
