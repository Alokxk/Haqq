import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { AnalyzeResponse } from "../types";
import ConfidenceBadge from "../components/ConfidenceBadge";
import LawCitation from "../components/LawCitation";
import FallbackResult from "../components/FallbackResult";
import Footer from "../components/Footer";
import EvidenceChecklist from "../components/EvidenceChecklist";
import ShareButton from "../components/ShareButton";
import { getSituation, submitFeedback } from "../api";

const DOMAIN_LABELS: Record<string, string> = {
  labour: "Labour & Employment",
  wages: "Labour & Employment",
  consumer: "Consumer Rights",
  rti: "Right to Information",
  criminal: "Criminal Law",
  rent: "Rent & Housing",
  posh: "Workplace Harassment",
  cheque: "Cheque Bounce",
  negotiable: "Cheque Bounce",
  other: "General Legal",
};

const formatDomain = (domain: string | undefined) =>
  domain
    ? (DOMAIN_LABELS[domain.toLowerCase()] ??
      domain.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    : "General Legal";

const ThumbUp = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 10v12" />
    <path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const ThumbDown = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 14V2" />
    <path d="M9 18.12L10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<AnalyzeResponse | undefined>(
    location.state?.result,
  );
  const [loading, setLoading] = useState(!location.state?.result && !!id);
  const [feedbackGiven, setFeedbackGiven] = useState<1 | -1 | null>(null);

  useEffect(() => {
    if (!location.state?.result && id) {
      getSituation(id)
        .then((data) => setResult(data))
        .catch(() => navigate("/"))
        .finally(() => setLoading(false));
    }
  }, [id, location.state?.result, navigate]);

  useEffect(() => {
    if (result) {
      document.title = `${formatDomain(result.domain)} Rights — Haqq`;
      return () => {
        document.title = "Haqq — Know Your Legal Rights";
      };
    }
  }, [result]);

  const handleFeedback = async (rating: 1 | -1) => {
    if (!result) return;
    try {
      await submitFeedback(result.situation_id, rating);
      setFeedbackGiven(rating);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="flex justify-between mb-6">
            <div className="h-4 w-16 bg-border rounded" />
            <div className="h-7 w-20 bg-border rounded-lg" />
          </div>
          <div className="h-16 bg-border/50 rounded-xl mb-8" />
          <div className="h-3 w-24 bg-border rounded mb-3" />
          <div className="h-28 bg-border/50 rounded-xl mb-8" />
          <div className="h-3 w-28 bg-border rounded mb-3" />
          <div className="space-y-3 mb-8">
            <div className="h-24 bg-border/50 rounded-xl" />
            <div className="h-24 bg-border/50 rounded-xl" />
          </div>
          <div className="h-3 w-24 bg-border rounded mb-3" />
          <div className="h-20 bg-border/50 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!result) {
    navigate("/");
    return null;
  }

  if (result.fallback) {
    return (
      <>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-ink-3 hover:text-ink mb-6 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <FallbackResult message={result.fallback_message || ""} />
          <p className="mt-8 text-xs text-ink-3 border-t border-border pt-4">
            {result.disclaimer}
          </p>
        </main>
        <Footer />
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
            ← Back
          </button>
          <ShareButton url={result.share_url} />
        </div>

        {/* Classification */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-accent bg-accent-light border border-accent/20 px-2.5 py-1 rounded-full">
            {formatDomain(result.domain)}
          </span>
          {result.sub_domain && result.sub_domain !== "unknown" && (
            <span className="text-xs text-ink-3 capitalize">
              {result.sub_domain.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <ConfidenceBadge
          confidence={result.confidence}
          reason={result.confidence_reason}
        />

        {/* Rights */}
        {result.rights && result.rights.length > 0 && (
          <section className="mb-8 animate-fade-up [animation-delay:0ms]">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3 pl-3 border-l-2 border-accent/30">
              Your Rights
            </h2>
            <div className="border border-border rounded-xl p-4 bg-surface-2 space-y-3">
              {result.rights.map((right, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <p className="text-sm text-ink-2 leading-relaxed">{right}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Remedies */}
        {result.remedies && result.remedies.length > 0 && (
          <section className="mb-8 animate-fade-up [animation-delay:80ms]">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3 pl-3 border-l-2 border-accent/30">
              What You Can Do
            </h2>
            <div className="space-y-3">
              {result.remedies.map((remedy) => (
                <div
                  key={remedy.step}
                  className="border border-border rounded-xl p-4 bg-surface-2 hover:border-accent/30 transition-colors flex gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {remedy.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink mb-1">
                      {remedy.action}
                    </p>
                    <p className="text-sm text-ink-3 leading-relaxed mb-2">
                      {remedy.details}
                    </p>
                    <span className="text-xs text-accent font-medium">
                      {remedy.timeline}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Laws */}
        {result.laws && result.laws.length > 0 && (
          <section className="mb-8 animate-fade-up [animation-delay:160ms]">
            <h2 className="text-xs font-semibold text-ink-3 uppercase tracking-widest mb-3 pl-3 border-l-2 border-accent/30">
              The Law Says
            </h2>
            {result.laws.map((law, i) => (
              <LawCitation key={i} law={law} />
            ))}
          </section>
        )}

        <EvidenceChecklist items={result.evidence_checklist} />

        {/* Feedback */}
        <section className="mb-8 border-t border-border pt-6 animate-fade-up [animation-delay:320ms]">
          <p className="text-sm font-medium text-ink-2 mb-3">
            Was this helpful?
          </p>
          {feedbackGiven ? (
            <p className="text-sm text-accent font-medium">
              Thanks for your feedback.
            </p>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback(1)}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm text-ink-3 hover:border-green-400 hover:text-green-600 transition-all bg-surface-2"
              >
                <ThumbUp />
                Helpful
              </button>
              <button
                onClick={() => handleFeedback(-1)}
                className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm text-ink-3 hover:border-red-400 hover:text-red-500 transition-all bg-surface-2"
              >
                <ThumbDown />
                Not helpful
              </button>
            </div>
          )}
        </section>

        <p className="text-xs text-ink-3 border-t border-border pt-4">
          {result.disclaimer}
        </p>
      </main>
      <Footer />
    </>
  );
}
