// Zalores storefront commerce backend.
// Public endpoint (deploy with --no-verify-jwt) that creates real orders with
// server-side pricing, validates discount codes, and sends order confirmation
// email via Resend when RESEND_API_KEY is configured.
//
// Schema self-bootstraps on cold start via SUPABASE_DB_URL, which Supabase
// injects automatically. Admin reads/writes go through RLS policies limited to
// authenticated users (store admins); the anon key gets no table access.
import postgres from "npm:postgres@3.4.5";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

let bootstrap: Promise<unknown> | null = null;
function ensureSchema() {
  bootstrap ??= (async () => {
    await sql`
      create table if not exists public.zl_products (
        slug text primary key,
        name text not null,
        sku text,
        price numeric not null default 0,
        stock integer not null default 0,
        active boolean not null default true,
        colorways jsonb not null default '[]'::jsonb,
        updated_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists public.zl_orders (
        id bigint generated always as identity primary key,
        order_number text not null unique,
        email text not null,
        phone text,
        customer_name text,
        address jsonb not null default '{}'::jsonb,
        payment_method text not null default 'cod',
        shipping_method text not null default 'standard',
        shipping_label text,
        subtotal numeric not null default 0,
        discount numeric not null default 0,
        discount_code text,
        shipping numeric not null default 0,
        total numeric not null default 0,
        status text not null default 'pending',
        payment_status text not null default 'unpaid',
        note text,
        email_sent boolean not null default false,
        created_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists public.zl_order_items (
        id bigint generated always as identity primary key,
        order_id bigint not null references public.zl_orders(id) on delete cascade,
        slug text not null,
        name text not null,
        colorway text,
        qty integer not null,
        unit_price numeric not null,
        line_total numeric not null
      )`;
    await sql`
      create table if not exists public.zl_discounts (
        code text primary key,
        type text not null check (type in ('percent','fixed')),
        value numeric not null,
        active boolean not null default true,
        created_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists public.zl_settings (
        key text primary key,
        value jsonb not null default '{}'::jsonb
      )`;
    await sql`create sequence if not exists public.zl_order_number_seq start 1001`;
    for (const t of ["zl_products", "zl_orders", "zl_order_items", "zl_discounts", "zl_settings"]) {
      await sql.unsafe(`alter table public.${t} enable row level security`);
      await sql.unsafe(
        `do $$ begin
           if not exists (select 1 from pg_policies where tablename = '${t}' and policyname = 'admin_all') then
             execute 'create policy admin_all on public.${t} for all to authenticated using (true) with check (true)';
           end if;
         end $$`,
      );
    }
    // Only authenticated admin accounts may read/write. Anon gets nothing:
    // orders are written here via SUPABASE_DB_URL which bypasses RLS.
  })();
  return bootstrap;
}

/* ------------------------------------------------------------------ */
/* Settings + helpers                                                  */
/* ------------------------------------------------------------------ */

interface Settings {
  store_name?: string;
  store_address?: string;
  store_phone?: string;
  receipt_footer?: string;
  shipping_standard?: number;
  shipping_express?: number;
  free_over?: number;
  currency_symbol?: string;
}

async function getSettings(): Promise<Required<Settings>> {
  const rows = await sql`select value from public.zl_settings where key = 'store'`;
  const v = (rows[0]?.value ?? {}) as Settings;
  return {
    store_name: v.store_name ?? "Zalores",
    store_address: v.store_address ?? "Zalores Studio, DHA Phase 5, Lahore",
    store_phone: v.store_phone ?? "+92 300 0134200",
    receipt_footer: v.receipt_footer ?? "Thank you for shopping with us.",
    shipping_standard: Number(v.shipping_standard ?? 350),
    shipping_express: Number(v.shipping_express ?? 750),
    free_over: Number(v.free_over ?? 8000),
    currency_symbol: v.currency_symbol ?? "Rs",
  };
}

const isEmail = (s: unknown): s is string =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length < 320;
const isStr = (s: unknown, n: number): s is string =>
  typeof s === "string" && s.trim().length > 0 && s.length <= n;
const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ */
/* Order confirmation email (Resend, only when configured)             */
/* ------------------------------------------------------------------ */

async function sendOrderEmail(order: Record<string, unknown>, items: { name: string; colorway: string | null; qty: number; unit_price: number; line_total: number }[], cfg: Required<Settings>) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const from = Deno.env.get("RESEND_FROM") ?? "Zalores <orders@zalores.com>";
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${i.name}${i.colorway ? `<br><small style="color:#777">${i.colorway}</small>` : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${money(i.line_total)}</td>
      </tr>`,
    )
    .join("");
  const payLine =
    order.payment_method === "cod"
      ? "Pay in cash when your order arrives. We will call you to confirm."
      : order.payment_method === "bank"
        ? "Bank transfer details will be shared shortly."
        : "Paid by card.";
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
    <h2 style="margin-bottom:4px">${cfg.store_name}</h2>
    <p style="color:#555;margin-top:0">Order <strong>${order.order_number}</strong> confirmed</p>
    <p>Hi ${order.customer_name ?? "there"},</p>
    <p>Thanks for your order. ${payLine}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
    <table style="width:100%;margin-top:12px;font-size:14px">
      <tr><td>Subtotal</td><td style="text-align:right">${money(Number(order.subtotal))}</td></tr>
      ${Number(order.discount) > 0 ? `<tr><td>Discount${order.discount_code ? ` (${order.discount_code})` : ""}</td><td style="text-align:right">-${money(Number(order.discount))}</td></tr>` : ""}
      <tr><td>Shipping (${order.shipping_label})</td><td style="text-align:right">${Number(order.shipping) === 0 ? "FREE" : money(Number(order.shipping))}</td></tr>
      <tr><td style="padding-top:8px;font-weight:bold">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold">${money(Number(order.total))}</td></tr>
    </table>
    <p style="color:#555;font-size:13px;margin-top:24px">Delivery to: ${(order.address as Record<string, string>).address ?? ""}, ${(order.address as Record<string, string>).city ?? ""}</p>
    <p style="color:#999;font-size:12px">${cfg.store_name} · ${cfg.store_phone}</p>
  </body></html>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [order.email],
        subject: `Order ${order.order_number} confirmed - ${cfg.store_name}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* create-order                                                        */
/* ------------------------------------------------------------------ */

interface LineInput { slug?: unknown; colorway?: unknown; qty?: unknown }

async function createOrder(body: Record<string, unknown>) {
  const shipping = (body.shipping ?? {}) as Record<string, unknown>;
  const lines = Array.isArray(body.lines) ? (body.lines as LineInput[]) : [];
  if (!isEmail(body.email)) return json({ ok: false, error: "invalid_email" }, 400);
  if (!isStr(shipping.last, 80) || !isStr(shipping.address, 200) || !isStr(shipping.city, 80) || !isStr(shipping.province, 80)) {
    return json({ ok: false, error: "invalid_address" }, 400);
  }
  if (!isStr(body.phone, 24)) return json({ ok: false, error: "invalid_phone" }, 400);
  if (lines.length === 0 || lines.length > 50) return json({ ok: false, error: "empty_cart" }, 400);
  const method = body.method === "express" ? "express" : "standard";
  const payment = ["cod", "card", "bank"].includes(String(body.payment)) ? String(body.payment) : "cod";

  const cfg = await getSettings();

  // Price everything server-side from zl_products. Never trust client totals.
  const items: { slug: string; name: string; colorway: string | null; qty: number; unit_price: number; line_total: number }[] = [];
  for (const l of lines) {
    if (typeof l.slug !== "string") continue;
    const qty = Math.max(1, Math.min(10, Math.floor(Number(l.qty)) || 1));
    const [p] = await sql`select slug, name, price, stock, active from public.zl_products where slug = ${l.slug}`;
    if (!p || !p.active) return json({ ok: false, error: `unavailable:${l.slug}` }, 400);
    if (Number(p.stock) > 0 && qty > Number(p.stock)) {
      return json({ ok: false, error: `low_stock:${l.slug}` }, 400);
    }
    items.push({
      slug: String(p.slug),
      name: String(p.name),
      colorway: typeof l.colorway === "string" ? l.colorway.slice(0, 120) : null,
      qty,
      unit_price: Number(p.price),
      line_total: Number(p.price) * qty,
    });
  }
  if (items.length === 0) return json({ ok: false, error: "empty_cart" }, 400);

  const subtotal = items.reduce((a, i) => a + i.line_total, 0);

  let discount = 0;
  let discountCode: string | null = null;
  if (typeof body.discount_code === "string" && body.discount_code.trim()) {
    const code = body.discount_code.trim().toUpperCase();
    const [d] = await sql`select type, value from public.zl_discounts where code = ${code} and active`;
    if (d) {
      discountCode = code;
      discount = d.type === "percent" ? Math.round((subtotal * Number(d.value)) / 100) : Math.min(subtotal, Number(d.value));
    }
  }

  const shipCost =
    method === "express" ? cfg.shipping_express : subtotal - discount >= cfg.free_over ? 0 : cfg.shipping_standard;
  const shipLabel =
    method === "express" ? "Express (1 to 2 working days)" : "Standard (3 to 5 working days)";
  const total = subtotal - discount + shipCost;

  const orderNumber = `ZL-${(await sql`select nextval('public.zl_order_number_seq') as n`)[0].n}`;
  const customerName = [shipping.first, shipping.last].filter(Boolean).join(" ").slice(0, 160);
  const address = {
    address: String(shipping.address).slice(0, 200),
    apt: typeof shipping.apt === "string" ? shipping.apt.slice(0, 100) : "",
    city: String(shipping.city).slice(0, 80),
    province: String(shipping.province).slice(0, 80),
    postal: typeof shipping.postal === "string" ? shipping.postal.slice(0, 12) : "",
    country: "Pakistan",
  };

  const [order] = await sql`
    insert into public.zl_orders
      (order_number, email, phone, customer_name, address, payment_method,
       shipping_method, shipping_label, subtotal, discount, discount_code,
       shipping, total, note)
    values
      (${orderNumber}, ${String(body.email).toLowerCase()}, ${String(body.phone)},
       ${customerName}, ${sql.json(address)}, ${payment}, ${method}, ${shipLabel},
       ${subtotal}, ${discount}, ${discountCode}, ${shipCost}, ${total},
       ${typeof body.note === "string" ? body.note.slice(0, 500) : null})
    returning id, order_number, total`;

  for (const i of items) {
    await sql`
      insert into public.zl_order_items (order_id, slug, name, colorway, qty, unit_price, line_total)
      values (${order.id}, ${i.slug}, ${i.name}, ${i.colorway}, ${i.qty}, ${i.unit_price}, ${i.line_total})`;
    await sql`update public.zl_products set stock = greatest(stock - ${i.qty}, 0) where slug = ${i.slug} and stock > 0`;
  }

  const fullOrder = { ...order, email: body.email, customer_name: customerName, address, payment_method: payment, shipping_label: shipLabel, subtotal, discount, discount_code: discountCode, shipping: shipCost };
  const emailed = await sendOrderEmail(fullOrder, items, cfg);
  if (emailed) await sql`update public.zl_orders set email_sent = true where id = ${order.id}`;

  return json({ ok: true, order_number: order.order_number, total, email_sent: emailed });
}

/* ------------------------------------------------------------------ */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (body.website) return json({ ok: true }); // honeypot

  try {
    await ensureSchema();

    if (body.action === "validate-discount") {
      if (typeof body.code !== "string") return json({ ok: false, error: "invalid_code" }, 400);
      const code = body.code.trim().toUpperCase();
      const [d] = await sql`select type, value from public.zl_discounts where code = ${code} and active`;
      if (!d) return json({ ok: false, error: "invalid_code" }, 404);
      return json({ ok: true, type: d.type, value: Number(d.value) });
    }

    if (body.action === "create-order") return await createOrder(body);

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e).slice(0, 300) }, 500);
  }
});
