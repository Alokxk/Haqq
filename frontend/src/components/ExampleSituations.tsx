import { useEffect, useState } from "react";
import type { Language } from "../App";
import type { Example } from "../types";
import { getExamples } from "../api";

interface ExampleSituationsProps {
  language: Language;
  onSelect: (text: string) => void;
}

const LABEL = {
  en: "Or try an example:",
  hi: "या एक उदाहरण आज़माएं:",
};

export default function ExampleSituations({
  language,
  onSelect,
}: ExampleSituationsProps) {
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    getExamples()
      .then((data) => setExamples(data.examples))
      .catch(() => {});
  }, []);

  if (examples.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-500 mb-3">{LABEL[language]}</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelect(example.text)}
            className="text-sm border border-gray-300 rounded-full px-3 py-1.5 text-gray-700 hover:border-primary hover:text-primary transition-colors"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
