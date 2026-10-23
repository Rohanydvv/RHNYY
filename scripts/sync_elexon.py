import urllib.request
import json
import sqlite3
import os
import time
from datetime import datetime, timedelta

DB_PATH = "data/elexon_wind.db"

def init_db():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS fuelhh (
        startTime TEXT PRIMARY KEY,
        settlementDate TEXT,
        settlementPeriod INTEGER,
        generation REAL,
        publishTime TEXT
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS windfor (
        startTime TEXT,
        publishTime TEXT,
        generation REAL,
        PRIMARY KEY (startTime, publishTime)
    )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_fuelhh_start ON fuelhh(startTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_fuelhh_date ON fuelhh(settlementDate)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_windfor_start ON windfor(startTime)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_windfor_pub ON windfor(publishTime)")
    conn.commit()
    conn.close()

def fetch_elexon(dataset, start_iso, end_iso):
    url = f"https://data.elexon.co.uk/bmrs/api/v1/datasets/{dataset}/stream?publishDateTimeFrom={start_iso}&publishDateTimeTo={end_iso}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception as e:
            print(f"  Attempt {attempt+1} failed for {dataset} ({start_iso} to {end_iso}): {e}")
            time.sleep(2)
    return []

def populate_database():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Time chunks from 2025-12-28 to 2026-02-03
    start_dt = datetime(2025, 12, 28, 0, 0, 0)
    end_dt = datetime(2026, 2, 3, 0, 0, 0)
    step = timedelta(days=5)

    curr = start_dt
    while curr < end_dt:
        chunk_end = min(curr + step, end_dt)
        s_from = curr.strftime("%Y-%m-%dT%H:%M:%SZ")
        s_to = chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"Fetching chunk {s_from} -> {s_to}...")

        # 1. FUELHH
        fuel_data = fetch_elexon("FUELHH", s_from, s_to)
        wind_actuals = [x for x in fuel_data if x.get("fuelType") == "WIND"]
        cur.executemany("""
            INSERT OR REPLACE INTO fuelhh (startTime, settlementDate, settlementPeriod, generation, publishTime)
            VALUES (?, ?, ?, ?, ?)
        """, [
            (
                x.get("startTime"),
                x.get("settlementDate"),
                x.get("settlementPeriod"),
                float(x.get("generation", 0)),
                x.get("publishTime")
            )
            for x in wind_actuals
        ])
        conn.commit()
        print(f"  Saved {len(wind_actuals)} FUELHH wind records.")

        # 2. WINDFOR
        wf_data = fetch_elexon("WINDFOR", s_from, s_to)
        cur.executemany("""
            INSERT OR REPLACE INTO windfor (startTime, publishTime, generation)
            VALUES (?, ?, ?)
        """, [
            (
                x.get("startTime"),
                x.get("publishTime"),
                float(x.get("generation", 0))
            )
            for x in wf_data
        ])
        conn.commit()
        print(f"  Saved {len(wf_data)} WINDFOR records.")

        curr = chunk_end
        time.sleep(0.5)

    # Verification
    cur.execute("SELECT count(*) FROM fuelhh")
    fh_count = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM windfor")
    wf_count = cur.fetchone()[0]
    print(f"\nFinal DB counts: FUELHH={fh_count}, WINDFOR={wf_count}")
    conn.close()

if __name__ == "__main__":
    populate_database()
