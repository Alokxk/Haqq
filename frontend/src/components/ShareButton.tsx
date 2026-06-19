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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
    >
      {copied ? "✓ Copied" : "Share →"}
    </button>
  );
}
