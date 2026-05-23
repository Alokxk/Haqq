interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
  reason: string;
}

const CONFIG = {
  high: {
    label: "High coverage",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  medium: {
    label: "Medium coverage",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low coverage",
    bg: "bg-surface-2",
    border: "border-border",
    text: "text-ink-3",
    dot: "bg-border-2",
  },
};

export default function ConfidenceBadge({
  confidence,
  reason,
}: ConfidenceBadgeProps) {
  const c = CONFIG[confidence];
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 mb-6`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-sm font-semibold ${c.text}`}>{c.label}</span>
      </div>
      <p className="text-xs text-ink-3 ml-4 leading-relaxed">{reason}</p>
    </div>
  );
}
