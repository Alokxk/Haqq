import json
import os
import re
from openai import OpenAI
from pydantic import BaseModel

from config.settings import settings

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

MODEL = settings.openrouter_model

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

    if data.get("domain") not in DOMAINS:
        data["domain"] = "other"
    if data.get("confidence") not in ("high", "medium", "low"):
        data["confidence"] = "low"

    return ClassificationResult(**data)
