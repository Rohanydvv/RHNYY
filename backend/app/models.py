from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ForecastPoint(BaseModel):
    startTime: str
    publishTime: str
    generation: float
    settlementHour: Optional[int] = None
    settlementPeriod: Optional[int] = None

class ActualPoint(BaseModel):
    startTime: str
    settlementDate: str
    settlementPeriod: int
    generation: float
    publishTime: Optional[str] = None

class ComparisonPoint(BaseModel):
    startTime: str
    settlementHour: int
    forecastGeneration: float
    actualGeneration: float
    errorMw: float  # Forecast - Actual
    absErrorMw: float
    percentageError: Optional[float] = None
    forecastPublishTime: str

class DayAheadSummary(BaseModel):
    deliveryDate: str
    decisionDate: str
    gateClosureTime: str
    totalForecastMWh: float
    peakForecastMW: float
    minForecastMW: float
    averageForecastMW: float
    totalActualMWh: Optional[float] = None
    maeMW: Optional[float] = None
    rmseMW: Optional[float] = None
    biasMW: Optional[float] = None
    wapePct: Optional[float] = None

class DayAheadForecastResponse(BaseModel):
    summary: DayAheadSummary
    hourlySeries: List[ComparisonPoint]
    actualHalfHourlySeries: List[ActualPoint]
    availablePublications: List[str]

class EvolutionSeriesItem(BaseModel):
    publishTime: str
    data: List[ForecastPoint]

class ForecastEvolutionResponse(BaseModel):
    deliveryDate: str
    gateClosureCutoff: str
    evolutionSeries: List[EvolutionSeriesItem]
    actualHourlySeries: List[Dict[str, Any]]

class AccuracyMetrics(BaseModel):
    startDate: str
    endDate: str
    sampleHoursCount: int
    maeMW: float
    rmseMW: float
    biasMW: float  # Mean Error (positive = over-forecast, negative = under-forecast)
    wapePct: float
    nmaePct: float  # Capacity normalized MAE
    maxOverForecastMW: float
    maxUnderForecastMW: float
    overForecastHoursPct: float
    underForecastHoursPct: float
    peakHoursMaeMW: float  # 07:00 to 19:00
    offPeakHoursMaeMW: float  # 23:00 to 07:00
    totalForecastTWh: float
    totalActualTWh: float

class HourlyProfilePoint(BaseModel):
    hour: int
    maeMW: float
    rmseMW: float
    biasMW: float
    avgForecastMW: float
    avgActualMW: float
    sampleCount: int

class DailyBreakdownItem(BaseModel):
    date: str
    maeMW: float
    rmseMW: float
    biasMW: float
    wapePct: float
    totalForecastGWh: float
    totalActualGWh: float
    peakHourErrorMW: float

class ErrorDistributionBin(BaseModel):
    binStart: float
    binEnd: float
    binLabel: str
    count: int
    frequencyPct: float

class ProcurementSimRequest(BaseModel):
    deliveryDate: str
    baseDemandMW: float = 28000.0
    morningPeakMW: float = 6000.0
    eveningPeakMW: float = 8000.0
    utilitySharePct: float = 100.0  # % of UK national demand
    windDeratingPct: float = 0.0    # 0 to 30% safety haircut on wind forecast
    balancingBuyPenaltyMultiplier: float = 1.35  # Cost multiplier when short
    balancingSellDiscountMultiplier: float = 0.70 # Price discount when long
    wholesalePricePerMWh: float = 85.0

class ProcurementSimHour(BaseModel):
    hour: int
    startTime: str
    demandMW: float
    rawWindForecastMW: float
    deratedWindForecastMW: float
    actualWindMW: float
    procuredThermalMW: float
    actualThermalNeededMW: float
    imbalanceMW: float  # + surplus, - deficit
    isShort: bool
    simulatedWholesaleCostGBP: float
    simulatedImbalanceCostGBP: float
    simulatedTotalCostGBP: float

class ProcurementSimResult(BaseModel):
    deliveryDate: str
    utilitySharePct: float
    windDeratingPct: float
    totalDemandMWh: float
    totalProcuredThermalMWh: float
    totalActualThermalNeededMWh: float
    netImbalanceMWh: float
    totalShortMWh: float
    totalSurplusMWh: float
    totalWholesaleCostGBP: float
    totalImbalanceCostGBP: float
    netBalancingExposureGBP: float
    hourlyBreakdown: List[ProcurementSimHour]
