import psycopg2
from pgvector.psycopg2 import register_vector

from config.settings import settings

DATABASE_URL = settings.sync_database_url

TEST_CASES = [
    {
        "id": "unpaid_salary",
        "situation": "Employer has not paid salary for 3 months",
        "expected_sections": ["PWA_1936_15", "PWA_1936_5"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "unpaid_salary_paraphrase",
        "situation": "Company keeps delaying my wages since January",
        "expected_sections": ["PWA_1936_15"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "unpaid_salary_termination",
        "situation": "I was fired and they have not paid my final salary",
        "expected_sections": ["PWA_1936_5", "PWA_1936_15"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "wage_deduction",
        "situation": "Employer is making illegal deductions from my salary",
        "expected_sections": ["PWA_1936_7", "PWA_1936_15"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "cheque_bounce_explicit",
        "situation": "Section 138 NI Act cheque dishonoured",
        "expected_sections": ["NIA_1881_138"],
        "domain": "cheque_bounce",
        "state": None,
    },
    {
        "id": "cheque_bounce_plain",
        "situation": "My cheque bounced and the bank sent a dishonour memo",
        "expected_sections": ["NIA_1881_138"],
        "domain": "cheque_bounce",
        "state": None,
    },
    {
        "id": "cheque_bounce_demand",
        "situation": "I need to send a demand notice for a bounced cheque",
        "expected_sections": ["NIA_1881_138"],
        "domain": "cheque_bounce",
        "state": None,
    },
    {
        "id": "rti_filing",
        "situation": "I want to file an RTI application for road construction details",
        "expected_sections": ["RTI_2005_6", "RTI_2005_7"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "rti_rejection",
        "situation": "My RTI application was rejected without giving any reason",
        "expected_sections": ["RTI_2005_7", "RTI_2005_19"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "rti_appeal",
        "situation": "I did not get a response to my RTI in 30 days",
        "expected_sections": ["RTI_2005_19", "RTI_2005_7"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "consumer_defective_product",
        "situation": "I bought a phone that stopped working after 2 days",
        "expected_sections": ["CPA_2019_2", "CPA_2019_35"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "consumer_complaint_filing",
        "situation": "How do I file a consumer complaint against a company",
        "expected_sections": ["CPA_2019_35", "CPA_2019_34"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "consumer_refund",
        "situation": "Company refused to give me a refund for defective goods",
        "expected_sections": ["CPA_2019_39", "CPA_2019_2"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "fir_refused",
        "situation": "Police refused to file my FIR",
        "expected_sections": ["CRPC_1973_154", "CRPC_1973_156"],
        "domain": "police_complaint",
        "state": None,
    },
    {
        "id": "fir_section_156",
        "situation": "I want to file a complaint before the magistrate because police will not register my FIR",
        "expected_sections": ["CRPC_1973_156"],
        "domain": "police_complaint",
        "state": None,
    },
    {
        "id": "posh_harassment",
        "situation": "My male colleague is sexually harassing me at the workplace",
        "expected_sections": ["POSH_2013_4", "POSH_2013_9"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "posh_complaint",
        "situation": "How do I file a POSH complaint against my employer",
        "expected_sections": ["POSH_2013_9", "POSH_2013_4"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "landlord_deposit_delhi",
        "situation": "Landlord in Delhi is not returning my security deposit after I vacated",
        "expected_sections": ["DRCA_1958_21"],
        "domain": "property",
        "state": "delhi",
    },
    {
        "id": "fraud_ipc",
        "situation": "Someone cheated me and took money with false promises",
        "expected_sections": ["IPC_1860_420", "IPC_1860_415"],
        "domain": "criminal",
        "state": None,
    },
    {
        "id": "breach_of_trust",
        "situation": "My business partner misappropriated company funds",
        "expected_sections": ["IPC_1860_405", "IPC_1860_406"],
        "domain": "criminal",
        "state": None,
    },
    {
        "id": "ambiguous_employer",
        "situation": "My boss is not treating me well",
        "expected_sections": [],
        "domain": None,
        "state": None,
    },
    {
        "id": "ambiguous_money",
        "situation": "Someone owes me money",
        "expected_sections": [],
        "domain": None,
        "state": None,
    },
    {
        "id": "rti_information",
        "situation": "Government office is not giving me information I requested",
        "expected_sections": ["RTI_2005_7", "RTI_2005_6"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "consumer_misleading_ad",
        "situation": "Company advertised false claims about their product",
        "expected_sections": ["CPA_2019_2", "CPA_2019_21"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "wage_fine",
        "situation": "My employer imposed an illegal fine on my salary without notice",
        "expected_sections": ["PWA_1936_8"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "cheque_bounce_timeline",
        "situation": "Bank returned my cheque 20 days ago, what should I do now",
        "expected_sections": ["NIA_1881_138"],
        "domain": "cheque_bounce",
        "state": None,
    },
    {
        "id": "fir_cognizable",
        "situation": "Police are refusing to register a cognizable offence complaint",
        "expected_sections": ["CRPC_1973_154", "CRPC_1973_156"],
        "domain": "police_complaint",
        "state": None,
    },
    {
        "id": "consumer_jurisdiction",
        "situation": "Where do I file a consumer complaint for a 50 lakh dispute",
        "expected_sections": ["CPA_2019_47", "CPA_2019_34"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "posh_icc",
        "situation": "My company does not have an Internal Complaints Committee",
        "expected_sections": ["POSH_2013_4"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "rti_penalty",
        "situation": "Public Information Officer did not respond to my RTI and I want to file a complaint",
        "expected_sections": ["RTI_2005_20", "RTI_2005_19"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "wage_overtime",
        "situation": "Company is not paying me for overtime work",
        "expected_sections": ["PWA_1936_2"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "consumer_appeal",
        "situation": "District Commission dismissed my consumer complaint, can I appeal",
        "expected_sections": ["CPA_2019_41", "CPA_2019_47"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "ipc_cheating",
        "situation": "Online seller took payment but never delivered the product",
        "expected_sections": ["IPC_1860_420"],
        "domain": "criminal",
        "state": None,
    },
    {
        "id": "rti_third_party",
        "situation": "RTI officer is sharing my personal information with third parties",
        "expected_sections": ["RTI_2005_11", "RTI_2005_8"],
        "domain": "rti",
        "state": None,
    },
    {
        "id": "posh_timeline",
        "situation": "My sexual harassment complaint was not resolved within 90 days",
        "expected_sections": ["POSH_2013_11"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "drca_eviction",
        "situation": "Landlord is trying to illegally evict me in Delhi without notice",
        "expected_sections": ["DRCA_1958_14"],
        "domain": "property",
        "state": "delhi",
    },
    {
        "id": "consumer_product_liability",
        "situation": "A defective product caused me physical injury",
        "expected_sections": ["CPA_2019_83", "CPA_2019_84"],
        "domain": "consumer",
        "state": None,
    },
    {
        "id": "cheque_company",
        "situation": "A company director issued me a cheque that was returned unpaid by the bank",
        "expected_sections": ["NIA_1881_141", "NIA_1881_138"],
        "domain": "cheque_bounce",
        "state": None,
    },
    {
        "id": "wage_records",
        "situation": "Employer is not maintaining proper wage payment records",
        "expected_sections": ["PWA_1936_13A"],
        "domain": "labour",
        "state": None,
    },
    {
        "id": "rti_public_authority",
        "situation": "Is a private school covered under the Right to Information Act",
        "expected_sections": ["RTI_2005_2"],
        "domain": "rti",
        "state": None,
    },
]


def make_section_id(act_short: str, section_number: str) -> str:
    return f"{act_short}_{section_number}"


def semantic_search(
    cursor,
    query_vector: list[float],
    domain: str | None = None,
    state: str | None = None,
    top_k: int = 8,
) -> list[dict]:
    filters = ["embedding IS NOT NULL"]
    filter_params = []

    if domain:
        filters.append("domain = %s")
        filter_params.append(domain)
    if state:
        filters.append("(state = %s OR state IS NULL)")
        filter_params.append(state)

    where = " AND ".join(filters)

    query = f"""
        SELECT
            act_short,
            section_number,
            1 - (embedding <=> %s::vector) AS score
        FROM legal_corpus
        WHERE {where}
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """

    cursor.execute(query, [query_vector] + filter_params + [query_vector, top_k])
    rows = cursor.fetchall()
    return [
        {
            "section_id": make_section_id(row[0], row[1]),
            "score": float(row[2]),
        }
        for row in rows
    ]


def run_eval(cursor, query_vectors: dict[str, list[float]]) -> dict:
    results = {
        "total": 0,
        "top1_hits": 0,
        "top3_hits": 0,
        "top5_hits": 0,
        "skipped": 0,
        "per_domain": {},
    }

    for case in TEST_CASES:
        case_id = case["id"]

        if not case["expected_sections"]:
            continue

        if case_id not in query_vectors:
            results["skipped"] += 1
            continue

        results["total"] += 1
        domain = case["domain"]
        if domain not in results["per_domain"]:
            results["per_domain"][domain] = {"total": 0, "top3_hits": 0}
        results["per_domain"][domain]["total"] += 1

        retrieved = semantic_search(
            cursor,
            query_vectors[case_id],
            domain=case["domain"],
            state=case["state"],
        )

        retrieved_ids = [r["section_id"] for r in retrieved]
        expected = case["expected_sections"]

        if any(e in retrieved_ids[:1] for e in expected):
            results["top1_hits"] += 1
        if any(e in retrieved_ids[:3] for e in expected):
            results["top3_hits"] += 1
            results["per_domain"][domain]["top3_hits"] += 1
        if any(e in retrieved_ids[:5] for e in expected):
            results["top5_hits"] += 1

    return results


def print_results(results: dict, label: str):
    total = results["total"]
    if total == 0:
        print(f"{label}: no cases evaluated")
        return

    print(f"\n{'='*50}")
    print(f"{label}")
    print(f"{'='*50}")
    print(f"Total cases evaluated: {total}")
    print(f"Skipped (no embedding): {results['skipped']}")
    print(
        f"Top-1 accuracy: {results['top1_hits']}/{total} = {results['top1_hits']/total*100:.1f}%"
    )
    print(
        f"Top-3 accuracy: {results['top3_hits']}/{total} = {results['top3_hits']/total*100:.1f}%"
    )
    print(
        f"Top-5 accuracy: {results['top5_hits']}/{total} = {results['top5_hits']/total*100:.1f}%"
    )
    print(f"\nPer domain (Top-3):")
    for domain, stats in results["per_domain"].items():
        if stats["total"] > 0:
            pct = stats["top3_hits"] / stats["total"] * 100
            print(f"  {domain}: {stats['top3_hits']}/{stats['total']} = {pct:.1f}%")


def main():
    import warnings

    warnings.filterwarnings("ignore")
    from fastembed import TextEmbedding

    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    cursor = conn.cursor()

    print("Loading embedding model...")
    model = TextEmbedding("intfloat/multilingual-e5-large")
    print("Model loaded.")

    print("Embedding eval queries...")
    query_vectors = {}
    for i, case in enumerate(TEST_CASES):
        if not case["expected_sections"]:
            continue
        query_text = f"query: {case['situation']}"
        vectors = list(model.embed([query_text]))
        query_vectors[case["id"]] = vectors[0].tolist()
        if (i + 1) % 10 == 0:
            print(f"  Embedded {i + 1}/{len(TEST_CASES)} queries")

    print("\nRunning semantic search baseline...")
    results = run_eval(cursor, query_vectors)
    print_results(results, "SEMANTIC SEARCH BASELINE")
    print("\nRecord these numbers in the README.")

    conn.close()


if __name__ == "__main__":
    main()
