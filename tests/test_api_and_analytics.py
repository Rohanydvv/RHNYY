import sys
from pathlib import Path
import pytest
from starlette.testclient import TestClient

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app
from app.services.forecast_service import ForecastService
from app.services.analytics_service import AnalyticsService
from app.services.procurement_service import ProcurementService
from app.models import ProcurementSimRequest

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_system_status():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["actuals"]["recordCount"] >= 1000
    assert data["forecasts"]["recordCount"] >= 10000

def test_day_ahead_forecast_selection():
    # Test delivery date 2026-01-05 with 11:00 GMT cutoff on 2026-01-04
    resp = ForecastService.get_day_ahead_forecast("2026-01-05", cutoff_hour=11, cutoff_minute=0)
    assert resp.summary.deliveryDate == "2026-01-05"
    assert resp.summary.decisionDate == "2026-01-04"
    assert resp.summary.gateClosureTime == "2026-01-04T11:00:00Z"
    assert len(resp.hourlySeries) == 24
    assert len(resp.actualHalfHourlySeries) == 48

    # Verify no forecast selected was published AFTER 11:00 on 2026-01-04
    for pt in resp.hourlySeries:
        assert pt.forecastPublishTime <= "2026-01-04T11:00:00Z"
        assert pt.startTime.startswith("2026-01-05")

def test_forecast_evolution():
    resp = ForecastService.get_forecast_evolution("2026-01-05", cutoff_hour=11)
    assert resp.deliveryDate == "2026-01-05"
    assert len(resp.evolutionSeries) >= 2
    assert len(resp.actualHourlySeries) == 24

def test_metrics_calculation_january_2026():
    metrics = AnalyticsService.calculate_metrics("2026-01-01", "2026-01-31", cutoff_hour=11)
    assert metrics.sampleHoursCount == 744  # 31 days * 24 hours
    assert metrics.maeMW > 0
    assert metrics.rmseMW > metrics.maeMW  # Mathematically RMSE >= MAE
    assert metrics.biasMW > 0  # Demonstrating January 2026 over-forecasting
    assert metrics.wapePct > 0
    assert metrics.overForecastHoursPct > 50  # Over 80% over-forecast hours in Jan 2026

def test_hourly_profile_and_distribution():
    profile = AnalyticsService.get_hourly_error_profile("2026-01-01", "2026-01-31", cutoff_hour=11)
    assert len(profile) == 24
    for h in profile:
        assert 0 <= h.hour <= 23
        assert h.sampleCount == 31  # 31 occurrences of each hour

    dist = AnalyticsService.get_error_distribution("2026-01-01", "2026-01-31", cutoff_hour=11, num_bins=15)
    assert len(dist) == 15
    total_count = sum(b.count for b in dist)
    assert total_count == 744

def test_procurement_simulation():
    req = ProcurementSimRequest(
        deliveryDate="2026-01-05",
        utilitySharePct=10.0,
        windDeratingPct=0.0
    )
    res_raw = ProcurementService.simulate_day_ahead_procurement(req)
    assert len(res_raw.hourlyBreakdown) == 24
    assert res_raw.totalDemandMWh > 0
    assert res_raw.totalProcuredThermalMWh > 0

    # Test derating reduces short volume
    req_derated = ProcurementSimRequest(
        deliveryDate="2026-01-05",
        utilitySharePct=10.0,
        windDeratingPct=15.0
    )
    res_derated = ProcurementService.simulate_day_ahead_procurement(req_derated)
    assert res_derated.totalShortMWh <= res_raw.totalShortMWh

def test_api_routes():
    # Day ahead endpoint
    r1 = client.get("/api/forecasts/day-ahead?deliveryDate=2026-01-08&cutoffHour=11")
    assert r1.status_code == 200
    assert "summary" in r1.json()

    # Metrics endpoint
    r2 = client.get("/api/evaluation/metrics?startDate=2026-01-01&endDate=2026-01-07")
    assert r2.status_code == 200
    assert r2.json()["sampleHoursCount"] == 168

    # Procurement simulation endpoint
    r3 = client.post("/api/procurement/simulate", json={
        "deliveryDate": "2026-01-08",
        "utilitySharePct": 5.0,
        "windDeratingPct": 10.0
    })
    assert r3.status_code == 200
    assert "hourlyBreakdown" in r3.json()
