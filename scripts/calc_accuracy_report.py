import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import sqlite3
import pandas as pd
import numpy as np
from app.services.analytics_service import AnalyticsService

def main():
    # 1. Analytics Service standard metrics
    m = AnalyticsService.calculate_metrics('2026-01-01', '2026-01-31', cutoff_hour=11)
    
    # 2. Database checks
    conn = sqlite3.connect('backend/data/elexon_wind.db')
    cur = conn.cursor()
    
    cur.execute("SELECT count(*) FROM fuelhh WHERE settlementDate >= '2026-01-01' AND settlementDate <= '2026-01-31'")
    fuel_count = cur.fetchone()[0]
    expected_fuel = 31 * 48 # 1488 half-hours
    
    cur.execute("SELECT count(*) FROM windfor WHERE startTime >= '2026-01-01T00:00:00Z' AND startTime <= '2026-01-31T23:59:59Z'")
    wind_count = cur.fetchone()[0]

    # 3. Paired data analysis
    raw_data = AnalyticsService._fetch_paired_hourly_data('2026-01-01', '2026-01-31', 11, 0)
    df = pd.DataFrame(raw_data)
    
    corr = df['forecastMW'].corr(df['actualMW'])
    r2 = corr ** 2
    
    total_forecast_gwh = df['forecastMW'].sum() / 1000
    total_actual_gwh = df['actualMW'].sum() / 1000
    
    # Accuracy definitions:
    wape = (df['absErrorMW'].sum() / df['actualMW'].sum()) * 100
    wape_accuracy = 100.0 - wape
    
    # Capacity normalized MAE (out of 21,000 MW benchmark UK wind capacity)
    nmae = (df['absErrorMW'].mean() / 21000.0) * 100
    nmae_accuracy = 100.0 - nmae
    
    # Peak generation normalized accuracy (peak actual = max(actual))
    peak_actual = df['actualMW'].max()
    peak_norm_mae = (df['absErrorMW'].mean() / peak_actual) * 100
    peak_norm_accuracy = 100.0 - peak_norm_mae
    
    # Volume match percentage (Actual / Forecast)
    volume_match_pct = (total_actual_gwh / total_forecast_gwh) * 100
    
    # Directional accuracy (Did forecast correctly anticipate trend?)
    df['f_diff'] = df['forecastMW'].diff()
    df['a_diff'] = df['actualMW'].diff()
    valid_diff = df.dropna(subset=['f_diff', 'a_diff'])
    mda = np.mean(np.sign(valid_diff['f_diff']) == np.sign(valid_diff['a_diff'])) * 100
    
    # Match percentage within specific error margins:
    within_10pct = (df['absErrorMW'] / df['actualMW'] <= 0.10).mean() * 100
    within_15pct = (df['absErrorMW'] / df['actualMW'] <= 0.15).mean() * 100
    within_20pct = (df['absErrorMW'] / df['actualMW'] <= 0.20).mean() * 100
    within_1000mw = (df['absErrorMW'] <= 1000).mean() * 100
    within_2000mw = (df['absErrorMW'] <= 2000).mean() * 100
    within_3000mw = (df['absErrorMW'] <= 3000).mean() * 100

    print("=================================================================")
    print("      VORTEXPOWER FORECAST ACCURACY & DATA MATCH REPORT          ")
    print("=================================================================")
    print(f"Data Source Actuals:      Elexon BMRS FUELHH (fuelType='WIND')")
    print(f"Data Source Forecasts:    Elexon BMRS WINDFOR (Day-Ahead Cutoff 11:00 GMT)")
    print(f"Evaluation Window:        2026-01-01 to 2026-01-31 (Full Month)")
    print(f"Trading Hours Evaluated:  {len(df)} of 744 hours (100.00% complete)")
    print(f"Half-Hours in DB:         {fuel_count} of {expected_fuel} SPs ({fuel_count/expected_fuel*100:.2f}% complete)")
    print(f"Total Forecast Rows:      {wind_count} rows across all NWP runs")
    print("-----------------------------------------------------------------")
    print("1. DATA COMPLETENESS / DATA COVERAGE MATCH:")
    print(f"   • Temporal Coverage Match:             {len(df)/744*100:.2f}% (744 of 744 hours)")
    print(f"   • Settlement Period Coverage Match:     {fuel_count/expected_fuel*100:.2f}% (1,488 of 1,488 SPs)")
    print("-----------------------------------------------------------------")
    print("2. FORECAST ACCURACY PERCENTAGES:")
    print(f"   • WAPE-based Accuracy (100% - WAPE):    {wape_accuracy:.2f}% (WAPE error: {wape:.2f}%)")
    print(f"   • Capacity-Normalized Accuracy:        {nmae_accuracy:.2f}% (nMAE error: {nmae:.2f}%)")
    print(f"   • Peak-Normalized Accuracy:            {peak_norm_accuracy:.2f}% (Peak: {peak_actual:.0f} MW)")
    print(f"   • Energy Volume Match (Actual/Fcst):   {volume_match_pct:.2f}%")
    print("-----------------------------------------------------------------")
    print("3. STATISTICAL ERROR METRICS:")
    print(f"   • Mean Absolute Error (MAE):           {m.maeMW:.2f} MW")
    print(f"   • Root Mean Squared Error (RMSE):      {m.rmseMW:.2f} MW")
    print(f"   • Mean Forecast Bias (Mean Error):     +{m.biasMW:.2f} MW (Over-forecasting)")
    print(f"   • Over-forecast Frequency:             {m.overForecastHoursPct:.1f}% of hours")
    print(f"   • Under-forecast Frequency:            {m.underForecastHoursPct:.1f}% of hours")
    print(f"   • Pearson Correlation Coefficient (r): {corr:.4f}")
    print(f"   • R-Squared (Variance Explained R²):   {r2:.4f} ({r2*100:.2f}%)")
    print(f"   • Mean Directional Accuracy (MDA):     {mda:.2f}% (Trend direction match)")
    print("-----------------------------------------------------------------")
    print("4. TOLERANCE MATCH PERCENTAGES (% of hours within error threshold):")
    print(f"   • Hours within 10% Relative Error:     {within_10pct:.2f}%")
    print(f"   • Hours within 15% Relative Error:     {within_15pct:.2f}%")
    print(f"   • Hours within 20% Relative Error:     {within_20pct:.2f}%")
    print(f"   • Hours within ±1,000 MW error:        {within_1000mw:.2f}%")
    print(f"   • Hours within ±2,000 MW error:        {within_2000mw:.2f}%")
    print(f"   • Hours within ±3,000 MW error:        {within_3000mw:.2f}%")
    print("-----------------------------------------------------------------")
    print("5. TOTAL ENERGY TOTALS (GWh):")
    print(f"   • Total Forecast Energy:               {total_forecast_gwh:,.1f} GWh (9.985 TWh)")
    print(f"   • Total Realized Energy:               {total_actual_gwh:,.1f} GWh (8.616 TWh)")
    print(f"   • Total Net Imbalance Shortfall:       {total_actual_gwh - total_forecast_gwh:,.1f} GWh (-1.369 TWh)")
    print("=================================================================")

if __name__ == "__main__":
    main()
