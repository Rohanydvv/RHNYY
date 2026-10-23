from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.services.analytics_service import AnalyticsService
from app.models import AccuracyMetrics, HourlyProfilePoint, DailyBreakdownItem, ErrorDistributionBin
from app.config import DEFAULT_GATE_CLOSURE_HOUR, DEFAULT_GATE_CLOSURE_MINUTE

router = APIRouter(prefix="/api/evaluation", tags=["Evaluation"])

@router.get("/metrics", response_model=AccuracyMetrics)
def get_metrics(
    startDate: str = Query("2026-01-01", description="Start delivery date YYYY-MM-DD"),
    endDate: str = Query("2026-01-31", description="End delivery date YYYY-MM-DD"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59)
):
    try:
        return AnalyticsService.calculate_metrics(startDate, endDate, cutoffHour, cutoffMinute)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hourly-profile", response_model=List[HourlyProfilePoint])
def get_hourly_profile(
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59)
):
    try:
        return AnalyticsService.get_hourly_error_profile(startDate, endDate, cutoffHour, cutoffMinute)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/daily-breakdown", response_model=List[DailyBreakdownItem])
def get_daily_breakdown(
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59)
):
    try:
        return AnalyticsService.get_daily_breakdown(startDate, endDate, cutoffHour, cutoffMinute)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/distribution", response_model=List[ErrorDistributionBin])
def get_distribution(
    startDate: str = Query("2026-01-01"),
    endDate: str = Query("2026-01-31"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59),
    bins: int = Query(15, ge=5, le=50)
):
    try:
        return AnalyticsService.get_error_distribution(startDate, endDate, cutoffHour, cutoffMinute, bins)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
