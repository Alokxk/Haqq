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

Use hedged language throughout: say "Based on the retrieved sections, you may consider..."
rather than definitive statements like "You can do X."
If a right or remedy is not explicitly supported by the retrieved text below,
do not include it.

{cheque_bounce_constraint}

SITUATION:
{situation}

RETRIEVED LAW SECTIONS:
{context}

Respond with ONLY valid JSON in exactly this structure. No markdown. No explanation.
{{
  "rights": ["Based on the retrieved sections, you may..."],
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


def analyze(
    situation: str,
    chunks: list[dict],
    domain: str | None = None,
    language: str = "en",
) -> AnalysisResult:
    cheque_constraint = CHEQUE_BOUNCE_CONSTRAINT if domain == "cheque_bounce" else ""
    context = build_context(chunks)

    prompt = ANALYZER_PROMPT.format(
        situation=situation,
        context=context,
        cheque_bounce_constraint=cheque_constraint,
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    data = json.loads(raw)
    return AnalysisResult(**data)


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
