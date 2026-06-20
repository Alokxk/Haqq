import { useEffect, useState } from "react";
import type { Example } from "../types";
import { getExamples } from "../api";

interface ExampleSituationsProps {
  onSelect: (text: string) => void;
}

export default function ExampleSituations({
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
    <div className="mt-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        Try an example
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelect(example.text)}
            className="text-[11px] sm:text-xs border border-gray-200 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-gray-600 bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
