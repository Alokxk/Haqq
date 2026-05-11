import { useState } from "react";
import type { Language } from "../App";

interface ShareButtonProps {
  url: string;
  language: Language;
}

export default function ShareButton({ url, language }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm border border-border rounded-lg px-3 py-1.5 text-ink-3 hover:border-accent/40 hover:text-accent transition-colors bg-surface-2"
    >
      {copied
        ? language === "en"
          ? "✓ Copied"
          : "✓ कॉपी हुआ"
        : language === "en"
          ? "Share →"
          : "शेयर करें →"}
    </button>
  );
}
