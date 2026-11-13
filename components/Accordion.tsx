"use client";

import { useState, type ReactNode } from "react";
import { IconCaret } from "./Icons";

export default function Accordion({
  items,
}: {
  items: {
    title: string;
    body: ReactNode;
    icon?: ReactNode;
  }[];
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className={`accordion${open === i ? " open" : ""}`}>
          <button
            type="button"
            className="accordion__summary"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.icon}
            <span>{item.title}</span>
            <IconCaret className="accordion__caret" />
          </button>
          {open === i && <div className="accordion__content rte">{item.body}</div>}
        </div>
      ))}
    </div>
  );
}
