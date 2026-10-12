#!/usr/bin/env python3
"""
build_comicbase_sqlite.py

Ingests the 1.258 million rows of authentic ComicBase valuation history
from /Users/macuser/Desktop/COMICBASE_NORMALIZED_1258799_ROWS_58_FIELDS.csv
into data/comicbase.sqlite for instantaneous indexed lookups of 4-year valuations,
condition grades, and top grades.
"""

import csv
import os
import re
import sqlite3
import sys
import time

csv.field_size_limit(sys.maxsize)

CSV_PATH = "/Users/macuser/Desktop/COMICBASE_NORMALIZED_1258799_ROWS_58_FIELDS.csv"
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "comicbase.sqlite")

def clean_series_name(name: str) -> str:
    s = re.sub(r"\s*\([^)]*\)", "", name or "")
    s = re.sub(r"\s+", " ", s).strip().lower()
    if s.startswith("the "):
        s = s[4:].strip()
    return s

def to_float(val: str):
    if not val:
        return None
    try:
        f = float(val.replace("$", "").replace(",", "").strip())
        return f if f > 0 else None
    except ValueError:
        return None

def to_int(val: str):
    if not val:
        return None
    try:
        return int(val.strip())
    except ValueError:
        return None

def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        sys.exit(1)

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA synchronous = OFF")
    cur.execute("PRAGMA journal_mode = MEMORY")
    cur.execute("PRAGMA cache_size = 100000")

    cur.execute("""
    CREATE TABLE comicbase_items (
        cb_id TEXT PRIMARY KEY,
        series TEXT,
        clean_series TEXT,
        issue_number TEXT,
        volume TEXT,
        printing TEXT,
        edition_form TEXT,
        publisher TEXT,
        publication_date TEXT,
        year INTEGER,
        upc TEXT,
        price REAL,
        cover_price REAL,
        val_2021 REAL,
        val_2022 REAL,
        val_2023 REAL,
        val_2024 REAL,
        condition TEXT,
        top_grade TEXT,
        number_graded INTEGER
    )
    """)

    print(f"Indexing ComicBase records from {CSV_PATH}...")
    t0 = time.time()

    insert_sql = """
    INSERT INTO comicbase_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    batch = []
    count = 0

    with open(CSV_PATH, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            series = row.get("Series", "").strip()
            issue = row.get("Issue Number", "").strip()
            pub_date = row.get("Publication Date", "").strip()
            year = None
            if pub_date:
                m = re.match(r"^(\d{4})", pub_date)
                if m:
                    year = int(m.group(1))

            record = (
                row.get("ID", f"CBROW-{count+1}"),
                series,
                clean_series_name(series),
                issue,
                row.get("Volume", "").strip() or None,
                row.get("Printing", "").strip() or None,
                row.get("Direct or Variant", "").strip() or None,
                row.get("Publisher", "").strip() or None,
                pub_date or None,
                year,
                row.get("UPC", "").strip() or None,
                to_float(row.get("Price")),
                to_float(row.get("Cover Price")),
                to_float(row.get("Value Year 1 (2021)")),
                to_float(row.get("Value Year 2 (2022)")),
                to_float(row.get("Value Year 3 (2023)")),
                to_float(row.get("Value Year 4 (2024)")),
                row.get("Condition", "").strip() or None,
                row.get("Top Grade", "").strip() or None,
                to_int(row.get("Number Graded")),
            )
            batch.append(record)
            count += 1

            if len(batch) >= 10000:
                cur.executemany(insert_sql, batch)
                conn.commit()
                batch.clear()
                if count % 100000 == 0:
                    print(f"  Processed {count:,} records in {time.time()-t0:.1f}s...")

    if batch:
        cur.executemany(insert_sql, batch)
        conn.commit()

    print(f"Loaded {count:,} records in {time.time()-t0:.1f}s. Creating indexes...")
    t_idx = time.time()
    cur.execute("CREATE INDEX idx_cb_clean ON comicbase_items (clean_series, issue_number)")
    cur.execute("CREATE INDEX idx_cb_series_issue ON comicbase_items (series, issue_number)")
    cur.execute("CREATE INDEX idx_cb_upc ON comicbase_items (upc)")
    conn.commit()
    conn.close()

    print(f"Done! Created indexes in {time.time()-t_idx:.1f}s. Total time: {time.time()-t0:.1f}s.")
    print(f"Database size: {os.path.getsize(DB_PATH) / 1024 / 1024:.1f} MB.")

if __name__ == "__main__":
    main()
