import os
import time
import psycopg2
import warnings
from dotenv import load_dotenv
from pgvector.psycopg2 import register_vector
from fastembed import TextEmbedding

load_dotenv()

warnings.filterwarnings("ignore")

DATABASE_URL = os.environ["DATABASE_URL"]
BATCH_SIZE = 10
MODEL_NAME = "BAAI/bge-small-en-v1.5"


def get_chunks_without_embeddings(cursor) -> list[tuple]:
    cursor.execute(
        "SELECT id, content FROM legal_corpus WHERE embedding IS NULL ORDER BY id"
    )
    return cursor.fetchall()


def main():
    print(f"Loading {MODEL_NAME} (first run downloads ~130MB)...")
    model = TextEmbedding(MODEL_NAME)
    print("Model loaded.")

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

            vectors = list(model.embed(texts))

            for chunk_id, vector in zip(ids, vectors):
                cursor.execute(
                    "UPDATE legal_corpus SET embedding = %s WHERE id = %s",
                    (vector.tolist(), chunk_id),
                )

            conn.commit()
            embedded += len(batch)

            if embedded % 100 == 0 or embedded == total:
                print(f"Progress: {embedded}/{total}")

            time.sleep(0.1)

        print(f"\nDone. {embedded} embeddings stored.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
