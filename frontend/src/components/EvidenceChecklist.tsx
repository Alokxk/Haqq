import type { Language } from "../App";

interface EvidenceChecklistProps {
  items: string[];
  language: Language;
}

export default function EvidenceChecklist({
  items,
  language,
}: EvidenceChecklistProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
        {language === "en" ? "Evidence to Preserve" : "सबूत सुरक्षित रखें"}
      </h2>
      <div className="border border-border rounded-xl p-4 bg-surface-2 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-ink-2">
            <span className="mt-0.5 text-border-2 shrink-0">□</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
