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
    await sql`update public.zl_orders set status = 'dispatched' where status = 'shipped'`;
    // Live order feed for the admin panel.
    await sql`do $$ begin
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'zl_orders') then
        alter publication supabase_realtime add table public.zl_orders;
      end if;
    end $$`;
    // Full catalog columns (Shopify-style product records).
    await sql.unsafe(`
      alter table public.zl_products
        add column if not exists tagline text not null default '',
        add column if not exists description text not null default '',
        add column if not exists compare_at numeric,
        add column if not exists collection text,
        add column if not exists silhouette text not null default 'aviator',
        add column if not exists tint text not null default '#f2f2f2',
        add column if not exists rating numeric not null default 0,
        add column if not exists review_count integer not null default 0,
        add column if not exists badge text,
        add column if not exists features jsonb not null default '[]'::jsonb,
        add column if not exists image text not null default '',
        add column if not exists gallery jsonb not null default '[]'::jsonb,
        add column if not exists status text not null default 'active',
        add column if not exists sort integer not null default 0,
        add column if not exists tags jsonb not null default '[]'::jsonb,
        add column if not exists vendor text not null default 'Zalores',
        add column if not exists created_at timestamptz not null default now()`);
    await sql`
      create table if not exists public.zl_collections (
        slug text primary key,
        name text not null,
        description text not null default '',
        image text not null default '',
        sort integer not null default 0,
        created_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists public.zl_admins (
        user_id uuid primary key,
        email text,
        created_at timestamptz not null default now()
      )`;
    await sql.unsafe(`
      create or replace function public.zl_is_admin() returns boolean
      language sql stable security definer set search_path = public as $fn$
        select exists (select 1 from public.zl_admins where user_id = auth.uid())
      $fn$`);
    await sql.unsafe(`do $$ begin
      if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'zl_products') then
        alter publication supabase_realtime add table public.zl_products;
      end if;
    end $$`);
    // Admin-only access: membership in zl_admins, not just any signed-in user.
    for (const t of ["zl_products", "zl_orders", "zl_order_items", "zl_discounts", "zl_settings", "zl_collections", "zl_admins"]) {
      await sql.unsafe(`alter table public.${t} enable row level security`);
      await sql.unsafe(`drop policy if exists admin_all on public.${t}`);
      await sql.unsafe(
        `create policy admin_all on public.${t} for all to authenticated using (public.zl_is_admin()) with check (public.zl_is_admin())`,
      );
    }
    // Storefront reads the live catalog with the anon key.
    await sql.unsafe(`drop policy if exists public_read on public.zl_products`);
    await sql.unsafe(`create policy public_read on public.zl_products for select to anon, authenticated using (status = 'active')`);
    await sql.unsafe(`drop policy if exists public_read on public.zl_collections`);
    await sql.unsafe(`create policy public_read on public.zl_collections for select to anon, authenticated using (true)`);
    await ensureBucket();
  })();
  return bootstrap;
}

/* ------------------------------------------------------------------ */
/* Admin helpers                                                       */
/* ------------------------------------------------------------------ */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BUCKET = "product-images";

async function ensureBucket() {
  await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    }),
  }).catch(() => null);
}

/** Resolve the caller's Supabase user and confirm zl_admins membership. */
async function requireAdmin(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: ANON_KEY } });
  if (!res.ok) return null;
  const user = await res.json();
  if (!user?.id) return null;
  const rows = await sql`select 1 from public.zl_admins where user_id = ${user.id}`;
  return rows.length ? String(user.id) : null;
}

async function publish() {
  const hook = Deno.env.get("VERCEL_DEPLOY_HOOK");
  if (!hook) return { ok: false, error: "no_deploy_hook" };
  const [row] = await sql`select value from public.zl_settings where key = 'publish'`;
  const last = Number((row?.value as { at?: number } | undefined)?.at ?? 0);
  // Collapse bursts of saves into one rebuild.
  if (Date.now() - last < 20000) return { ok: true, queued: true };
  await sql`insert into public.zl_settings (key, value) values ('publish', ${sql.json({ at: Date.now() })})
            on conflict (key) do update set value = excluded.value`;
  const res = await fetch(hook, { method: "POST" });
  return { ok: res.ok, queued: false };
}

async function signUpload(name: string) {
  const ext = (name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, "Content-Type": "application/json" },
    body: "{}",
  });
  const data = await res.json();
  if (!res.ok || !data.url) return { ok: false, error: "sign_failed" };
  const token = new URL(`${SUPABASE_URL}/storage/v1${data.url}`).searchParams.get("token");
  return { ok: true, path, token, publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` };
}

async function removeUpload(url: string) {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefix)) return { ok: true };
  await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [url.slice(prefix.length)] }),
  });
  return { ok: true };
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

interface LineInput { slug?: unknown; colorway?: unknown; colorway_id?: unknown; qty?: unknown }

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
  const variantTakes: { slug: string; variant: string | null; qty: number }[] = [];
  for (const l of lines) {
    if (typeof l.slug !== "string") continue;
    const qty = Math.max(1, Math.min(10, Math.floor(Number(l.qty)) || 1));
    const [p] = await sql`select slug, name, price, stock, status, colorways from public.zl_products where slug = ${l.slug}`;
    if (!p || p.status !== "active") return json({ ok: false, error: `unavailable:${l.slug}` }, 400);
    const variants = (p.colorways ?? []) as { id: string; stock?: number }[];
    const variantId = typeof l.colorway_id === "string" ? l.colorway_id : variants[0]?.id ?? null;
    const v = variants.find((x) => x.id === variantId);
    const available = v && typeof v.stock === "number" ? v.stock : Number(p.stock);
    if (qty > available) return json({ ok: false, error: `low_stock:${l.slug}` }, 400);
    variantTakes.push({ slug: String(p.slug), variant: v ? v.id : null, qty });
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
  }
  for (const t of variantTakes) {
    const [p] = await sql`select colorways, stock from public.zl_products where slug = ${t.slug} for update`;
    const variants = ((p?.colorways ?? []) as { id: string; stock?: number }[]).map((v) =>
      v.id === t.variant && typeof v.stock === "number" ? { ...v, stock: Math.max(v.stock - t.qty, 0) } : v,
    );
    const tracked = variants.some((v) => typeof v.stock === "number");
    const total = tracked
      ? variants.reduce((a, v) => a + (typeof v.stock === "number" ? v.stock : 0), 0)
      : Math.max(Number(p?.stock ?? 0) - t.qty, 0);
    await sql`update public.zl_products set colorways = ${sql.json(variants)}, stock = ${total}, updated_at = now() where slug = ${t.slug}`;
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

    if (typeof body.action === "string" && body.action.startsWith("admin-")) {
      const uid = await requireAdmin(req);
      if (!uid) return json({ ok: false, error: "forbidden" }, 403);
      if (body.action === "admin-publish") return json(await publish());
      if (body.action === "admin-sign-upload") return json(await signUpload(String(body.name ?? "image.jpg")));
      if (body.action === "admin-remove-upload") return json(await removeUpload(String(body.url ?? "")));
      return json({ ok: false, error: "unknown_action" }, 400);
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e instanceof Error ? e.message : e).slice(0, 300) }, 500);
  }
});
