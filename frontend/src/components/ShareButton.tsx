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
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm border border-gray-300 rounded px-3 py-1.5 text-gray-600 hover:border-primary hover:text-primary transition-colors"
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
