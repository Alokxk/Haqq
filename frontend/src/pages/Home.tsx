import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Language } from "../App";
import SituationInput from "../components/SituationInput";
import ExampleSituations from "../components/ExampleSituations";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { analyzeText } from "../api";

interface HomeProps {
  language: Language;
}

export default function Home({ language }: HomeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
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
    <>
      <main>
        {/* Hero */}
        <div className="bg-surface-2 border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 pt-14 pb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-accent bg-accent-light border border-accent/20 px-3 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {language === "en"
                ? "Free · No signup · Instant"
                : "मुफ्त · साइनअप नहीं · तुरंत"}
            </span>

            <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-4">
              {language === "en" ? (
                <>
                  Your rights,
                  <br />
                  <span className="text-accent">without the bill.</span>
                </>
              ) : (
                <>
                  आपके अधिकार,
                  <br />
                  <span className="text-accent">बिना किसी फीस के।</span>
                </>
              )}
            </h1>

            <p className="text-lg text-ink-3 max-w-xl leading-relaxed mb-8">
              {language === "en"
                ? "Most people don't know their legal rights until it's too late. Haqq reads Indian law, finds what applies, and tells you exactly what to do — in plain language, in seconds."
                : "ज़्यादातर लोग अपने कानूनी अधिकार तब जानते हैं जब बहुत देर हो जाती है। Haqq कानून पढ़ता है और सेकंडों में बताता है।"}
            </p>

            <div className="max-w-2xl">
              <p className="text-sm font-medium text-ink-3 mb-2">
                {language === "en"
                  ? "Describe what happened →"
                  : "बताएं आपके साथ क्या हुआ →"}
              </p>
              <SituationInput
                language={language}
                onSubmit={handleSubmit}
                loading={loading}
                value={inputText}
                onChange={setInputText}
              />
              <ExampleSituations
                language={language}
                onSelect={(text) => setInputText(text)}
              />
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <p className="mt-2 text-xs text-ink-3/40">
                {language === "en"
                  ? "Ctrl+Enter to submit"
                  : "Ctrl+Enter दबाएं"}
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-bg border-b border-border w-full">
          <div className="max-w-4xl mx-auto px-6 py-10">
            <p className="text-xs font-semibold tracking-widest uppercase text-ink-3 mb-6">
              {language === "en" ? "How it works" : "कैसे काम करता है"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  num: "01",
                  en: {
                    title: "You describe it",
                    body: "No legal jargon needed. Just tell us what happened in plain language.",
                  },
                  hi: {
                    title: "आप बताएं",
                    body: "सरल भाषा में बताएं क्या हुआ। कोई कानूनी शब्दावली नहीं।",
                  },
                },
                {
                  num: "02",
                  en: {
                    title: "We find the law",
                    body: "Haqq searches 1,420 sections across 8 central Indian acts to find what applies to you.",
                  },
                  hi: {
                    title: "हम कानून खोजते हैं",
                    body: "8 केंद्रीय कानूनों की 1,420 धाराओं में खोज करते हैं।",
                  },
                },
                {
                  num: "03",
                  en: {
                    title: "You know your rights",
                    body: "Get your rights, remedies, and a step-by-step action plan — cited and verified.",
                  },
                  hi: {
                    title: "आप अधिकार जानते हैं",
                    body: "अधिकार, उपाय, और चरण-दर-चरण योजना — उद्धृत और सत्यापित।",
                  },
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="bg-surface-2 rounded-xl border border-border p-5 hover:border-accent/30 transition-colors group"
                >
                  <span className="text-2xl font-bold text-accent/20 block mb-3 group-hover:text-accent/35 transition-colors">
                    {item.num}
                  </span>
                  <h3 className="font-semibold text-ink mb-1.5 text-sm">
                    {language === "en" ? item.en.title : item.hi.title}
                  </h3>
                  <p className="text-sm text-ink-3 leading-relaxed">
                    {language === "en" ? item.en.body : item.hi.body}
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
              {language === "en" ? "Laws covered" : "कवर किए गए कानून"}
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
            <FAQ language={language} />
          </div>
        </div>
      </main>

      <Footer language={language} />
    </>
  );
}
