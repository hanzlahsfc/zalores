"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULTS = {
  store_name: "Zalores",
  store_address: "Zalores Studio, DHA Phase 5, Lahore",
  store_phone: "+92 300 0134200",
  receipt_footer: "Thank you for shopping with us.",
  shipping_standard: 350,
  shipping_express: 750,
  free_over: 8000,
};

export default function AdminSettings() {
  const [cfg, setCfg] = useState(DEFAULTS);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("zl_settings")
      .select("value")
      .eq("key", "store")
      .single()
      .then(({ data }) => {
        if (data?.value) setCfg({ ...DEFAULTS, ...(data.value as Partial<typeof DEFAULTS>) });
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from("zl_settings").upsert({ key: "store", value: cfg });
    setMsg(
      error
        ? `Error: ${error.message}`
        : "Settings saved. New orders and receipts use these values.",
    );
    setTimeout(() => setMsg(""), 3500);
  }

  const set =
    (k: keyof typeof DEFAULTS) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setCfg({ ...cfg, [k]: typeof DEFAULTS[k] === "number" ? Number(e.target.value) : e.target.value });

  if (loading) return <div className="adm-splash">Loading settings…</div>;

  return (
    <div className="adm-page">
      <h1>Settings</h1>
      <p className="adm-sub">Store details used on receipts, invoices and order emails</p>
      <form className="adm-card" style={{ maxWidth: 560 }} onSubmit={save}>
        <h2>Store</h2>
        <div className="adm-field">
          <label>Store name</label>
          <input value={cfg.store_name} onChange={set("store_name")} />
        </div>
        <div className="adm-field">
          <label>Address (receipts and invoices)</label>
          <input value={cfg.store_address} onChange={set("store_address")} />
        </div>
        <div className="adm-field">
          <label>Phone</label>
          <input value={cfg.store_phone} onChange={set("store_phone")} />
        </div>
        <div className="adm-field">
          <label>Receipt footer</label>
          <textarea rows={2} value={cfg.receipt_footer} onChange={set("receipt_footer")} />
        </div>
        <h2 style={{ marginTop: 20 }}>Shipping</h2>
        <div className="adm-row">
          <div className="adm-field">
            <label>Standard (Rs)</label>
            <input type="number" min={0} value={cfg.shipping_standard} onChange={set("shipping_standard")} />
          </div>
          <div className="adm-field">
            <label>Express (Rs)</label>
            <input type="number" min={0} value={cfg.shipping_express} onChange={set("shipping_express")} />
          </div>
          <div className="adm-field">
            <label>Free over (Rs)</label>
            <input type="number" min={0} value={cfg.free_over} onChange={set("free_over")} />
          </div>
        </div>
        <button className="adm-btn" type="submit">
          Save settings
        </button>
        {msg && <p className="adm-msg ok">{msg}</p>}
      </form>
    </div>
  );
}
