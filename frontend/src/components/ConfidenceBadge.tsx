import type { Language } from "../App";

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
  reason: string;
  language: Language;
}

const CONFIG = {
  high: {
    dot: "●",
    color: "#16a34a",
    label: { en: "High coverage", hi: "उच्च कवरेज" },
  },
  medium: {
    dot: "◐",
    color: "#d97706",
    label: { en: "Medium coverage", hi: "मध्यम कवरेज" },
  },
  low: {
    dot: "○",
    color: "#6b7280",
    label: { en: "Low coverage", hi: "कम कवरेज" },
  },
};

export default function ConfidenceBadge({
  confidence,
  reason,
  language,
}: ConfidenceBadgeProps) {
  const config = CONFIG[confidence];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: config.color }} className="text-lg">
          {config.dot}
        </span>
        <span className="text-sm font-semibold" style={{ color: config.color }}>
          {config.label[language]}
        </span>
      </div>
      <p className="text-xs text-gray-500 ml-6">{reason}</p>
    </div>
  );
}
