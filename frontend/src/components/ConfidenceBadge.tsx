import type { Language } from "../App";

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
  reason: string;
  language: Language;
}

const CONFIG = {
  high: {
    label: { en: "High coverage", hi: "उच्च कवरेज" },
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  medium: {
    label: { en: "Medium coverage", hi: "मध्यम कवरेज" },
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  low: {
    label: { en: "Low coverage", hi: "कम कवरेज" },
    bg: "bg-surface-2",
    border: "border-border",
    text: "text-ink-3",
    dot: "bg-border-2",
  },
};

export default function ConfidenceBadge({
  confidence,
  reason,
  language,
}: ConfidenceBadgeProps) {
  const c = CONFIG[confidence];
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 mb-6`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-sm font-semibold ${c.text}`}>
          {c.label[language]}
        </span>
      </div>
      <p className="text-xs text-ink-3 ml-4 leading-relaxed">{reason}</p>
    </div>
  );
}
