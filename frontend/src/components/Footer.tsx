import type { Language } from "../App";

interface FooterProps {
  language: Language;
}

export default function Footer({ language }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 mt-16 py-8">
      <div className="max-w-3xl mx-auto px-4 text-center text-xs text-gray-400 space-y-1">
        <p>
          {language === "en"
            ? "Haqq — Built for India. Open source."
            : "Haqq — भारत के लिए बनाया गया। ओपन सोर्स।"}
        </p>
        <p>
          {language === "en"
            ? "Legal text from indiacode.nic.in (Government of India). Public domain."
            : "कानूनी पाठ indiacode.nic.in (भारत सरकार) से। सार्वजनिक डोमेन।"}
        </p>
      </div>
    </footer>
  );
}
