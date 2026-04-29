import pdfplumber
import pathlib

RAW_DIR = pathlib.Path("corpus/sources/raw")
TEXT_DIR = pathlib.Path("corpus/sources/text")
TEXT_DIR.mkdir(parents=True, exist_ok=True)

files = sorted(RAW_DIR.glob("*.pdf"))

for pdf_path in files:
    out_path = TEXT_DIR / (pdf_path.stem + ".txt")
    print(f"Extracting {pdf_path.name} ...", end=" ")
    
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text)
    
    full_text = "\n".join(pages)
    out_path.write_text(full_text, encoding="utf-8")
    print(f"done ({len(pages)} pages, {len(full_text)} chars)")

print("\nAll files extracted.")