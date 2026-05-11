import type { Language } from "../App";

interface FallbackResultProps {
  message: string;
  language: Language;
}

export default function FallbackResult({
  message,
  language,
}: FallbackResultProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-border-2" />
        <span className="text-sm font-medium text-ink-3">
          {language === "en" ? "Low coverage" : "कम कवरेज"}
        </span>
      </div>
      <div className="border border-border rounded-xl p-6 bg-surface-2">
        <h2 className="text-base font-semibold text-ink mb-4">
          {language === "en"
            ? "Your situation may involve laws not yet in our database."
            : "आपकी स्थिति में ऐसे कानून शामिल हो सकते हैं जो अभी हमारे डेटाबेस में नहीं हैं।"}
        </h2>
        <h3 className="text-sm font-semibold text-ink-2 mb-3">
          {language === "en"
            ? "What you can do right now:"
            : "आप अभी क्या कर सकते हैं:"}
        </h3>
        <div className="space-y-2">
          {message
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className="text-sm text-ink-3">
                {line}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
