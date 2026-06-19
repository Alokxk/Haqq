export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Haqq" className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold text-gray-800">Haqq</span>
          <span className="text-gray-300 hidden sm:block">·</span>
          <span className="text-xs text-gray-500 hidden sm:block">
            The law is public. A lawyer isn't free. Haqq is.
          </span>
        </div>
        <div className="flex flex-col gap-0.5 sm:text-right">
          <p className="text-xs text-gray-500">
            Law text from{" "}
            <a
              href="https://indiacode.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors underline underline-offset-2"
            >
              indiacode.nic.in
            </a>{" "}
            — Government of India
          </p>
          <p className="text-xs text-gray-400">
            Not legal advice. Consult a registered advocate for court matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
