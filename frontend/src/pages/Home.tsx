import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SituationInput from "../components/SituationInput";
import ExampleSituations from "../components/ExampleSituations";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { analyzeText } from "../api";

const LOADING_STAGES = [
  "Classifying your situation...",
  "Searching 1,420+ law sections...",
  "Matching relevant provisions...",
  "Generating your rights and remedies...",
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "You describe it",
    body: "No legal jargon needed. Just tell us what happened in plain language.",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "We find the law",
    body: "Haqq searches 1,420 sections across 8 central Indian acts to find what applies to you.",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "You know your rights",
    body: "Get your rights, remedies, and a step-by-step action plan — cited and verified.",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [stageIdx, setStageIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      setStageIdx(0);
      return;
    }
    const t = setInterval(
      () => setStageIdx((i) => Math.min(i + 1, LOADING_STAGES.length - 1)),
      3200,
    );
    return () => clearInterval(t);
  }, [loading]);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      navigate("/result", { state: { result, query: text } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main>
        {/* Hero */}
        <div className="bg-surface-2 border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 pt-14 pb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-accent bg-accent-light border border-accent/20 px-3 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Free · No signup · Instant
            </span>

            <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-4">
              Your rights,
              <br />
              <span className="text-accent">without the bill.</span>
            </h1>

            <p className="text-lg text-ink-3 max-w-xl leading-relaxed mb-8">
              Most people don't know their legal rights until it's too late.
              Haqq reads Indian law, finds what applies, and tells you exactly
              what to do — in plain language, in seconds.
            </p>

            <div className="max-w-2xl">
              {loading ? (
                <div className="border border-border rounded-xl p-5 bg-surface-2 animate-fade-up">
                  <div className="flex items-center gap-2.5 mb-3">
                    <svg
                      className="animate-spin shrink-0 text-accent"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.25"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-ink">
                      {LOADING_STAGES[stageIdx]}
                    </span>
                  </div>
                  <p className="text-xs text-ink-3/50 line-clamp-1 mb-4">
                    {inputText}
                  </p>
                  <div className="flex gap-1.5">
                    {LOADING_STAGES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-colors duration-700 ${
                          i <= stageIdx ? "bg-accent" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <SituationInput
                    onSubmit={handleSubmit}
                    loading={loading}
                    value={inputText}
                    onChange={setInputText}
                  />
                  <ExampleSituations onSelect={(text) => setInputText(text)} />
                  {error && (
                    <p className="mt-3 text-sm text-red-500">{error}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-3/40">
                    Ctrl+Enter to submit
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-bg border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-3 mb-6">
              How it works
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {HOW_IT_WORKS.map((item) => (
                <div
                  key={item.num}
                  className="bg-surface-2 rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3 group-hover:bg-accent/15 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-ink mb-1.5 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-sm text-ink-3 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Laws covered */}
        <div className="bg-bg border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-3 mb-4">
              Laws covered
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Payment of Wages Act, 1936",
                "Right to Information Act, 2005",
                "Consumer Protection Act, 2019",
                "POSH Act, 2013",
                "Indian Penal Code, 1860",
                "CrPC, 1973",
                "Negotiable Instruments Act, 1881",
                "Delhi Rent Control Act, 1958",
              ].map((act) => (
                <span
                  key={act}
                  className="text-xs border border-border rounded-lg px-3 py-1.5 text-ink-3 bg-surface-2 hover:border-accent/30 hover:text-accent transition-all cursor-default"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-bg w-full">
          <div className="max-w-4xl mx-auto px-6">
            <FAQ />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
