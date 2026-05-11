import re
import pathlib
import psycopg2
from datetime import date

from config.settings import settings

DATABASE_URL = settings.sync_database_url

ACT_METADATA = {
    "rti_2005": {
        "act_name": "Right to Information Act, 2005",
        "act_short": "RTI_2005",
        "domain": "rti",
        "state": None,
        "tags": ["rti", "information", "public authority", "disclosure"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/2065",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
    "pwa_1936": {
        "act_name": "Payment of Wages Act, 1936",
        "act_short": "PWA_1936",
        "domain": "labour",
        "state": None,
        "tags": ["wages", "salary", "deduction", "employer", "labour court"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/20359",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
    "cpa_2019": {
        "act_name": "Consumer Protection Act, 2019",
        "act_short": "CPA_2019",
        "domain": "consumer",
        "state": None,
        "tags": ["consumer", "defect", "complaint", "redressal", "unfair trade"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/15256",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
    "nia_1881": {
        "act_name": "Negotiable Instruments Act, 1881",
        "act_short": "NIA_1881",
        "domain": "cheque_bounce",
        "state": None,
        "tags": ["cheque", "dishonour", "bounce", "section 138", "demand notice"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/15327",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
    "posh_2013": {
        "act_name": "Sexual Harassment of Women at Workplace Act, 2013",
        "act_short": "POSH_2013",
        "domain": "labour",
        "state": None,
        "tags": ["posh", "sexual harassment", "workplace", "icc", "complaint"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/2104",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
    "ipc": {
        "act_name": "Indian Penal Code, 1860",
        "act_short": "IPC_1860",
        "domain": "criminal",
        "state": None,
        "tags": ["ipc", "fraud", "cheating", "breach of trust", "criminal"],
        "indiacode_url": "https://www.indiacode.nic.in/repealedfileopen?rfilename=A1860-45.pdf",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": True,
    },
    "crpc_1973": {
        "act_name": "Code of Criminal Procedure, 1973",
        "act_short": "CRPC_1973",
        "domain": "criminal",
        "state": None,
        "tags": ["fir", "police", "complaint", "magistrate", "crpc"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/15272",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": True,
    },
    "drca_1958": {
        "act_name": "Delhi Rent Control Act, 1958",
        "act_short": "DRCA_1958",
        "domain": "property",
        "state": "delhi",
        "tags": ["rent", "tenant", "landlord", "deposit", "eviction", "delhi"],
        "indiacode_url": "https://indiacode.nic.in/handle/123456789/19223",
        "last_updated": date(2024, 1, 15),
        "possibly_amended": False,
    },
}

SECTION_PATTERN = re.compile(r"^(\d+[A-Z]?)\.\s+(.+?)—", re.MULTILINE)
MIN_CHUNK_CHARS = 100


def parse_sections(text: str) -> list[dict]:
    # Join lines where a section title wraps before the em dash
    lines = text.split("\n")
    joined_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        # If line matches section start but has no em dash, peek at next line
        bare_section = re.match(r"^(\d+[A-Z]?)\.\s+\S", line)
        if bare_section and "—" not in line and i + 1 < len(lines):
            next_line = lines[i + 1]
            if "—" in next_line and not re.match(r"^(\d+[A-Z]?)\.\s+\S", next_line):
                joined_lines.append(line.rstrip() + " " + next_line.lstrip())
                i += 2
                continue
        joined_lines.append(line)
        i += 1

    sections = []
    current_number = None
    current_title = None
    current_lines = []

    for line in joined_lines:
        match = SECTION_PATTERN.match(line)
        if match:
            if current_number and current_lines:
                content = "\n".join(current_lines).strip()
                if len(content) >= MIN_CHUNK_CHARS:
                    sections.append(
                        {
                            "section_number": current_number,
                            "section_title": current_title,
                            "content": content,
                        }
                    )
            current_number = match.group(1)
            current_title = match.group(2).strip()
            current_lines = [line]
        elif current_number is not None:
            current_lines.append(line)

    if current_number and current_lines:
        content = "\n".join(current_lines).strip()
        if len(content) >= MIN_CHUNK_CHARS:
            sections.append(
                {
                    "section_number": current_number,
                    "section_title": current_title,
                    "content": content,
                }
            )

    return sections


def ingest_act(cursor, stem: str, text: str) -> int:
    meta = ACT_METADATA[stem]
    sections = parse_sections(text)

    cursor.execute(
        "DELETE FROM legal_corpus WHERE act_short = %s", (meta["act_short"],)
    )

    count = 0
    for sec in sections:
        cursor.execute(
            """
            INSERT INTO legal_corpus (
                act_name, act_short, section_number, section_title,
                content, state, domain, tags, indiacode_url,
                last_updated, possibly_amended
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                meta["act_name"],
                meta["act_short"],
                sec["section_number"],
                sec["section_title"],
                sec["content"],
                meta["state"],
                meta["domain"],
                meta["tags"],
                meta["indiacode_url"],
                meta["last_updated"],
                meta["possibly_amended"],
            ),
        )
        count += 1

    return count


def main():
    text_dir = pathlib.Path("corpus/sources/text")
    conn = psycopg2.connect(DATABASE_URL)

    try:
        with conn:
            cursor = conn.cursor()
            total = 0

            for txt_path in sorted(text_dir.glob("*.txt")):
                stem = txt_path.stem
                if stem not in ACT_METADATA:
                    print(f"Skipping {txt_path.name} — no metadata defined")
                    continue

                text = txt_path.read_text(encoding="utf-8")
                count = ingest_act(cursor, stem, text)
                total += count
                print(f"{stem}: {count} sections ingested")

            print(f"\nTotal chunks: {total}")
            cursor.execute("SELECT COUNT(*) FROM legal_corpus")
            db_count = cursor.fetchone()[0]
            print(f"Database count: {db_count}")

    finally:
        conn.close()


if __name__ == "__main__":
    main()
