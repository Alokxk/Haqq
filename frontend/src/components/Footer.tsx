export default function Footer({ language }: { language: "en" | "hi" }) {
  return (
    <footer className="border-t border-border bg-surface-2 w-full">
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 2V14M13 2V14M3 8H13"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-ink">Haqq</span>
            <span className="text-border-2 hidden sm:block">·</span>
            <span className="text-xs text-ink-3 hidden sm:block">
              {language === "en"
                ? "The law is public. A lawyer isn't free. Haqq is."
                : "कानून सार्वजनिक है। वकील मुफ्त नहीं। Haqq है।"}
            </span>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <p className="text-xs text-ink-3">
              {language === "en"
                ? "Law text from indiacode.nic.in — Government of India"
                : "कानूनी पाठ indiacode.nic.in से — भारत सरकार"}
            </p>
            <p className="text-xs text-ink-3/50">
              {language === "en"
                ? "Not legal advice. Consult a registered advocate for court matters."
                : "यह कानूनी सलाह नहीं है।"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
