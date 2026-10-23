from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.config import DEFAULT_GATE_CLOSURE_HOUR, DEFAULT_GATE_CLOSURE_MINUTE
from app.models import (
    ForecastPoint, ActualPoint, ComparisonPoint, DayAheadSummary,
    DayAheadForecastResponse, EvolutionSeriesItem, ForecastEvolutionResponse
)

class ForecastService:

    @staticmethod
    def get_day_ahead_forecast(
        delivery_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> DayAheadForecastResponse:
        """
        Retrieves the latest renewable wind generation forecast available
        prior to day-ahead gate closure for the specified delivery date,
        paired with actual generation once realized.
        """
        delivery_dt = datetime.strptime(delivery_date_str, "%Y-%m-%d")
        decision_dt = delivery_dt - timedelta(days=1)
        decision_date_str = decision_dt.strftime("%Y-%m-%d")

        gate_closure_iso = f"{decision_date_str}T{cutoff_hour:02d}:{cutoff_minute:02d}:00Z"
        day_start_iso = f"{delivery_date_str}T00:00:00Z"
        day_end_iso = f"{delivery_date_str}T23:59:59Z"

        with get_db() as conn:
            cur = conn.cursor()

            # 1. Available publications before gate closure
            cur.execute("""
                SELECT DISTINCT publishTime
                FROM windfor
                WHERE startTime >= ? AND startTime <= ? AND publishTime <= ?
                ORDER BY publishTime ASC
            """, (day_start_iso, day_end_iso, gate_closure_iso))
            available_pubs = [r["publishTime"] for r in cur.fetchall()]

            # 2. Latest forecast per startTime prior to gate closure
            cur.execute("""
                WITH ranked_forecasts AS (
                    SELECT 
                        startTime,
                        publishTime,
                        generation,
                        ROW_NUMBER() OVER (
                            PARTITION BY startTime 
                            ORDER BY publishTime DESC
                        ) as rank
                    FROM windfor
                    WHERE startTime >= ? AND startTime <= ? AND publishTime <= ?
                )
                SELECT startTime, publishTime, generation
                FROM ranked_forecasts
                WHERE rank = 1
                ORDER BY startTime ASC
            """, (day_start_iso, day_end_iso, gate_closure_iso))
            forecast_rows = cur.fetchall()

            # 3. Actual generation from fuelhh
            cur.execute("""
                SELECT startTime, settlementDate, settlementPeriod, generation, publishTime
                FROM fuelhh
                WHERE startTime >= ? AND startTime <= ?
                ORDER BY startTime ASC
            """, (day_start_iso, day_end_iso))
            actual_rows = cur.fetchall()

        # Build half-hourly actual points
        actual_half_hourly: List[ActualPoint] = [
            ActualPoint(
                startTime=r["startTime"],
                settlementDate=r["settlementDate"],
                settlementPeriod=r["settlementPeriod"],
                generation=float(r["generation"]),
                publishTime=r.get("publishTime")
            )
            for r in actual_rows
        ]

        # Aggregate actuals by hour
        actuals_by_hour: Dict[str, List[float]] = {}
        for r in actual_rows:
            hour_key = r["startTime"][:13] + ":00:00Z"
            actuals_by_hour.setdefault(hour_key, []).append(float(r["generation"]))

        hourly_actual_avg: Dict[str, float] = {
            h: sum(vals) / len(vals) for h, vals in actuals_by_hour.items() if vals
        }

        # Build comparison points
        comparison_points: List[ComparisonPoint] = []
        forecast_generations: List[float] = []
        actual_generations: List[float] = []
        errors: List[float] = []
        abs_errors: List[float] = []

        for f_row in forecast_rows:
            s_time = f_row["startTime"]
            f_gen = float(f_row["generation"])
            p_time = f_row["publishTime"]
            hour_int = int(s_time[11:13])

            forecast_generations.append(f_gen)
            act_gen = hourly_actual_avg.get(s_time)

            if act_gen is not None:
                err = f_gen - act_gen
                abs_err = abs(err)
                pct_err = (abs_err / act_gen * 100) if act_gen > 0 else None

                actual_generations.append(act_gen)
                errors.append(err)
                abs_errors.append(abs_err)
            else:
                err = 0.0
                abs_err = 0.0
                pct_err = None

            comparison_points.append(
                ComparisonPoint(
                    startTime=s_time,
                    settlementHour=hour_int,
                    forecastGeneration=f_gen,
                    actualGeneration=act_gen if act_gen is not None else 0.0,
                    errorMw=err,
                    absErrorMw=abs_err,
                    percentageError=pct_err,
                    forecastPublishTime=p_time
                )
            )

        # Summary calculations
        total_forecast_mwh = sum(forecast_generations)  # 1 hour intervals = MW * 1h = MWh
        peak_forecast_mw = max(forecast_generations) if forecast_generations else 0.0
        min_forecast_mw = min(forecast_generations) if forecast_generations else 0.0
        avg_forecast_mw = (total_forecast_mwh / len(forecast_generations)) if forecast_generations else 0.0

        total_actual_mwh = sum(actual_generations) if actual_generations else None
        mae_mw = (sum(abs_errors) / len(abs_errors)) if abs_errors else None
        rmse_mw = ((sum(e**2 for e in errors) / len(errors)) ** 0.5) if errors else None
        bias_mw = (sum(errors) / len(errors)) if errors else None
        wape_pct = ((sum(abs_errors) / sum(actual_generations) * 100) if (actual_generations and sum(actual_generations) > 0) else None)

        summary = DayAheadSummary(
            deliveryDate=delivery_date_str,
            decisionDate=decision_date_str,
            gateClosureTime=gate_closure_iso,
            totalForecastMWh=total_forecast_mwh,
            peakForecastMW=peak_forecast_mw,
            minForecastMW=min_forecast_mw,
            averageForecastMW=avg_forecast_mw,
            totalActualMWh=total_actual_mwh,
            maeMW=mae_mw,
            rmseMW=rmse_mw,
            biasMW=bias_mw,
            wapePct=wape_pct
        )

        return DayAheadForecastResponse(
            summary=summary,
            hourlySeries=comparison_points,
            actualHalfHourlySeries=actual_half_hourly,
            availablePublications=available_pubs
        )

    @staticmethod
    def get_forecast_evolution(
        delivery_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> ForecastEvolutionResponse:
        """
        Retrieves all forecast updates leading up to Day-Ahead gate closure
        for the given delivery date, allowing visualization of how forecasts
        evolved across successive NWP model publication runs.
        """
        delivery_dt = datetime.strptime(delivery_date_str, "%Y-%m-%d")
        decision_dt = delivery_dt - timedelta(days=1)
        decision_date_str = decision_dt.strftime("%Y-%m-%d")

        gate_closure_iso = f"{decision_date_str}T{cutoff_hour:02d}:{cutoff_minute:02d}:00Z"
        day_start_iso = f"{delivery_date_str}T00:00:00Z"
        day_end_iso = f"{delivery_date_str}T23:59:59Z"

        with get_db() as conn:
            cur = conn.cursor()

            # Retrieve distinct publish times targeting this day before cutoff
            cur.execute("""
                SELECT DISTINCT publishTime
                FROM windfor
                WHERE startTime >= ? AND startTime <= ? AND publishTime <= ?
                ORDER BY publishTime ASC
            """, (day_start_iso, day_end_iso, gate_closure_iso))
            pub_times = [r["publishTime"] for r in cur.fetchall()]

            evolution_series: List[EvolutionSeriesItem] = []
            for pt in pub_times:
                cur.execute("""
                    SELECT startTime, publishTime, generation
                    FROM windfor
                    WHERE startTime >= ? AND startTime <= ? AND publishTime = ?
                    ORDER BY startTime ASC
                """, (day_start_iso, day_end_iso, pt))
                rows = cur.fetchall()
                data_points = [
                    ForecastPoint(
                        startTime=r["startTime"],
                        publishTime=r["publishTime"],
                        generation=float(r["generation"]),
                        settlementHour=int(r["startTime"][11:13])
                    )
                    for r in rows
                ]
                evolution_series.append(
                    EvolutionSeriesItem(publishTime=pt, data=data_points)
                )

            # Actuals
            cur.execute("""
                SELECT startTime, generation
                FROM fuelhh
                WHERE startTime >= ? AND startTime <= ?
                ORDER BY startTime ASC
            """, (day_start_iso, day_end_iso))
            act_rows = cur.fetchall()

        # Group actuals to hourly
        hour_actuals: Dict[str, List[float]] = {}
        for r in act_rows:
            hk = r["startTime"][:13] + ":00:00Z"
            hour_actuals.setdefault(hk, []).append(float(r["generation"]))

        actual_hourly_series = [
            {
                "startTime": hk,
                "hour": int(hk[11:13]),
                "generation": sum(v) / len(v)
            }
            for hk, v in sorted(hour_actuals.items())
        ]

        return ForecastEvolutionResponse(
            deliveryDate=delivery_date_str,
            gateClosureCutoff=gate_closure_iso,
            evolutionSeries=evolution_series,
            actualHourlySeries=actual_hourly_series
        )
