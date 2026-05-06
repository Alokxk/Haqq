interface NavbarProps {
  language: "en" | "hi";
  onLanguageToggle: () => void;
}

export default function Navbar({ language, onLanguageToggle }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-primary">
          Haqq
        </a>
        <button
          onClick={onLanguageToggle}
          className="text-sm font-medium text-gray-600 hover:text-primary border border-gray-300 rounded px-3 py-1 transition-colors"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>
    </nav>
  );
}
