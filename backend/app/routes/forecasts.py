from fastapi import APIRouter, Query, HTTPException
from app.services.forecast_service import ForecastService
from app.models import DayAheadForecastResponse, ForecastEvolutionResponse
from app.config import DEFAULT_GATE_CLOSURE_HOUR, DEFAULT_GATE_CLOSURE_MINUTE

router = APIRouter(prefix="/api/forecasts", tags=["Forecasts"])

@router.get("/day-ahead", response_model=DayAheadForecastResponse)
def get_day_ahead_forecast(
    deliveryDate: str = Query(..., description="Target delivery date in YYYY-MM-DD format (e.g. 2026-01-05)"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23, description="Gate closure cutoff hour (GMT)"),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59, description="Gate closure cutoff minute")
):
    try:
        return ForecastService.get_day_ahead_forecast(deliveryDate, cutoffHour, cutoffMinute)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evolution", response_model=ForecastEvolutionResponse)
def get_forecast_evolution(
    deliveryDate: str = Query(..., description="Target delivery date in YYYY-MM-DD format"),
    cutoffHour: int = Query(DEFAULT_GATE_CLOSURE_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_GATE_CLOSURE_MINUTE, ge=0, le=59)
):
    try:
        return ForecastService.get_forecast_evolution(deliveryDate, cutoffHour, cutoffMinute)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
