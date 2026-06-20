import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import type { AnalyzeResponse, Law } from "../types";
import FallbackResult from "../components/FallbackResult";
import Footer from "../components/Footer";
import ShareButton from "../components/ShareButton";
import { getSituation, submitFeedback } from "../api";

const DOMAIN_LABELS: Record<string, string> = {
  labour: "Labour & Employment",
  wages: "Labour & Employment",
  consumer: "Consumer Rights",
  rti: "Right to Information",
  criminal: "Criminal Law",
  rent: "Rent & Housing",
  property: "Rent & Housing",
  posh: "Workplace Harassment",
  cheque: "Cheque Bounce",
  cheque_bounce: "Cheque Bounce",
  negotiable: "Cheque Bounce",
  police_complaint: "Police & FIR",
  other: "General Legal",
};

const formatDomain = (domain: string | undefined) =>
  domain
    ? (DOMAIN_LABELS[domain.toLowerCase()] ??
      domain.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    : "General Legal";

function groupLawsByAct(laws: Law[]): Record<string, Law[]> {
  return laws.reduce(
    (acc, law) => {
      if (!acc[law.act]) acc[law.act] = [];
      acc[law.act].push(law);
      return acc;
    },
    {} as Record<string, Law[]>,
  );
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState<AnalyzeResponse | undefined>(
    location.state?.result,
  );
  const [loading, setLoading] = useState(!location.state?.result && !!id);
  const [feedbackGiven, setFeedbackGiven] = useState<1 | -1 | null>(null);
  const [checked, setChecked] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    if (!loading && !result) navigate("/");
  }, [loading, result, navigate]);

  const handleFeedback = async (rating: 1 | -1) => {
    if (!result) return;
    try {
      await submitFeedback(result.situation_id, rating);
      setFeedbackGiven(rating);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCheck = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-28 bg-gray-100 rounded-2xl" />
          <div className="h-36 bg-gray-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!result) return null;

  if (result.fallback) {
    return (
      <>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <FallbackResult message={result.fallback_message || ""} />
          <p className="mt-8 text-xs text-gray-500 border-t border-gray-200 pt-4">
            {result.disclaimer}
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const groupedLaws = groupLawsByAct(result.laws ?? []);

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-12">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <ShareButton url={result.share_url} />
        </div>

        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2 sm:mb-3">
            {formatDomain(result.domain)}
          </span>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
            Your rights & remedies
          </h1>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-8">
          {/* Left — Rights + Remedies */}
          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            {result.rights && result.rights.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5 sm:mb-3">
                  Your Rights
                </h2>
                <div className="space-y-2">
                  {result.rights.map((right, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {right}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.remedies && result.remedies.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5 sm:mb-3">
                  What You Can Do
                </h2>
                <div className="space-y-2">
                  {result.remedies.map((remedy) => (
                    <div
                      key={remedy.step}
                      className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 flex gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {remedy.step}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {remedy.action}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {remedy.details}
                        </p>
                        {remedy.timeline && (
                          <p className="text-xs text-blue-600 font-medium mt-2">
                            {remedy.timeline}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — Laws + Evidence */}
          <div className="lg:col-span-2 space-y-5">
            {Object.keys(groupedLaws).length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5 sm:mb-3">
                  The Law Says
                </h2>
                <div className="space-y-2">
                  {Object.entries(groupedLaws).map(([act, laws]) => (
                    <div
                      key={act}
                      className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4"
                    >
                      <p className="text-xs font-semibold text-gray-800 mb-2.5">
                        {act}
                      </p>
                      <div className="space-y-2">
                        {laws.map((law, i) => (
                          <div
                            key={i}
                            className="flex items-start justify-between gap-2"
                          >
                            <p className="text-xs text-gray-600 leading-snug">
                              <span className="font-semibold text-gray-800">
                                § {law.section}
                              </span>
                              {law.title ? ` — ${law.title}` : ""}
                            </p>
                            {law.indiacode_url && (
                              <a
                                href={law.indiacode_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-700 shrink-0 transition-colors"
                              >
                                ↗
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.evidence_checklist &&
              result.evidence_checklist.length > 0 && (
                <section>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2.5 sm:mb-3">
                    Evidence to Preserve
                  </h2>
                  <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 space-y-3">
                    {result.evidence_checklist.map((item, i) => {
                      const done = checked.has(i);
                      return (
                        <div
                          key={i}
                          onClick={() => toggleCheck(i)}
                          className="flex items-start gap-2.5 cursor-pointer group"
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
                          >
                            {done && (
                              <Check size={9} stroke="white" strokeWidth={3} />
                            )}
                          </span>
                          <span
                            className={`text-xs leading-relaxed transition-colors ${done ? "text-gray-400 line-through" : "text-gray-600"}`}
                          >
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
          </div>
        </div>

        {/* Bottom — feedback + disclaimer */}
        <div className="mt-8 pt-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-500 max-w-md leading-relaxed">
              {result.disclaimer}
            </p>
            {feedbackGiven ? (
              <p className="text-sm text-blue-600 font-medium shrink-0">
                Thanks for the feedback!
              </p>
            ) : (
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-gray-500">Was this helpful?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(1)}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:border-green-400 hover:text-green-600 transition-all bg-white"
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={() => handleFeedback(-1)}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 hover:border-red-300 hover:text-red-500 transition-all bg-white"
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
