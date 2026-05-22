import { useState } from "react";

interface ShareButtonProps {
  url: string;
}

export default function ShareButton({ url }: ShareButtonProps) {
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
      {copied ? "✓ Copied" : "Share →"}
    </button>
  );
}
