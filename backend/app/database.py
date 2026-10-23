import sqlite3
import os
from contextlib import contextmanager
from app.config import DB_PATH

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
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
