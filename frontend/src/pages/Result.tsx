import { useLocation, useNavigate } from "react-router-dom";
import type { Language } from "../App";
import type { AnalyzeResponse } from "../types";
import FallbackResult from "../components/FallbackResult";
import Footer from "../components/Footer";

interface ResultProps {
  language: Language;
}

export default function Result({ language }: ResultProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as AnalyzeResponse | undefined;

  if (!result) {
    navigate("/");
    return null;
  }

  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-500 hover:text-primary mb-6 flex items-center gap-1"
        >
          ← {language === "en" ? "Back" : "वापस"}
        </button>

        {result.fallback ? (
          <FallbackResult
            message={result.fallback_message || ""}
            language={language}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-500">
              {language === "en" ? "Analysis loaded." : "विश्लेषण लोड हुआ।"}
            </p>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
          {result.disclaimer}
        </p>
      </main>
      <Footer language={language} />
    </>
  );
}
