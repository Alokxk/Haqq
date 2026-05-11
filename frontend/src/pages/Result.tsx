import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Language } from "../App";
import type { AnalyzeResponse } from "../types";
import ConfidenceBadge from "../components/ConfidenceBadge";
import LawCitation from "../components/LawCitation";
import FallbackResult from "../components/FallbackResult";
import Footer from "../components/Footer";
import EvidenceChecklist from "../components/EvidenceChecklist";
import ShareButton from "../components/ShareButton";
import NoticeForm from "../components/NoticeForm";
import { submitFeedback } from "../api";

interface ResultProps {
  language: Language;
}

export default function Result({ language }: ResultProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as AnalyzeResponse | undefined;
  const [feedbackGiven, setFeedbackGiven] = useState<1 | -1 | null>(null);

  if (!result) {
    navigate("/");
    return null;
  }

  const handleFeedback = async (rating: 1 | -1) => {
    try {
      await submitFeedback(result.situation_id, rating);
      setFeedbackGiven(rating);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (result.fallback) {
    return (
      <>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-ink-3 hover:text-ink mb-6 flex items-center gap-1 transition-colors"
          >
            ← {language === "en" ? "Back" : "वापस"}
          </button>
          <FallbackResult
            message={result.fallback_message || ""}
            language={language}
          />
          <p className="mt-8 text-xs text-ink-3 border-t border-border pt-4">
            {result.disclaimer}
          </p>
        </main>
        <Footer language={language} />
      </>
    );
  }

  return (
    <>
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-ink-3 hover:text-ink flex items-center gap-1 transition-colors"
          >
            ← {language === "en" ? "Back" : "वापस"}
          </button>
          <ShareButton url={result.share_url} language={language} />
        </div>

        <ConfidenceBadge
          confidence={result.confidence}
          reason={result.confidence_reason}
          language={language}
        />

        {/* Rights */}
        {result.rights && result.rights.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
              {language === "en" ? "Your Rights" : "आपके अधिकार"}
            </h2>
            <div className="border border-border rounded-xl p-4 bg-surface-2 space-y-3">
              {result.rights.map((right, i) => (
                <p key={i} className="text-sm text-ink-2 leading-relaxed">
                  {right}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Remedies */}
        {result.remedies && result.remedies.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
              {language === "en" ? "What You Can Do" : "आप क्या कर सकते हैं"}
            </h2>
            <div className="space-y-3">
              {result.remedies.map((remedy) => (
                <div
                  key={remedy.step}
                  className="border border-border rounded-xl p-4 bg-surface-2 hover:border-accent/30 transition-colors"
                >
                  <p className="text-sm font-semibold text-ink mb-1">
                    Step {remedy.step} — {remedy.action}
                  </p>
                  <p className="text-sm text-ink-3 leading-relaxed mb-2">
                    {remedy.details}
                  </p>
                  <span className="text-xs text-accent font-medium">
                    {remedy.timeline}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Laws */}
        {result.laws && result.laws.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
              {language === "en" ? "The Law Says" : "कानून कहता है"}
            </h2>
            {result.laws.map((law, i) => (
              <LawCitation key={i} law={law} language={language} />
            ))}
          </section>
        )}

        <EvidenceChecklist
          items={result.evidence_checklist}
          language={language}
        />

        <NoticeForm situationId={result.situation_id} language={language} />

        {/* Similar situations */}
        {result.similar_situations && result.similar_situations.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3">
              {language === "en" ? "Similar Situations" : "समान स्थितियां"}
            </h2>
            <div className="space-y-2">
              {result.similar_situations.map((s) => (
                <a
                  key={s.situation_id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border border-border rounded-xl p-4 bg-surface-2 hover:border-accent/30 transition-colors group"
                >
                  <div>
                    <p className="text-sm text-ink-2 group-hover:text-ink transition-colors">
                      {s.summary}
                    </p>
                    <p className="text-xs text-ink-3 mt-0.5 capitalize">
                      {s.domain}
                    </p>
                  </div>
                  <span className="text-accent text-sm shrink-0 ml-4">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Feedback */}
        <section className="mb-8 border-t border-border pt-6">
          <p className="text-sm font-medium text-ink-2 mb-3">
            {language === "en" ? "Was this helpful?" : "क्या यह मददगार था?"}
          </p>
          {feedbackGiven ? (
            <p className="text-sm text-accent font-medium">
              {language === "en"
                ? "Thanks for your feedback."
                : "आपके फीडबैक के लिए धन्यवाद।"}
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback(1)}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm text-ink-3 hover:border-green-400 hover:text-green-600 transition-all bg-surface-2"
              >
                👍 {language === "en" ? "Helpful" : "मददगार"}
              </button>
              <button
                onClick={() => handleFeedback(-1)}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm text-ink-3 hover:border-red-400 hover:text-red-500 transition-all bg-surface-2"
              >
                👎 {language === "en" ? "Not helpful" : "मददगार नहीं"}
              </button>
            </div>
          )}
        </section>

        <p className="text-xs text-ink-3 border-t border-border pt-4">
          {result.disclaimer}
        </p>
      </main>
      <Footer language={language} />
    </>
  );
}
