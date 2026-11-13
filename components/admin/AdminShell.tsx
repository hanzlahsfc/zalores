"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";

const NAV = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/orders/", label: "Orders" },
  { href: "/admin/products/", label: "Products" },
  { href: "/admin/customers/", label: "Customers" },
  { href: "/admin/discounts/", label: "Discounts" },
  { href: "/admin/settings/", label: "Settings" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const isLogin = path.startsWith("/admin/login");
  const isReceipt = path.startsWith("/admin/receipt");

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
  }, [session, isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (session === undefined) {
    return <div className="adm-splash">Loading admin…</div>;
  }
  if (!session) {
    return <div className="adm-splash">{supabaseConfigured ? "Redirecting to login…" : "Supabase env vars are not configured."}</div>;
  }
  if (isReceipt) return <>{children}</>;

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin/" className="adm-brand">
          Zalores <span>Admin</span>
        </Link>
        <nav>
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`adm-nav${path === n.href ? " active" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="adm-side__foot">
          <a href="/" className="adm-nav" target="_blank" rel="noreferrer">
            View store
          </a>
          <button
            type="button"
            className="adm-nav adm-nav--btn"
            onClick={async () => {
              await supabase?.auth.signOut();
              router.replace("/admin/login/");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
