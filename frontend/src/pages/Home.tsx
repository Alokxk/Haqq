import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SituationInput from "../components/SituationInput";
import ExampleSituations from "../components/ExampleSituations";
import Footer from "../components/Footer";
import { analyzeStream } from "../api";

const LOADING_STAGES = [
  "Classifying your situation...",
  "Searching 1,420+ law sections...",
  "Matching relevant provisions...",
  "Generating your rights and remedies...",
];

const ACTS = [
  "Payment of Wages Act, 1936",
  "Right to Information Act, 2005",
  "Consumer Protection Act, 2019",
  "POSH Act, 2013",
  "Indian Penal Code, 1860",
  "CrPC, 1973",
  "Negotiable Instruments Act, 1881",
  "Delhi Rent Control Act, 1958",
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [stageIdx, setStageIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(
      () => setStageIdx((i) => Math.min(i + 1, LOADING_STAGES.length - 1)),
      3200,
    );
    return () => clearInterval(t);
  }, [loading]);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setError(null);
    setStageIdx(0);
    try {
      const result = await analyzeStream(text, () => {
        setStageIdx(LOADING_STAGES.length - 1);
      });
      navigate("/result", { state: { result, query: text } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStageIdx(0);
    }
  };

  return (
    <>
      <main>
        {/* Hero */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">
                Free · No signup · Instant
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
                Know your legal rights.
                <br />
                <span className="text-blue-600">In plain language.</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-8 max-w-lg">
                Describe your situation and Haqq finds the exact Indian law that
                applies — with citations, remedies, and a step-by-step action
                plan.
              </p>

              {loading ? (
                <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Loader2
                      size={14}
                      className="animate-spin shrink-0 text-blue-600"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      {LOADING_STAGES[stageIdx]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-4">
                    {inputText}
                  </p>
                  <div className="flex gap-1.5">
                    {LOADING_STAGES.map((_, i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-700 ${
                          i <= stageIdx ? "bg-blue-600" : "bg-gray-200"
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
                  <p className="mt-2 text-xs text-gray-400">
                    Ctrl+Enter to submit
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Laws covered */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">
            Laws covered
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTS.map((act) => (
              <span
                key={act}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white hover:border-blue-300 hover:text-blue-600 transition-all cursor-default"
              >
                {act}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-6">
              How it works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
              {[
                {
                  n: "01",
                  title: "Describe it",
                  body: "No legal jargon needed. Just tell us what happened in plain language.",
                },
                {
                  n: "02",
                  title: "We find the law",
                  body: "Haqq searches 1,420 sections across 8 central Indian acts to find what applies.",
                },
                {
                  n: "03",
                  title: "Know your rights",
                  body: "Get rights, remedies, and a step-by-step action plan — cited from official sources.",
                },
              ].map((item) => (
                <div key={item.n} className="bg-white p-5 sm:p-6">
                  <p className="text-xs font-bold text-blue-600 mb-2">
                    {item.n}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mb-1.5">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
