import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Language } from "../App";
import SituationInput from "../components/SituationInput";
import { analyzeText } from "../api";

interface HomeProps {
  language: Language;
}

const HERO = {
  en: {
    title: "Know your legal rights.",
    subtitle: "Free. Instant. In plain Hindi or English.",
  },
  hi: {
    title: "अपने कानूनी अधिकार जानें।",
    subtitle: "मुफ्त। तुरंत। सरल हिंदी या अंग्रेजी में।",
  },
};

export default function Home({ language }: HomeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text, language);
      navigate("/result", { state: { result, query: text } });
    } catch {
      setError(
        language === "en"
          ? "Something went wrong. Please try again."
          : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {HERO[language].title}
        </h1>
        <p className="text-lg text-gray-500">{HERO[language].subtitle}</p>
      </div>

      <SituationInput
        language={language}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {error && (
        <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="mt-6 text-center text-xs text-gray-400">
        <p>
          {language === "en"
            ? "Press Ctrl+Enter to submit"
            : "सबमिट करने के लिए Ctrl+Enter दबाएं"}
        </p>
      </div>
    </main>
  );
}
