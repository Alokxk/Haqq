import type { Language } from "../App";

interface SituationInputProps {
  language: Language;
  onSubmit: (text: string) => void;
  loading: boolean;
  value: string;
  onChange: (text: string) => void;
}

const PLACEHOLDER = {
  en: "e.g. My landlord hasn't returned my security deposit after 3 months. He's not responding to calls...",
  hi: "जैसे: मकान मालिक ने 3 महीने बाद भी सिक्योरिटी डिपॉजिट वापस नहीं किया...",
};

export default function SituationInput({
  language,
  onSubmit,
  loading,
  value,
  onChange,
}: SituationInputProps) {
  const handleSubmit = () => {
    if (value.trim().length < 10) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleSubmit();
  };

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER[language]}
        rows={4}
        disabled={loading}
        className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder-ink-3/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 resize-none transition-all"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || value.trim().length < 10}
        className="mt-3 w-full bg-accent text-white font-semibold py-3 px-6 rounded-xl hover:bg-accent-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wide"
      >
        {loading
          ? language === "en"
            ? "Analysing your situation..."
            : "विश्लेषण हो रहा है..."
          : language === "en"
            ? "Know My Rights →"
            : "मेरे अधिकार जानें →"}
      </button>
    </div>
  );
}
