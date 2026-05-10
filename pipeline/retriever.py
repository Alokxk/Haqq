import warnings
import psycopg2
from pgvector.psycopg2 import register_vector
from fastembed import TextEmbedding

warnings.filterwarnings("ignore")

DATABASE_URL = "postgresql://postgres:postgres@localhost/haqq"

SEMANTIC_WEIGHT = 0.7
KEYWORD_WEIGHT = 0.3
TOP_K = 8

CONFIDENCE_HIGH = 0.80
CONFIDENCE_MEDIUM = 0.65
CONFIDENCE_LOW = 0.50

MODEL_NAME = "intfloat/multilingual-e5-large"

_embedder = None


def get_embedder() -> TextEmbedding:
    global _embedder
    if _embedder is None:
        _embedder = TextEmbedding(MODEL_NAME)
    return _embedder


def get_query_embedding(text: str) -> list[float]:
    model = get_embedder()
    query_text = f"query: {text}"
    vectors = list(model.embed([query_text]))
    return vectors[0].tolist()


def hybrid_search(
    query_text: str,
    query_vector: list[float],
    domain: str | None = None,
    state: str | None = None,
    top_k: int = TOP_K,
) -> list[dict]:
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    cursor = conn.cursor()

    try:
        filters = ["embedding IS NOT NULL"]
        params = []

        if domain:
            filters.append("domain = %s")
            params.append(domain)
        if state:
            filters.append("(state = %s OR state IS NULL)")
            params.append(state)

        where = " AND ".join(filters)

        sql = f"""
            SELECT
                id,
                act_name,
                act_short,
                section_number,
                section_title,
                content,
                indiacode_url,
                last_updated,
                possibly_amended,
                domain,
                state,
                (1 - (embedding <=> %s::vector)) * {SEMANTIC_WEIGHT} +
                ts_rank(tsv, plainto_tsquery('english', %s)) * {KEYWORD_WEIGHT}
                    AS combined_score,
                (1 - (embedding <=> %s::vector)) AS semantic_score,
                ts_rank(tsv, plainto_tsquery('english', %s)) AS keyword_score
            FROM legal_corpus
            WHERE {where}
            ORDER BY combined_score DESC
            LIMIT %s
        """

        cursor.execute(
            sql,
            [query_vector, query_text, query_vector, query_text] + params + [top_k],
        )
        rows = cursor.fetchall()

        chunks = []
        for row in rows:
            chunks.append(
                {
                    "id": str(row[0]),
                    "act_name": row[1],
                    "act_short": row[2],
                    "section_number": row[3],
                    "section_title": row[4],
                    "content": row[5],
                    "indiacode_url": row[6],
                    "last_updated": row[7].isoformat() if row[7] else None,
                    "possibly_amended": row[8],
                    "domain": row[9],
                    "state": row[10],
                    "combined_score": float(row[11]),
                    "semantic_score": float(row[12]),
                    "keyword_score": float(row[13]),
                }
            )

        return chunks

    finally:
        conn.close()


def compute_confidence(chunks: list[dict]) -> str:
    if not chunks:
        return "low"
    top_score = chunks[0]["combined_score"]
    if top_score >= CONFIDENCE_HIGH:
        return "high"
    elif top_score >= CONFIDENCE_MEDIUM:
        return "medium"
    else:
        return "low"


def retrieve(
    query_text: str,
    domain: str | None = None,
    state: str | None = None,
    classification_confidence: str = "high",
) -> dict:
    effective_domain = domain if classification_confidence != "low" else None
    effective_state = state if classification_confidence != "low" else None

    query_vector = get_query_embedding(query_text)

    chunks = hybrid_search(
        query_text=query_text,
        query_vector=query_vector,
        domain=effective_domain,
        state=effective_state,
    )

    confidence = compute_confidence(chunks)
    top_score = chunks[0]["combined_score"] if chunks else 0.0
    fallback = top_score < CONFIDENCE_LOW

    return {
        "chunks": chunks,
        "confidence": confidence,
        "top_score": top_score,
        "fallback": fallback,
        "filters_applied": {
            "domain": effective_domain,
            "state": effective_state,
        },
    }
