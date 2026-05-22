import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SituationInput from "../components/SituationInput";
import ExampleSituations from "../components/ExampleSituations";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { analyzeText } from "../api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();

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
              Most people don't know their legal rights until it's too late. Haqq reads Indian law, finds what applies, and tells you exactly what to do — in plain language, in seconds.
            </p>

            <div className="max-w-2xl">
              <p className="text-sm font-medium text-ink-3 mb-2">
                Describe what happened →
              </p>
              <SituationInput
                onSubmit={handleSubmit}
                loading={loading}
                value={inputText}
                onChange={setInputText}
              />
              <ExampleSituations onSelect={(text) => setInputText(text)} />
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <p className="mt-2 text-xs text-ink-3/40">Ctrl+Enter to submit</p>
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
              {[
                {
                  num: "01",
                  title: "You describe it",
                  body: "No legal jargon needed. Just tell us what happened in plain language.",
                },
                {
                  num: "02",
                  title: "We find the law",
                  body: "Haqq searches 1,420 sections across 8 central Indian acts to find what applies to you.",
                },
                {
                  num: "03",
                  title: "You know your rights",
                  body: "Get your rights, remedies, and a step-by-step action plan — cited and verified.",
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="bg-surface-2 rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
                >
                  <span className="text-2xl font-bold text-accent/20 block mb-3 group-hover:text-accent/35 transition-colors">
                    {item.num}
                  </span>
                  <h3 className="font-semibold text-ink mb-1.5 text-sm">{item.title}</h3>
                  <p className="text-sm text-ink-3 leading-relaxed">{item.body}</p>
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
