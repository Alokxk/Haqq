import type { Language } from "../App";

interface ResultProps {
  language: Language;
}

export default function Result({ language }: ResultProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        {language === "en" ? "Your Rights" : "आपके अधिकार"}
      </h1>
    </div>
  );
}
