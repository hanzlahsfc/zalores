"use client";

import { apiUrl, supabase } from "./supabase";

async function token() {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  return data.session?.access_token ?? "";
}

/** Privileged edge-function call (server re-checks zl_admins membership). */
export async function adminCall<T = Record<string, unknown>>(action: string, body: Record<string, unknown> = {}) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
    body: JSON.stringify({ action, ...body }),
  });
  return (await res.json()) as T & { ok: boolean; error?: string };
}

/** Upload one image to Supabase Storage via a signed URL; returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const signed = await adminCall<{ path: string; token: string; publicUrl: string }>("admin-sign-upload", {
    name: file.name,
  });
  if (!signed.ok) throw new Error(signed.error ?? "Upload not allowed");
  const { error } = await supabase.storage
    .from("product-images")
    .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return signed.publicUrl;
}

export function removeImage(url: string) {
  return adminCall("admin-remove-upload", { url });
}

/** Trigger a storefront rebuild so new/renamed products get their own pages. */
export function publishStorefront() {
  return adminCall<{ queued?: boolean }>("admin-publish");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
