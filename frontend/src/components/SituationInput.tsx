import { Loader2 } from "lucide-react";

interface SituationInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
  value: string;
  onChange: (text: string) => void;
}

const PLACEHOLDER =
  "e.g. My landlord hasn't returned my security deposit after 3 months. He's not responding to calls...";

export default function SituationInput({
  onSubmit,
  loading,
  value,
  onChange,
}: SituationInputProps) {
  const handleSubmit = () => {
    if (value.trim().length < 10) return;
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleSubmit();
  };

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={PLACEHOLDER}
        rows={4}
        disabled={loading}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || value.trim().length < 10}
        className="mt-3 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Analysing...
          </>
        ) : (
          "Know My Rights →"
        )}
      </button>
    </div>
  );
}
