import json
import re
from openai import OpenAI
from pydantic import BaseModel

from config.settings import settings

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

MODEL = settings.openrouter_model

DISCLAIMER = (
    "This is not legal advice. For court proceedings or complex matters, "
    "consult a registered advocate."
)

FALLBACK_MESSAGE = (
    "Your situation may involve laws not yet in our database. "
    "Here are steps you can take right now:\n"
    "1) National Consumer Helpline: 1800-11-4000 (free)\n"
    "2) State Legal Services Authority: free legal aid for those "
    "who cannot afford a lawyer\n"
    "3) District court bar associations often provide free initial consultations\n"
    "4) Nyaya Mitra centres (in many districts): free paralegal help"
)

CHEQUE_BOUNCE_CONSTRAINT = """
IMPORTANT: Cheque bounce under Section 138 NI Act has strict time-sensitive
requirements that are absolute:
1. Demand notice must be sent within 30 days of receiving the bank's dishonour memo.
2. Criminal complaint must be filed within 30 days of the demand notice deadline expiring.
If either deadline is missed, the case fails entirely.
If the user's described timeline suggests these deadlines may have already passed,
state this explicitly and prominently.
"""

ANALYZER_PROMPT = """You are a legal rights assistant for India. Analyze the situation
below using ONLY the retrieved law sections provided. Do not cite any law not present
in the context below.

Write in plain, direct language. State rights and remedies clearly — do not pad every
sentence with "Based on the retrieved sections, you may consider...". Only omit a right
or remedy if it is genuinely not supported by the retrieved text.

{cheque_bounce_constraint}

SITUATION:
{situation}

RETRIEVED LAW SECTIONS:
{context}

Respond with ONLY valid JSON in exactly this structure. No markdown. No explanation.
{{
  "rights": ["You have the right to..."],
  "remedies": [
    {{
      "step": 1,
      "action": "Short action title",
      "details": "Detailed explanation",
      "timeline": "When to do this"
    }}
  ],
  "laws": [
    {{
      "act": "Full act name",
      "act_short": "ACT_SHORT",
      "section": "15",
      "title": "Section title",
      "summary": "Based on this section, you may consider...",
      "indiacode_url": "https://...",
      "last_updated": "2024-01-15",
      "possibly_amended": false
    }}
  ],
  "evidence_checklist": ["Item 1", "Item 2"],
  "confidence_reason": "Plain language explanation of why confidence is high/medium/low"
}}"""


class AnalysisResult(BaseModel):
    rights: list[str]
    remedies: list[dict]
    laws: list[dict]
    evidence_checklist: list[str]
    confidence_reason: str


def build_context(chunks: list[dict]) -> str:
    parts = []
    for chunk in chunks:
        parts.append(
            f"[{chunk['act_short']} Section {chunk['section_number']}] "
            f"{chunk['section_title']}\n{chunk['content'][:1000]}"
        )
    return "\n\n---\n\n".join(parts)


def _build_prompt(situation: str, chunks: list[dict], domain: str | None) -> str:
    cheque_constraint = CHEQUE_BOUNCE_CONSTRAINT if domain == "cheque_bounce" else ""
    context = build_context(chunks)
    return ANALYZER_PROMPT.format(
        situation=situation,
        context=context,
        cheque_bounce_constraint=cheque_constraint,
    )


def _parse_raw(raw: str, chunks: list[dict]) -> AnalysisResult:
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM returned malformed JSON: {e}") from e

    data.setdefault("rights", [])
    data.setdefault("remedies", [])
    data.setdefault("laws", [])
    data.setdefault("evidence_checklist", [])
    data.setdefault("confidence_reason", "Analysis based on retrieved law sections.")

    chunk_map = {f"{c['act_short']}_{c['section_number']}": c for c in chunks}
    act_url_map = {
        c["act_short"]: c.get("indiacode_url") for c in chunks if c.get("indiacode_url")
    }

    for law in data.get("laws", []):
        key = f"{law.get('act_short')}_{law.get('section')}"
        if key in chunk_map:
            chunk = chunk_map[key]
            law["indiacode_url"] = chunk.get("indiacode_url") or law.get(
                "indiacode_url"
            )
            law["last_updated"] = chunk.get("last_updated") or law.get("last_updated")
            law["possibly_amended"] = chunk.get("possibly_amended", False)
        elif law.get("act_short") in act_url_map:
            law["indiacode_url"] = act_url_map[law["act_short"]]

    return AnalysisResult(**data)


def analyze(
    situation: str,
    chunks: list[dict],
    domain: str | None = None,
) -> AnalysisResult:
    prompt = _build_prompt(situation, chunks, domain)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    raw = response.choices[0].message.content.strip()
    return _parse_raw(raw, chunks)


def stream_analyze(
    situation: str,
    chunks: list[dict],
    domain: str | None = None,
):
    """Yields raw token strings from the LLM as they arrive."""
    prompt = _build_prompt(situation, chunks, domain)
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def fallback_response() -> dict:
    return {
        "confidence": "low",
        "fallback": True,
        "fallback_message": FALLBACK_MESSAGE,
        "laws": [],
        "rights": None,
        "remedies": [],
        "evidence_checklist": [],
        "disclaimer": DISCLAIMER,
    }
