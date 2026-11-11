"use client";

import { useState, type ReactNode } from "react";
import { IconPlus } from "./Icons";

export default function Accordion({
  items,
}: {
  items: { title: string; body: ReactNode }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="accordion">
      {items.map((item, i) => (
        <div key={i} className={`acc-item${open === i ? " open" : ""}`}>
          <button
            className="acc-head"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.title}</span>
            <IconPlus width={16} height={16} className="acc-icon" />
          </button>
          <div className="acc-body">
            <div className="acc-body-inner">{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
