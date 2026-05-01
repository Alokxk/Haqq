import json
import re
import google.generativeai as genai
from pydantic import BaseModel

from config.settings import settings

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("models/gemini-2.0-flash")

DOMAINS = [
    "labour",
    "consumer",
    "property",
    "rti",
    "police_complaint",
    "cheque_bounce",
    "cybercrime",
    "criminal",
    "other",
]

CLASSIFICATION_PROMPT = """You are a legal domain classifier for Indian law.

Analyze the situation described and return a JSON object with exactly these fields:
- domain: one of {domains}
- sub_domain: a specific sub-category (e.g. "wage_theft", "security_deposit", "fir_refused")
- state: the Indian state mentioned (e.g. "delhi", "karnataka"), or null if not mentioned
- confidence: "high", "medium", or "low" based on how clearly the situation maps to a domain

Return ONLY valid JSON. No markdown. No explanation. No code blocks.

Example output:
{{"domain": "labour", "sub_domain": "wage_theft", "state": null, "confidence": "high"}}

Situation: {situation}"""


class ClassificationResult(BaseModel):
    domain: str
    sub_domain: str
    state: str | None
    confidence: str


def classify(text: str, language: str = "en") -> ClassificationResult:
    prompt = CLASSIFICATION_PROMPT.format(
        domains=", ".join(DOMAINS),
        situation=text,
    )

    response = model.generate_content(prompt)
    raw = response.text.strip()

    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    raw = raw.strip()

    data = json.loads(raw)

    if data.get("domain") not in DOMAINS:
        data["domain"] = "other"
    if data.get("confidence") not in ("high", "medium", "low"):
        data["confidence"] = "low"

    return ClassificationResult(**data)
