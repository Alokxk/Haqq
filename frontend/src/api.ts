const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeStream(
  text: string,
  onToken: (token: string) => void,
  state?: string,
): Promise<import("./types").AnalyzeResponse> {
  const res = await fetch(`${BASE_URL}/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, state }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.type === "token") {
        onToken(payload.content);
      } else if (payload.type === "done") {
        return payload.result;
      } else if (payload.type === "error") {
        throw new Error(payload.message);
      }
    }
  }

  throw new Error("Stream ended without a result");
}

export async function getExamples() {
  const res = await fetch(`${BASE_URL}/analyze/examples`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getSituation(id: string) {
  const res = await fetch(`${BASE_URL}/s/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function submitFeedback(situationId: string, rating: 1 | -1) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ situation_id: situationId, rating }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
