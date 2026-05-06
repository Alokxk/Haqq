import { useState } from "react";
import type { Language } from "../App";

interface SituationInputProps {
  language: Language;
  onSubmit: (text: string) => void;
  loading: boolean;
}

const PLACEHOLDER = {
  en: "Describe your situation... e.g. My landlord hasn't returned my security deposit even after 3 months of vacating.",
  hi: "अपनी स्थिति बताएं... जैसे मेरे मकान मालिक ने 3 महीने बाद भी सिक्योरिटी डिपॉजिट वापस नहीं किया।",
};

const BUTTON_TEXT = {
  en: "→ Know My Rights",
  hi: "→ मेरे अधिकार जानें",
};

export default function SituationInput({
  language,
  onSubmit,
  loading,
}: SituationInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim().length < 10) return;
    onSubmit(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleSubmit();
  };

  return (
    <div className="w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER[language]}
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || text.trim().length < 10}
        className="mt-3 w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? language === "en"
            ? "Finding your rights..."
            : "आपके अधिकार खोज रहे हैं..."
          : BUTTON_TEXT[language]}
      </button>
    </div>
  );
}
