import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from app.database import get_db
from app.config import (
    DEFAULT_GATE_CLOSURE_HOUR, DEFAULT_GATE_CLOSURE_MINUTE, BENCHMARK_WIND_CAPACITY_MW
)
from app.models import (
    AccuracyMetrics, HourlyProfilePoint, DailyBreakdownItem, ErrorDistributionBin
)

class AnalyticsService:

    @classmethod
    def _fetch_paired_hourly_data(
        cls,
        start_date_str: str,
        end_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> List[Dict[str, Any]]:
        """
        Gathers paired (Day-Ahead Forecast, Hourly Actual) points for every hour
        across the date range [start_date, end_date], applying the Day-Ahead
        gate closure cutoff for each respective delivery day.
        """
        start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")

        all_points: List[Dict[str, Any]] = []
        curr = start_dt

        with get_db() as conn:
            cur = conn.cursor()

            while curr <= end_dt:
                delivery_date = curr.strftime("%Y-%m-%d")
                decision_date = (curr - timedelta(days=1)).strftime("%Y-%m-%d")
                gate_closure_iso = f"{decision_date}T{cutoff_hour:02d}:{cutoff_minute:02d}:00Z"
                day_start_iso = f"{delivery_date}T00:00:00Z"
                day_end_iso = f"{delivery_date}T23:59:59Z"

                # 1. Latest forecast per hour prior to gate closure
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
                    SELECT startTime, publishTime, generation
                    FROM ranked_wf
                    WHERE rnk = 1
                    ORDER BY startTime ASC
                """, (day_start_iso, day_end_iso, gate_closure_iso))
                forecasts = {r["startTime"]: float(r["generation"]) for r in cur.fetchall()}

                # 2. Hourly averaged actuals
                cur.execute("""
                    SELECT startTime, generation
                    FROM fuelhh
                    WHERE startTime >= ? AND startTime <= ?
                    ORDER BY startTime ASC
                """, (day_start_iso, day_end_iso))
                actual_rows = cur.fetchall()

                act_by_hour: Dict[str, List[float]] = {}
                for r in actual_rows:
                    hk = r["startTime"][:13] + ":00:00Z"
                    act_by_hour.setdefault(hk, []).append(float(r["generation"]))

                # Merge
                for s_time, f_gen in forecasts.items():
                    act_list = act_by_hour.get(s_time)
                    if act_list:
                        act_gen = sum(act_list) / len(act_list)
                        err = f_gen - act_gen
                        hour_int = int(s_time[11:13])
                        all_points.append({
                            "deliveryDate": delivery_date,
                            "startTime": s_time,
                            "hour": hour_int,
                            "forecastMW": f_gen,
                            "actualMW": act_gen,
                            "errorMW": err,
                            "absErrorMW": abs(err)
                        })

                curr += timedelta(days=1)

        return all_points

    @classmethod
    def calculate_metrics(
        cls,
        start_date_str: str,
        end_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> AccuracyMetrics:
        """
        Calculates aggregate quantitative forecast error metrics across the specified window.
        """
        data = cls._fetch_paired_hourly_data(start_date_str, end_date_str, cutoff_hour, cutoff_minute)
        n = len(data)

        if n == 0:
            return AccuracyMetrics(
                startDate=start_date_str,
                endDate=end_date_str,
                sampleHoursCount=0,
                maeMW=0.0,
                rmseMW=0.0,
                biasMW=0.0,
                wapePct=0.0,
                nmaePct=0.0,
                maxOverForecastMW=0.0,
                maxUnderForecastMW=0.0,
                overForecastHoursPct=0.0,
                underForecastHoursPct=0.0,
                peakHoursMaeMW=0.0,
                offPeakHoursMaeMW=0.0,
                totalForecastTWh=0.0,
                totalActualTWh=0.0
            )

        errors = [d["errorMW"] for d in data]
        abs_errors = [d["absErrorMW"] for d in data]
        forecasts = [d["forecastMW"] for d in data]
        actuals = [d["actualMW"] for d in data]

        mae = sum(abs_errors) / n
        rmse = math.sqrt(sum(e**2 for e in errors) / n)
        bias = sum(errors) / n  # Mean Error (positive = over-forecast, negative = under-forecast)

        total_actual_mwh = sum(actuals)
        total_forecast_mwh = sum(forecasts)
        wape = (sum(abs_errors) / total_actual_mwh * 100) if total_actual_mwh > 0 else 0.0

        nmae = (mae / BENCHMARK_WIND_CAPACITY_MW) * 100

        max_over = max(errors)
        max_under = abs(min(errors))

        over_count = sum(1 for e in errors if e > 0)
        under_count = sum(1 for e in errors if e < 0)
        over_pct = (over_count / n) * 100
        under_pct = (under_count / n) * 100

        # Peak hours (07:00 to 19:00) vs Off-peak
        peak_errs = [d["absErrorMW"] for d in data if 7 <= d["hour"] < 19]
        offpeak_errs = [d["absErrorMW"] for d in data if d["hour"] < 7 or d["hour"] >= 23]

        peak_mae = (sum(peak_errs) / len(peak_errs)) if peak_errs else 0.0
        offpeak_mae = (sum(offpeak_errs) / len(offpeak_errs)) if offpeak_errs else 0.0

        return AccuracyMetrics(
            startDate=start_date_str,
            endDate=end_date_str,
            sampleHoursCount=n,
            maeMW=round(mae, 2),
            rmseMW=round(rmse, 2),
            biasMW=round(bias, 2),
            wapePct=round(wape, 2),
            nmaePct=round(nmae, 2),
            maxOverForecastMW=round(max_over, 2),
            maxUnderForecastMW=round(max_under, 2),
            overForecastHoursPct=round(over_pct, 1),
            underForecastHoursPct=round(under_pct, 1),
            peakHoursMaeMW=round(peak_mae, 2),
            offPeakHoursMaeMW=round(offpeak_mae, 2),
            totalForecastTWh=round(total_forecast_mwh / 1e6, 3),
            totalActualTWh=round(total_actual_mwh / 1e6, 3)
        )

    @classmethod
    def get_hourly_error_profile(
        cls,
        start_date_str: str,
        end_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> List[HourlyProfilePoint]:
        """
        Evaluates diurnal forecast performance across the 24 hours of the day.
        """
        data = cls._fetch_paired_hourly_data(start_date_str, end_date_str, cutoff_hour, cutoff_minute)
        by_hour: Dict[int, List[Dict[str, Any]]] = {h: [] for h in range(24)}

        for d in data:
            by_hour[d["hour"]].append(d)

        results: List[HourlyProfilePoint] = []
        for h in range(24):
            pts = by_hour[h]
            if not pts:
                results.append(HourlyProfilePoint(
                    hour=h, maeMW=0, rmseMW=0, biasMW=0, avgForecastMW=0, avgActualMW=0, sampleCount=0
                ))
                continue

            errs = [p["errorMW"] for p in pts]
            abs_errs = [p["absErrorMW"] for p in pts]
            f_gens = [p["forecastMW"] for p in pts]
            a_gens = [p["actualMW"] for p in pts]
            cnt = len(pts)

            results.append(HourlyProfilePoint(
                hour=h,
                maeMW=round(sum(abs_errs) / cnt, 2),
                rmseMW=round(math.sqrt(sum(e**2 for e in errs) / cnt), 2),
                biasMW=round(sum(errs) / cnt, 2),
                avgForecastMW=round(sum(f_gens) / cnt, 2),
                avgActualMW=round(sum(a_gens) / cnt, 2),
                sampleCount=cnt
            ))

        return results

    @classmethod
    def get_daily_breakdown(
        cls,
        start_date_str: str,
        end_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE
    ) -> List[DailyBreakdownItem]:
        """
        Evaluates forecast accuracy day-by-day across the evaluation window.
        """
        data = cls._fetch_paired_hourly_data(start_date_str, end_date_str, cutoff_hour, cutoff_minute)
        by_day: Dict[str, List[Dict[str, Any]]] = {}

        for d in data:
            by_day.setdefault(d["deliveryDate"], []).append(d)

        results: List[DailyBreakdownItem] = []
        for day, pts in sorted(by_day.items()):
            cnt = len(pts)
            if cnt == 0:
                continue

            errs = [p["errorMW"] for p in pts]
            abs_errs = [p["absErrorMW"] for p in pts]
            f_gens = [p["forecastMW"] for p in pts]
            a_gens = [p["actualMW"] for p in pts]

            mae = sum(abs_errs) / cnt
            rmse = math.sqrt(sum(e**2 for e in errs) / cnt)
            bias = sum(errs) / cnt
            tot_act = sum(a_gens)
            wape = (sum(abs_errs) / tot_act * 100) if tot_act > 0 else 0.0

            peak_errs = [p["absErrorMW"] for p in pts if 7 <= p["hour"] < 19]
            peak_err = (sum(peak_errs) / len(peak_errs)) if peak_errs else mae

            results.append(DailyBreakdownItem(
                date=day,
                maeMW=round(mae, 2),
                rmseMW=round(rmse, 2),
                biasMW=round(bias, 2),
                wapePct=round(wape, 2),
                totalForecastGWh=round(sum(f_gens) / 1000, 2),
                totalActualGWh=round(tot_act / 1000, 2),
                peakHourErrorMW=round(peak_err, 2)
            ))

        return results

    @classmethod
    def get_error_distribution(
        cls,
        start_date_str: str,
        end_date_str: str,
        cutoff_hour: int = DEFAULT_GATE_CLOSURE_HOUR,
        cutoff_minute: int = DEFAULT_GATE_CLOSURE_MINUTE,
        num_bins: int = 15
    ) -> List[ErrorDistributionBin]:
        """
        Generates histogram distribution of forecast errors (Forecast - Actual).
        """
        data = cls._fetch_paired_hourly_data(start_date_str, end_date_str, cutoff_hour, cutoff_minute)
        if not data:
            return []

        errors = [d["errorMW"] for d in data]
        min_err = min(errors)
        max_err = max(errors)

        # Pad range symmetrically or cleanly
        bin_width = (max_err - min_err) / num_bins
        if bin_width == 0:
            bin_width = 1.0

        bins = [min_err + i * bin_width for i in range(num_bins + 1)]
        counts = [0] * num_bins

        for e in errors:
            placed = False
            for i in range(num_bins):
                if bins[i] <= e < bins[i+1]:
                    counts[i] += 1
                    placed = True
                    break
            if not placed and e >= bins[-1]:
                counts[-1] += 1

        total = len(errors)
        distribution: List[ErrorDistributionBin] = []
        for i in range(num_bins):
            start_val = round(bins[i], 1)
            end_val = round(bins[i+1], 1)
            cnt = counts[i]
            distribution.append(ErrorDistributionBin(
                binStart=start_val,
                binEnd=end_val,
                binLabel=f"{start_val:+.0f} to {end_val:+.0f} MW",
                count=cnt,
                frequencyPct=round((cnt / total) * 100, 2)
            ))

        return distribution
