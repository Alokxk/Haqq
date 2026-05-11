import { useState } from "react";
const FAQ_CONTENT = {
  en: [
    {
      q: "Is Haqq actually free?",
      a: "Yes. No sign-up, no payment, no ads. Haqq is free for everyone — always.",
    },
    {
      q: "Can I trust what Haqq tells me?",
      a: "Every answer cites the exact law section with a direct link to indiacode.nic.in — the Government of India's official legal repository. Verify it yourself in 30 seconds.",
    },
    {
      q: "Does this replace a lawyer?",
      a: "No. For court proceedings, hire a registered advocate. Haqq helps you understand your rights so you walk in informed — and don't get taken advantage of.",
    },
    {
      q: "Which laws are covered?",
      a: "RTI Act (2005), Payment of Wages Act (1936), Consumer Protection Act (2019), POSH Act (2013), IPC (1860), CrPC (1973), Negotiable Instruments Act (1881), Delhi Rent Control Act (1958). More being added.",
    },
    {
      q: "What if my situation isn't covered?",
      a: "Haqq will tell you honestly when it doesn't have enough info and will point you to free legal aid services like State Legal Services Authorities.",
    },
  ],
  hi: [
    {
      q: "क्या Haqq सच में मुफ्त है?",
      a: "हां। कोई साइन-अप नहीं, कोई भुगतान नहीं, कोई विज्ञापन नहीं। Haqq हमेशा सभी के लिए मुफ्त रहेगा।",
    },
    {
      q: "क्या Haqq की बात पर भरोसा कर सकते हैं?",
      a: "हर जवाब indiacode.nic.in का सीधा लिंक देता है — भारत सरकार का आधिकारिक कानूनी डेटाबेस। 30 सेकंड में खुद जांचें।",
    },
    {
      q: "क्या यह वकील की जगह है?",
      a: "नहीं। अदालती कार्यवाही के लिए पंजीकृत वकील लें। Haqq आपको अपने अधिकार समझने में मदद करता है।",
    },
    {
      q: "कौन से कानून कवर हैं?",
      a: "RTI, मजदूरी भुगतान, उपभोक्ता संरक्षण, POSH, IPC, CrPC, NIA, DRCA। और कानून जोड़े जा रहे हैं।",
    },
    {
      q: "अगर मेरी स्थिति कवर नहीं है?",
      a: "Haqq ईमानदारी से बताएगा और मुफ्त कानूनी सहायता के लिए सुझाव देगा।",
    },
  ],
};

export default function FAQ({ language }: { language: "en" | "hi" }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = FAQ_CONTENT[language];

  return (
    <div className="py-12">
      <p className="text-xs font-semibold tracking-widest uppercase text-ink-3 mb-6">
        {language === "en" ? "Common questions" : "सामान्य प्रश्न"}
      </p>
      <div className="divide-y divide-border">
        {items.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left py-4 flex justify-between items-start gap-4 group"
            >
              <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors">
                {item.q}
              </span>
              <span
                className="text-ink-3 shrink-0 text-lg leading-none"
                style={{
                  transition: "transform 0.2s",
                  transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  display: "inline-block",
                }}
              >
                +
              </span>
            </button>
            {open === i && (
              <p className="pb-5 text-sm text-ink-3 leading-relaxed max-w-2xl">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
