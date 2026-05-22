import type { Law } from "../types";

interface LawCitationProps {
  law: Law;
}

export default function LawCitation({ law }: LawCitationProps) {
  return (
    <div className="border border-border rounded-xl p-4 mb-3 bg-surface-2 hover:border-accent/30 transition-colors">
      <p className="text-sm font-semibold text-ink">{law.act}</p>
      <p className="text-xs text-ink-3 mt-0.5">
        Section {law.section} — {law.title}
      </p>
      <p className="text-sm text-ink-2 mt-2 leading-relaxed">{law.summary}</p>
      {law.possibly_amended && (
        <p className="text-xs text-amber-600 mt-2">
          ⚠ Last verified: {law.last_updated}. Verify current text at indiacode.nic.in
        </p>
      )}
      {law.indiacode_url && (
        <a
          href={law.indiacode_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline mt-2 inline-block"
        >
          ↗ View on indiacode.nic.in
        </a>
      )}
    </div>
  );
}
