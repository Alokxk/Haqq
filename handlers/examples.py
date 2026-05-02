from fastapi import APIRouter

router = APIRouter()

EXAMPLES = [
    {
        "id": "landlord_deposit",
        "label": "Landlord not returning deposit",
        "text": (
            "My landlord has not returned my security deposit even after "
            "3 months of vacating the property. He is not responding to "
            "my calls and messages."
        ),
    },
    {
        "id": "unpaid_salary",
        "label": "Unpaid salary",
        "text": (
            "My employer has not paid my salary for the last 3 months. "
            "When I ask, they keep saying it will be paid next week but "
            "nothing happens."
        ),
    },
    {
        "id": "consumer_fraud",
        "label": "Consumer fraud",
        "text": (
            "I bought a refrigerator online 2 months ago. It stopped "
            "working after 3 weeks. The company is refusing to replace "
            "it or give me a refund despite repeated complaints."
        ),
    },
    {
        "id": "fir_refused",
        "label": "FIR refused by police",
        "text": (
            "I went to the police station to file an FIR about a fraud "
            "committed against me. The police officer refused to register "
            "my complaint and asked me to go away."
        ),
    },
    {
        "id": "posh",
        "label": "Workplace harassment",
        "text": (
            "A senior colleague at my workplace has been making "
            "inappropriate comments and sending unwanted messages to me "
            "for the past 2 months. My HR department is not taking any action."
        ),
    },
    {
        "id": "cheque_bounce",
        "label": "Cheque bounce",
        "text": (
            "I gave a loan of Rs 2 lakhs to my business partner. He gave "
            "me a cheque to repay it but the cheque bounced. The bank sent "
            "me a dishonour memo 10 days ago."
        ),
    },
]


@router.get("/analyze/examples")
async def get_examples():
    return {"examples": EXAMPLES}
