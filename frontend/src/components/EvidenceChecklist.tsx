import { useState } from "react";
import type { Language } from "../App";

interface EvidenceChecklistProps {
  items: string[];
  language: Language;
}

export default function EvidenceChecklist({
  items,
  language,
}: EvidenceChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  if (!items || items.length === 0) return null;

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3 pl-3 border-l-2 border-accent/30">
        {language === "en" ? "Evidence to Preserve" : "सबूत सुरक्षित रखें"}
      </h2>
      <div className="border border-border rounded-xl p-4 bg-surface-2 space-y-2.5">
        {items.map((item, i) => {
          const done = checked.has(i);
          return (
            <div
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-3 text-sm cursor-pointer group"
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  done
                    ? "bg-accent border-accent"
                    : "border-border-2 group-hover:border-accent/50"
                }`}
              >
                {done && (
                  <svg
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                  >
                    <path
                      d="M1 3.5L3.5 6L8 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={`leading-relaxed transition-colors ${
                  done ? "text-ink-3 line-through" : "text-ink-2"
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
