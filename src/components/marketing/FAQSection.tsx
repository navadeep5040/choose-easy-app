"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/marketing";

export default function FAQSection({ className = "" }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`max-w-3xl mx-auto px-4 w-full ${className}`}>
      <div className="text-center mb-10 sm:mb-12 reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000">
        <p className="font-mono-label text-secondary text-[10px] uppercase tracking-widest mb-3">FAQ</p>
        <h2 className="font-h1 text-h1 sm:text-[40px] text-on-background mb-3">Common questions</h2>
        <p className="font-body-md text-on-surface-variant text-sm sm:text-base">
          Everything you need to know about AI guidance and live mentorship on Choose Easy.
        </p>
      </div>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="glass-panel rounded-xl border border-white/5 overflow-hidden reveal opacity-0 translate-y-8 blur-sm transition-all duration-1000"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.03] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-h2 text-base sm:text-lg text-on-surface pr-2">{item.q}</span>
                <span
                  className={`material-symbols-outlined text-primary shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>
              {isOpen && (
                <p className="px-4 sm:px-5 pb-4 sm:pb-5 font-body-md text-on-surface-variant text-sm leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
