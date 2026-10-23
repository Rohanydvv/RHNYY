from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.database import get_db
from app.config import DEFAULT_GATE_CLOSURE_HOUR, DEFAULT_GATE_CLOSURE_MINUTE
from app.models import ProcurementSimRequest, ProcurementSimResult, ProcurementSimHour

class ProcurementService:

    @classmethod
    def simulate_day_ahead_procurement(cls, req: ProcurementSimRequest) -> ProcurementSimResult:
        delivery_dt = datetime.strptime(req.deliveryDate, "%Y-%m-%d")
        decision_dt = delivery_dt - timedelta(days=1)
        decision_date = decision_dt.strftime("%Y-%m-%d")
        gate_closure_iso = f"{decision_date}T{DEFAULT_GATE_CLOSURE_HOUR:02d}:{DEFAULT_GATE_CLOSURE_MINUTE:02d}:00Z"
        day_start_iso = f"{req.deliveryDate}T00:00:00Z"
        day_end_iso = f"{req.deliveryDate}T23:59:59Z"

        with get_db() as conn:
            cur = conn.cursor()

            # Latest forecast before gate closure
            cur.execute("""
                WITH ranked_wf AS (
                    SELECT 
                        startTime,
                        publishTime,
                        generation,
                        ROW_NUMBER() OVER (
                            PARTITION BY startTime 
                            ORDER BY publishTime DESC
                        ) as rnk
                    FROM windfor
                    WHERE startTime >= ? AND startTime <= ? AND publishTime <= ?
                )
                SELECT startTime, generation
                FROM ranked_wf
                WHERE rnk = 1
                ORDER BY startTime ASC
            """, (day_start_iso, day_end_iso, gate_closure_iso))
            forecasts = {r["startTime"]: float(r["generation"]) for r in cur.fetchall()}

            # Hourly actuals
            cur.execute("""
                SELECT startTime, generation
                FROM fuelhh
                WHERE startTime >= ? AND startTime <= ?
                ORDER BY startTime ASC
            """, (day_start_iso, day_end_iso))
            act_rows = cur.fetchall()

            act_by_hour: Dict[str, List[float]] = {}
            for r in act_rows:
                hk = r["startTime"][:13] + ":00:00Z"
                act_by_hour.setdefault(hk, []).append(float(r["generation"]))

        scale = req.utilitySharePct / 100.0
        derate_factor = 1.0 - (req.windDeratingPct / 100.0)

        hours: List[ProcurementSimHour] = []
        tot_demand = 0.0
        tot_procured_thermal = 0.0
        tot_actual_thermal = 0.0
        tot_short = 0.0
        tot_surplus = 0.0
        tot_wholesale_cost = 0.0
        tot_imbalance_cost = 0.0

        for h in range(24):
            time_key = f"{req.deliveryDate}T{h:02d}:00:00Z"
            raw_wind = forecasts.get(time_key, 0.0) * scale
            derated_wind = raw_wind * derate_factor

            act_list = act_by_hour.get(time_key, [raw_wind])
            act_wind = (sum(act_list) / len(act_list)) * scale

            # Demand curve profile (UK winter diurnal pattern)
            base = req.baseDemandMW * scale
            if 7 <= h <= 9:
                demand_mw = base + (req.morningPeakMW * scale)
            elif 17 <= h <= 20:
                demand_mw = base + (req.eveningPeakMW * scale)
            elif 1 <= h <= 5:
                demand_mw = max(1000.0 * scale, base - (4000.0 * scale))
            elif 10 <= h <= 16:
                demand_mw = base + (2000.0 * scale)
            else:
                demand_mw = base

            # Decision at Day-Ahead: Procure thermal to cover the net deficit
            procured_thermal = max(0.0, demand_mw - derated_wind)

            # Real-Time reality: Actual thermal generation needed
            actual_thermal_needed = max(0.0, demand_mw - act_wind)

            # Imbalance = Procured - Actual Need = Actual Wind - Derated Wind
            imbalance = procured_thermal - actual_thermal_needed
            is_short = imbalance < 0

            # Financial calculation
            # Day-Ahead thermal procurement cost at wholesale price
            da_cost = procured_thermal * req.wholesalePricePerMWh

            if is_short:
                # Utility had to buy deficit in balancing mechanism at penalty price
                deficit_mw = abs(imbalance)
                imbalance_price = req.wholesalePricePerMWh * req.balancingBuyPenaltyMultiplier
                imb_cost = deficit_mw * imbalance_price
                tot_short += deficit_mw
            else:
                # Utility was surplus and sold excess back at discount
                surplus_mw = imbalance
                discounted_price = req.wholesalePricePerMWh * req.balancingSellDiscountMultiplier
                # Negative cost represents credit for selling excess, but below cost
                imb_cost = -1.0 * (surplus_mw * discounted_price)
                tot_surplus += surplus_mw

            total_hourly_cost = da_cost + imb_cost

            tot_demand += demand_mw
            tot_procured_thermal += procured_thermal
            tot_actual_thermal += actual_thermal_needed
            tot_wholesale_cost += da_cost
            tot_imbalance_cost += imb_cost

            hours.append(ProcurementSimHour(
                hour=h,
                startTime=time_key,
                demandMW=round(demand_mw, 1),
                rawWindForecastMW=round(raw_wind, 1),
                deratedWindForecastMW=round(derated_wind, 1),
                actualWindMW=round(act_wind, 1),
                procuredThermalMW=round(procured_thermal, 1),
                actualThermalNeededMW=round(actual_thermal_needed, 1),
                imbalanceMW=round(imbalance, 1),
                isShort=is_short,
                simulatedWholesaleCostGBP=round(da_cost, 2),
                simulatedImbalanceCostGBP=round(imb_cost, 2),
                simulatedTotalCostGBP=round(total_hourly_cost, 2)
            ))

        net_imbalance = tot_procured_thermal - tot_actual_thermal

        return ProcurementSimResult(
            deliveryDate=req.deliveryDate,
            utilitySharePct=req.utilitySharePct,
            windDeratingPct=req.windDeratingPct,
            totalDemandMWh=round(tot_demand, 1),
            totalProcuredThermalMWh=round(tot_procured_thermal, 1),
            totalActualThermalNeededMWh=round(tot_actual_thermal, 1),
            netImbalanceMWh=round(net_imbalance, 1),
            totalShortMWh=round(tot_short, 1),
            totalSurplusMWh=round(tot_surplus, 1),
            totalWholesaleCostGBP=round(tot_wholesale_cost, 2),
            totalImbalanceCostGBP=round(tot_imbalance_cost, 2),
            netBalancingExposureGBP=round(tot_imbalance_cost, 2),
            hourlyBreakdown=hours
        )
