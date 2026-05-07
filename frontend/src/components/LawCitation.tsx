import type { Law } from "../types";
import type { Language } from "../App";

interface LawCitationProps {
  law: Law;
  language: Language;
}

export default function LawCitation({ law, language }: LawCitationProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{law.act}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Section {law.section} — {law.title}
          </p>
          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
            {law.summary}
          </p>
          {law.possibly_amended && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠{" "}
              {language === "en"
                ? `Last verified: ${law.last_updated}. Verify current text at indiacode.nic.in`
                : `अंतिम सत्यापन: ${law.last_updated}। indiacode.nic.in पर वर्तमान पाठ सत्यापित करें`}
            </p>
          )}
        </div>
      </div>

      <a
        href={law.indiacode_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline mt-2 inline-block"
      >
        ↗{" "}
        {language === "en"
          ? "View on indiacode.nic.in"
          : "indiacode.nic.in पर देखें"}
      </a>
    </div>
  );
}
