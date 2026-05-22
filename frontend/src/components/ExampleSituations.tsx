import { useEffect, useState } from "react";
import type { Example } from "../types";
import { getExamples } from "../api";

interface ExampleSituationsProps {
  onSelect: (text: string) => void;
}

export default function ExampleSituations({ onSelect }: ExampleSituationsProps) {
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    getExamples()
      .then((data) => setExamples(data.examples))
      .catch(() => {});
  }, []);

  if (examples.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-ink-3/60 uppercase tracking-wider mb-2">
        Try an example
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => onSelect(example.text)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 text-ink-3 bg-bg hover:border-accent/40 hover:text-accent transition-all"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
