"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { publishStorefront } from "@/lib/admin-api";
import { useOrdersRealtime } from "@/lib/useOrdersRealtime";

/* ---------------- icons (Polaris-like outlines) ---------------- */
const I = {
  home: "M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z",
  orders: "M4 4h12l-1.2 8.4a1 1 0 0 1-1 .86H6.2a1 1 0 0 1-1-.86L4 4Zm0 0-.6-2H2m5 15.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  products: "M10 2.5 17 6v8l-7 3.5L3 14V6l7-3.5Zm0 0v15M3 6l7 3.5L17 6",
  customers: "M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 7.5a6.5 6.5 0 0 1 13 0",
  discounts: "M10.6 2.6 17.4 9.4a1.4 1.4 0 0 1 0 2l-6 6a1.4 1.4 0 0 1-2 0L2.6 10.6V2.6h8ZM6.5 6.5h.01",
  settings: "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm6.4-1.3.9.7-1.5 2.6-1.1-.4a6 6 0 0 1-1.5.9L13 17h-3l-.3-1.1a6 6 0 0 1-1.5-.9l-1.1.4-1.5-2.6.9-.7a6 6 0 0 1 0-1.8l-.9-.7 1.5-2.6 1.1.4a6 6 0 0 1 1.5-.9L10 3h3l.3 1.1a6 6 0 0 1 1.5.9l1.1-.4 1.5 2.6-.9.7a6 6 0 0 1 0 1.8Z",
  store: "M3 8h14M4 8l1-4h10l1 4m-12 0v8h12V8M8 16v-4h4v4",
  logout: "M8 4H4v12h4m4-3 3-3-3-3m3 3H8",
};
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/* ---------------- publish context ---------------- */
type PublishState = "idle" | "building";
interface AdminCtx {
  publish: () => Promise<void>;
  publishState: PublishState;
  toast: (msg: string, err?: boolean) => void;
  email: string;
}
const Ctx = createContext<AdminCtx | null>(null);
export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin outside AdminShell");
  return c;
}

const NAV: { href: string; label: string; icon: string; sub?: { href: string; label: string }[]; count?: boolean }[] = [
  { href: "/admin/", label: "Home", icon: I.home },
  { href: "/admin/orders/", label: "Orders", icon: I.orders, count: true },
  {
    href: "/admin/products/",
    label: "Products",
    icon: I.products,
    sub: [
      { href: "/admin/collections/", label: "Collections" },
      { href: "/admin/inventory/", label: "Inventory" },
    ],
  },
  { href: "/admin/customers/", label: "Customers", icon: I.customers },
  { href: "/admin/discounts/", label: "Discounts", icon: I.discounts },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [pending, setPending] = useState(0);
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [toastMsg, setToastMsg] = useState<{ msg: string; err: boolean } | null>(null);
  const [q, setQ] = useState("");
  const isLogin = path.startsWith("/admin/login");
  const isPrint = path.startsWith("/admin/receipt");

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null && !isLogin) router.replace("/admin/login/");
    if (!session || !supabase) return;
    supabase
      .from("zl_admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session, isLogin, router]);

  const loadPending = useCallback(() => {
    supabase
      ?.from("zl_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPending(count ?? 0));
  }, []);
  useEffect(() => {
    if (isAdmin) loadPending();
  }, [isAdmin, loadPending]);
  useOrdersRealtime({ insert: loadPending, update: loadPending });

  const toast = useCallback((msg: string, err = false) => {
    setToastMsg({ msg, err });
    setTimeout(() => setToastMsg(null), 4000);
  }, []);

  const publish = useCallback(async () => {
    const r = await publishStorefront();
    if (!r.ok) {
      toast("Could not update storefront", true);
      return;
    }
    setPublishState("building");
    setTimeout(() => setPublishState("idle"), 75000);
  }, [toast]);

  if (isLogin) return <>{children}</>;
  if (session === undefined || (session && isAdmin === undefined)) {
    return <div className="adm-splash">Loading admin…</div>;
  }
  if (!session) {
    return <div className="adm-splash">{supabaseConfigured ? "Redirecting to login…" : "Supabase env vars are not configured."}</div>;
  }
  if (!isAdmin) {
    return (
      <div className="adm-splash">
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>{session.user.email}</strong> does not have admin access.
          </p>
          <button className="adm-btn adm-btn--ghost" onClick={() => supabase?.auth.signOut()}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const ctx: AdminCtx = { publish, publishState, toast, email: session.user.email ?? "" };
  if (isPrint) return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;

  const active = (href: string) => (href === "/admin/" ? path === "/admin/" || path === "/admin" : path.startsWith(href));
  const productActive = ["/admin/product", "/admin/collection", "/admin/inventory"].some((p) => path.startsWith(p));

  return (
    <Ctx.Provider value={ctx}>
      <div className="adm">
        <header className="adm-top">
          <Link href="/admin/" className="adm-brand">
            <span className="adm-brand__mark">Z</span>
            Zalores
          </Link>
          <form
            style={{ flex: 1, display: "flex" }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!q.trim()) return;
              const dest = /^zl-?\d+/i.test(q.trim()) || /@/.test(q) ? "/admin/orders/" : "/admin/products/";
              router.push(`${dest}?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <input className="adm-topsearch" placeholder="Search orders, products, customers" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="adm-top__right">
            <span className={`adm-publish${publishState === "building" ? " busy" : ""}`}>
              {publishState === "building" ? "Updating storefront…" : "Storefront up to date"}
            </span>
            <span className="adm-avatar" title={ctx.email}>
              {ctx.email.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="adm-body">
          <aside className="adm-side">
            <nav>
              {NAV.map((n) => (
                <div key={n.href}>
                  <Link
                    href={n.href}
                    className={`adm-nav${active(n.href) && !(n.href === "/admin/products/" && path.startsWith("/admin/inventory")) ? " active" : ""}`}
                  >
                    <Icon d={n.icon} />
                    {n.label}
                    {n.count && pending > 0 && <span className="adm-nav__count">{pending}</span>}
                  </Link>
                  {n.sub &&
                    (active(n.href) || productActive) &&
                    n.sub.map((s) => (
                      <Link key={s.href} href={s.href} className={`adm-nav adm-nav--sub${path.startsWith(s.href) ? " active" : ""}`}>
                        {s.label}
                      </Link>
                    ))}
                </div>
              ))}
              <div className="adm-side__label">Sales channels</div>
              <a href="/" target="_blank" rel="noreferrer" className="adm-nav">
                <Icon d={I.store} />
                Online Store
              </a>
            </nav>
            <div className="adm-side__foot">
              <Link href="/admin/settings/" className={`adm-nav${active("/admin/settings/") ? " active" : ""}`}>
                <Icon d={I.settings} />
                Settings
              </Link>
              <button
                type="button"
                className="adm-nav"
                onClick={async () => {
                  await supabase?.auth.signOut();
                  router.replace("/admin/login/");
                }}
              >
                <Icon d={I.logout} />
                Log out
              </button>
            </div>
          </aside>
          <main className="adm-main">{children}</main>
        </div>
        {toastMsg && <div className={`adm-toast${toastMsg.err ? " err" : ""}`}>{toastMsg.msg}</div>}
      </div>
    </Ctx.Provider>
  );
}
