import { useState } from "react";
import type { Language } from "../App";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_CONTENT: Record<Language, FAQItem[]> = {
  en: [
    {
      question: "Is this free?",
      answer: "Yes, always. Haqq is free for everyone.",
    },
    {
      question: "Can I trust this?",
      answer:
        "Every answer cites the exact law section with a direct link to indiacode.nic.in. Verify it yourself.",
    },
    {
      question: "Is this a lawyer replacement?",
      answer:
        "No. For court proceedings, consult a registered advocate. Haqq helps you understand your rights and take the first step.",
    },
    {
      question: "What if my state isn't covered?",
      answer:
        "Central acts apply everywhere in India. State-specific laws are ongoing work.",
    },
  ],
  hi: [
    {
      question: "क्या यह मुफ्त है?",
      answer: "हां, हमेशा। Haqq सभी के लिए मुफ्त है।",
    },
    {
      question: "क्या मैं इस पर भरोसा कर सकता हूं?",
      answer:
        "हर जवाब सटीक कानून धारा का हवाला देता है और indiacode.nic.in का सीधा लिंक देता है। खुद सत्यापित करें।",
    },
    {
      question: "क्या यह वकील की जगह है?",
      answer:
        "नहीं। अदालती कार्यवाही के लिए किसी पंजीकृत वकील से सलाह लें। Haqq आपको अपने अधिकार समझने और पहला कदम उठाने में मदद करता है।",
    },
    {
      question: "अगर मेरा राज्य कवर नहीं है?",
      answer:
        "केंद्रीय कानून पूरे भारत में लागू होते हैं। राज्य-विशिष्ट कानून जारी काम है।",
    },
  ],
};

interface FAQProps {
  language: Language;
}

export default function FAQ({ language }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = FAQ_CONTENT[language];

  return (
    <div className="mt-16">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {language === "en"
          ? "Frequently Asked Questions"
          : "अक्सर पूछे जाने वाले प्रश्न"}
      </h2>
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {items.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left py-4 flex justify-between items-center text-sm font-medium text-gray-900 hover:text-primary"
            >
              {item.question}
              <span className="ml-4 text-gray-400">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <p className="pb-4 text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
