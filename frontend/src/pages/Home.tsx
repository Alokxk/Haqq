import type { Language } from "../App";

interface HomeProps {
  language: Language;
}

export default function Home({ language }: HomeProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">
        {language === "en" ? "Know your rights" : "अपने अधिकार जानें"}
      </h1>
    </div>
  );
}
