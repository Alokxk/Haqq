interface FallbackResultProps {
  message: string;
}

export default function FallbackResult({ message }: FallbackResultProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-border-2" />
        <span className="text-sm font-medium text-ink-3">Low coverage</span>
      </div>
      <div className="border border-border rounded-xl p-6 bg-surface-2">
        <h2 className="text-base font-semibold text-ink mb-4">
          Your situation may involve laws not yet in our database.
        </h2>
        <h3 className="text-sm font-semibold text-ink-2 mb-3">
          What you can do right now:
        </h3>
        <div className="space-y-2">
          {message
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className="text-sm text-ink-3">
                {line}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
