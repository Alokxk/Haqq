import time
import psycopg2
import google.generativeai as genai
from pgvector.psycopg2 import register_vector

from config.settings import settings

DATABASE_URL = "postgresql://postgres:postgres@localhost/haqq"
BATCH_SIZE = 5
SLEEP_BETWEEN_BATCHES = 1.0


def get_chunks_without_embeddings(cursor) -> list[tuple]:
    cursor.execute(
        "SELECT id, content FROM legal_corpus WHERE embedding IS NULL ORDER BY id"
    )
    return cursor.fetchall()


def embed_batch(texts: list[str]) -> list[list[float]]:
    max_retries = 3
    for attempt in range(max_retries):
        try:
            result = genai.embed_content(
                model="models/gemini-embedding-001",
                content=texts,
                task_type="retrieval_document",
                output_dimensionality=768,
            )
            return result["embedding"]
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = 60 * (attempt + 1)
                print(f"Rate limited. Waiting {wait}s before retry...")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Max retries exceeded")


def main():
    genai.configure(api_key=settings.gemini_api_key)

    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)

    try:
        cursor = conn.cursor()
        chunks = get_chunks_without_embeddings(cursor)
        total = len(chunks)
        print(f"Chunks to embed: {total}")

        embedded = 0
        for i in range(0, total, BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            ids = [row[0] for row in batch]
            texts = [row[1] for row in batch]

            vectors = embed_batch(texts)

            for chunk_id, vector in zip(ids, vectors):
                cursor.execute(
                    "UPDATE legal_corpus SET embedding = %s WHERE id = %s",
                    (vector, chunk_id),
                )

            conn.commit()
            embedded += len(batch)

            if embedded % 50 == 0 or embedded == total:
                print(f"Progress: {embedded}/{total}")

            time.sleep(SLEEP_BETWEEN_BATCHES)

        print(f"\nDone. {embedded} embeddings stored.")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
