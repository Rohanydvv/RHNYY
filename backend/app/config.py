import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

# Database configuration
# Look in backend/data first, then root data, fallback to /app/data
candidate_dbs = [
    BASE_DIR / "data" / "elexon_wind.db",
    ROOT_DIR / "data" / "elexon_wind.db",
    Path("/app/data/elexon_wind.db")
]

DB_PATH = str(candidate_dbs[0])
for p in candidate_dbs:
    if p.exists():
        DB_PATH = str(p)
        break

# Elexon API Endpoints
ELEXON_BASE_URL = os.getenv("ELEXON_BASE_URL", "https://data.elexon.co.uk/bmrs/api/v1")
FUELHH_ENDPOINT = f"{ELEXON_BASE_URL}/datasets/FUELHH/stream"
WINDFOR_ENDPOINT = f"{ELEXON_BASE_URL}/datasets/WINDFOR/stream"

# Default GB Day-Ahead Auction Parameters
DEFAULT_GATE_CLOSURE_HOUR = 11  # 11:00 GMT (EPEX SPOT / Nord Pool GB Auction)
DEFAULT_GATE_CLOSURE_MINUTE = 0

# Benchmark UK Wind Installed / Peak Monitored Capacity in Jan 2026 (~21,000 MW)
BENCHMARK_WIND_CAPACITY_MW = 21000.0
