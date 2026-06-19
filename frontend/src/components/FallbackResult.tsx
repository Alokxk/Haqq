interface FallbackResultProps {
  message: string;
}

export default function FallbackResult({ message }: FallbackResultProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Your situation may involve laws not yet in our database.
      </h2>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        What you can do right now:
      </h3>
      <div className="space-y-2">
        {message
          .split("\n")
          .filter(Boolean)
          .map((line, i) => (
            <p key={i} className="text-sm text-gray-600">
              {line}
            </p>
          ))}
      </div>
    </div>
  );
}
