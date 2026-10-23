from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/status")
def get_system_status():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT count(*) as cnt, min(startTime) as min_s, max(startTime) as max_s FROM fuelhh")
        fuel_row = cur.fetchone()
        cur.execute("SELECT count(*) as cnt, min(publishTime) as min_p, max(publishTime) as max_p FROM windfor")
        wind_row = cur.fetchone()

    return {
        "status": "online",
        "dataScope": "January 2026 UK Wind Power Procurement",
        "actuals": {
            "recordCount": fuel_row["cnt"],
            "earliest": fuel_row["min_s"],
            "latest": fuel_row["max_s"]
        },
        "forecasts": {
            "recordCount": wind_row["cnt"],
            "earliestPublish": wind_row["min_p"],
            "latestPublish": wind_row["max_p"]
        }
    }

@router.get("/sample-dates")
def get_sample_dates():
    return {
        "availableRange": {
            "start": "2026-01-01",
            "end": "2026-01-31"
        },
        "highImpactDays": [
            {"date": "2026-01-02", "description": "High Wind Over-forecast Event (+3.2 GW Bias)"},
            {"date": "2026-01-08", "description": "High Wind Generation Ramp Day (>18 GW Peak)"},
            {"date": "2026-01-15", "description": "Mid-Month Volatility and Low Wind Day (<5 GW)"},
            {"date": "2026-01-24", "description": "Under-forecast Event with Tight Grid Conditions"}
        ]
    }
