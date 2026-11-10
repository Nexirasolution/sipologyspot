// components/ProductAccordion.jsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProductAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mt-8 divide-y divide-gold/20 border-y border-gold/20">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.title}>
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="font-display text-sm font-semibold text-forest md:text-base">
                {item.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-forest transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid overflow-hidden transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="leading-relaxed text-ink/80">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}