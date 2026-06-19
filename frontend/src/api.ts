const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeText(text: string, state?: string) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, state }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
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
