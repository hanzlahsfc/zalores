/**
 * Storefront form submissions → Supabase edge function.
 * The function URL is public-by-design (no secrets client-side); it validates
 * and writes to private tables server-side. When the env var is absent —
 * e.g. a static preview build — submissions resolve as no-ops so the UI
 * keeps its success states.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL;

async function post(payload: Record<string, string>): Promise<boolean> {
  if (!ENDPOINT) return true;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function submitContact(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  return post({ type: "contact", ...data });
}

export function subscribeNewsletter(email: string): Promise<boolean> {
  return post({ type: "newsletter", email });
}
