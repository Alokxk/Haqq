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
      <h2 className="text-base font-semibold text-gray-900 mb-3 uppercase tracking-wide text-xs">
        {language === "en" ? "Evidence to Preserve" : "सबूत सुरक्षित रखें"}
      </h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 text-gray-400">□</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
