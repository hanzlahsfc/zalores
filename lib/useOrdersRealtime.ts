"use client";

import { useEffect } from "react";
import { supabase, type OrderRow } from "@/lib/supabase";

interface Handlers {
  insert?: (order: OrderRow) => void;
  update?: (order: OrderRow) => void;
  remove?: (id: number) => void;
}

/** Subscribe the admin to postgres changes on zl_orders (RLS keeps it admin-only). */
export function useOrdersRealtime(handlers: Handlers) {
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel("zl-orders-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "zl_orders" }, (p) =>
        handlers.insert?.(p.new as OrderRow),
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "zl_orders" }, (p) =>
        handlers.update?.(p.new as OrderRow),
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "zl_orders" }, (p) =>
        handlers.remove?.(Number((p.old as { id: number }).id)),
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
