from fastapi import APIRouter, HTTPException
from config.settings import settings
from pipeline.retriever import retrieve, get_query_embedding, hybrid_search

router = APIRouter()


@router.get("/debug/retrieval")
async def debug_retrieval(
    q: str,
    domain: str | None = None,
    state: str | None = None,
):
    if settings.environment != "development":
        raise HTTPException(status_code=403, detail="Not available")
    query_vector = get_query_embedding(q)
    chunks = hybrid_search(
        query_text=q,
        query_vector=query_vector,
        domain=domain,
        state=state,
    )

    return {
        "query": q,
        "filters_applied": {"domain": domain, "state": state},
        "chunks": [
            {
                "act_short": c["act_short"],
                "section_number": c["section_number"],
                "section_title": c["section_title"],
                "semantic_score": round(c["semantic_score"], 4),
                "keyword_score": round(c["keyword_score"], 4),
                "combined_score": round(c["combined_score"], 4),
            }
            for c in chunks
        ],
    }
