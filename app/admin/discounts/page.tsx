"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { supabase, type DiscountRow } from "@/lib/supabase";

export default function AdminDiscounts() {
  const [rows, setRows] = useState<DiscountRow[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from("zl_discounts").select("*").order("code");
    setRows((data ?? []) as DiscountRow[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !code.trim() || !value) return;
    const { error } = await supabase.from("zl_discounts").upsert({
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      active: true,
    });
    setMsg(error ? `Error: ${error.message}` : `${code.toUpperCase()} saved`);
    setCode("");
    setValue("");
    load();
  }

  async function toggle(d: DiscountRow) {
    if (!supabase) return;
    await supabase.from("zl_discounts").update({ active: !d.active }).eq("code", d.code);
    load();
  }

  async function remove(d: DiscountRow) {
    if (!supabase || !confirm(`Delete ${d.code}?`)) return;
    await supabase.from("zl_discounts").delete().eq("code", d.code);
    load();
  }

  if (loading) return <div className="adm-splash">Loading discounts…</div>;

  return (
    <div className="adm-page">
      <h1>Discounts</h1>
      <p className="adm-sub">Codes customers apply at checkout</p>
      <div className="adm-card">
        <h2>Create code</h2>
        <form className="adm-row" onSubmit={create}>
          <div className="adm-field">
            <label>Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="EID20"
              required
            />
          </div>
          <div className="adm-field">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount (Rs)</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Value</label>
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "10" : "500"}
              required
            />
          </div>
          <button className="adm-btn" type="submit">
            Create
          </button>
        </form>
        {msg && <p className="adm-msg ok">{msg}</p>}
      </div>
      <div className="adm-card">
        {rows.length === 0 ? (
          <p className="adm-empty">No discount codes.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.code}>
                  <td>
                    <strong>{d.code}</strong>
                  </td>
                  <td>
                    {d.type === "percent" ? `${d.value}% off` : `${formatPrice(d.value)} off`}
                  </td>
                  <td>
                    <span
                      className={`adm-badge ${d.active ? "adm-badge--delivered" : "adm-badge--inactive"}`}
                    >
                      {d.active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      onClick={() => toggle(d)}
                    >
                      {d.active ? "Disable" : "Enable"}
                    </button>{" "}
                    <button
                      type="button"
                      className="adm-btn adm-btn--ghost adm-btn--sm"
                      onClick={() => remove(d)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
