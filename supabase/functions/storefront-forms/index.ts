// Zalores storefront form backend.
// Public endpoint (deployed with --no-verify-jwt) that stores contact and
// newsletter submissions in dedicated tables. Tables self-bootstrap on cold
// start via SUPABASE_DB_URL, which Supabase injects automatically.
import postgres from "npm:postgres@3.4.5";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

let bootstrap: Promise<unknown> | null = null;
function ensureTables() {
  bootstrap ??= (async () => {
    await sql`
      create table if not exists public.zalores_contact_messages (
        id bigint generated always as identity primary key,
        name text not null,
        email text not null,
        subject text not null,
        message text not null,
        created_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists public.zalores_newsletter_subscribers (
        id bigint generated always as identity primary key,
        email text not null unique,
        created_at timestamptz not null default now()
      )`;
    // RLS on with no policies = only service-side SQL (this function) can touch the data
    await sql`alter table public.zalores_contact_messages enable row level security`;
    await sql`alter table public.zalores_newsletter_subscribers enable row level security`;
  })();
  return bootstrap;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const isEmail = (s: unknown): s is string =>
  typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length < 320;
const isShort = (s: unknown, n: number): s is string =>
  typeof s === "string" && s.trim().length > 0 && s.length <= n;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (body.website) return json({ ok: true }); // honeypot: pretend success for bots

  try {
    await ensureTables();

    if (body.type === "newsletter") {
      if (!isEmail(body.email)) return json({ ok: false, error: "invalid_email" }, 400);
      await sql`
        insert into public.zalores_newsletter_subscribers (email)
        values (${body.email.toLowerCase()})
        on conflict (email) do nothing`;
      return json({ ok: true });
    }

    if (body.type === "contact") {
      const { name, email, subject, message } = body;
      if (!isShort(name, 120) || !isEmail(email) || !isShort(subject, 160) || !isShort(message, 5000)) {
        return json({ ok: false, error: "invalid_fields" }, 400);
      }
      await sql`
        insert into public.zalores_contact_messages (name, email, subject, message)
        values (${name.trim()}, ${email.trim()}, ${subject.trim()}, ${message.trim()})`;
      return json({ ok: true });
    }

    return json({ ok: false, error: "unknown_type" }, 400);
  } catch (e) {
    console.error("storefront-forms error:", e);
    bootstrap = null; // retry table creation next cold start
    return json({ ok: false, error: "server_error" }, 500);
  }
});
