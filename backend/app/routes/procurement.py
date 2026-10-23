from fastapi import APIRouter, HTTPException
from app.services.procurement_service import ProcurementService
from app.models import ProcurementSimRequest, ProcurementSimResult

router = APIRouter(prefix="/api/procurement", tags=["Procurement"])

@router.post("/simulate", response_model=ProcurementSimResult)
def simulate_procurement(req: ProcurementSimRequest):
    try:
        return ProcurementService.simulate_day_ahead_procurement(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
