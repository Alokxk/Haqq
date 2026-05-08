import { useLocation, useNavigate } from "react-router-dom";
import type { Language } from "../App";
import type { AnalyzeResponse } from "../types";
import ConfidenceBadge from "../components/ConfidenceBadge";
import LawCitation from "../components/LawCitation";
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

  if (result.fallback) {
    return (
      <>
        <main className="max-w-3xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-primary mb-6 flex items-center gap-1"
          >
            ← {language === "en" ? "Back" : "वापस"}
          </button>
          <FallbackResult
            message={result.fallback_message || ""}
            language={language}
          />
          <p className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
            {result.disclaimer}
          </p>
        </main>
        <Footer language={language} />
      </>
    );
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

        <ConfidenceBadge
          confidence={result.confidence}
          reason={result.confidence_reason}
          language={language}
        />

        {result.rights && result.rights.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 uppercase tracking-wide text-xs">
              {language === "en" ? "Your Rights" : "आपके अधिकार"}
            </h2>
            <ul className="space-y-2">
              {result.rights.map((right, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed">
                  {right}
                </li>
              ))}
            </ul>
          </section>
        )}

        {result.remedies && result.remedies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 uppercase tracking-wide text-xs">
              {language === "en" ? "What You Can Do" : "आप क्या कर सकते हैं"}
            </h2>
            <div className="space-y-3">
              {result.remedies.map((remedy) => (
                <div
                  key={remedy.step}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Step {remedy.step} — {remedy.action}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {remedy.details}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {remedy.timeline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {result.laws && result.laws.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3 uppercase tracking-wide text-xs">
              {language === "en" ? "The Law Says" : "कानून कहता है"}
            </h2>
            {result.laws.map((law, i) => (
              <LawCitation key={i} law={law} language={language} />
            ))}
          </section>
        )}

        <p className="mt-8 text-xs text-gray-400 border-t border-gray-100 pt-4">
          {result.disclaimer}
        </p>
      </main>
      <Footer language={language} />
    </>
  );
}
