"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type FaqGroup = {
  category: string;
  items: { q: string; a: string }[];
};

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  // Key = `${groupIndex}-${itemIndex}`; only one open at a time.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      {groups.map((group, gi) => (
        <section key={group.category}>
          <h2 className="mb-4 text-[0.72rem] uppercase tracking-[0.28em] text-gold">
            {group.category}
          </h2>
          <div className="divide-y divide-hairline overflow-hidden rounded-[var(--radius-luxe)] border border-hairline">
            {group.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = open === key;
              return (
                <div key={item.q} className="bg-charcoal">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-charcoal-2"
                  >
                    <span className="text-[0.95rem] text-cream">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gold transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                          {item.a}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
