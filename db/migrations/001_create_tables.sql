CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE situations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL,
    raw_input       TEXT NOT NULL,
    language        VARCHAR(10) DEFAULT 'en',
    domain          VARCHAR(50),
    sub_domain      VARCHAR(100),
    state           VARCHAR(50),
    analysis        JSONB,
    laws_cited      TEXT[],
    confidence      VARCHAR(10),
    top_score       NUMERIC(5,4),
    fallback        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_id    UUID REFERENCES situations(id),
    notice_type     VARCHAR(100),
    content         TEXT NOT NULL,
    pdf_path        TEXT,
    pdf_ready       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_corpus (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    act_name         VARCHAR(200) NOT NULL,
    act_short        VARCHAR(50),
    section_number   VARCHAR(20),
    section_title    VARCHAR(200),
    content          TEXT NOT NULL,
    state            VARCHAR(50),
    domain           VARCHAR(50),
    tags             TEXT[],
    indiacode_url    TEXT,
    last_updated     DATE,
    possibly_amended BOOLEAN DEFAULT FALSE,
    embedding        vector(1024),
    tsv              TSVECTOR GENERATED ALWAYS AS (
                       to_tsvector('english',
                         coalesce(act_name, '') || ' ' ||
                         coalesce(section_title, '') || ' ' ||
                         coalesce(content, ''))
                     ) STORED
);

CREATE INDEX idx_corpus_embedding
    ON legal_corpus
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_corpus_tsv    ON legal_corpus USING GIN(tsv);
CREATE INDEX idx_corpus_domain ON legal_corpus(domain);
CREATE INDEX idx_corpus_state  ON legal_corpus(state);

CREATE TABLE pdf_jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id    UUID REFERENCES notices(id),
    status       VARCHAR(20) DEFAULT 'queued',
    error        TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);