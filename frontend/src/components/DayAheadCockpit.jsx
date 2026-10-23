import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Calendar, Clock, AlertCircle, Download, Layers, RefreshCw,
  ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Info
} from 'lucide-react';
import { fetchDayAheadForecast, fetchForecastEvolution } from '../services/api';

export default function DayAheadCockpit({ deliveryDate, setDeliveryDate }) {
  const [cutoffHour, setCutoffHour] = useState(11);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionData, setEvolutionData] = useState(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDayAheadForecast(deliveryDate, cutoffHour, 0);
      setForecastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadEvolution = async () => {
    if (!showEvolution) return;
    setLoadingEvolution(true);
    try {
      const data = await fetchForecastEvolution(deliveryDate, cutoffHour, 0);
      setEvolutionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvolution(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deliveryDate, cutoffHour]);

  useEffect(() => {
    if (showEvolution) {
      loadEvolution();
    }
  }, [showEvolution, deliveryDate, cutoffHour]);

  const handlePrevDay = () => {
    const d = new Date(deliveryDate);
    d.setDate(d.getDate() - 1);
    if (d >= new Date('2026-01-01')) {
      setDeliveryDate(d.toISOString().split('T')[0]);
    }
  };

  const handleNextDay = () => {
    const d = new Date(deliveryDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date('2026-01-31')) {
      setDeliveryDate(d.toISOString().split('T')[0]);
    }
  };

  const exportCSV = () => {
    if (!forecastData || !forecastData.hourlySeries) return;
    const headers = [
      'Settlement Hour',
      'Settlement Periods',
      'Target ISO Start',
      'Day-Ahead Forecast (MW)',
      'Realized Actual (MW)',
      'Error (MW)',
      'Abs Error (MW)',
      'Error Pct (%)',
      'Forecast Published ISO'
    ];
    const rows = forecastData.hourlySeries.map(p => [
      p.settlementHour,
      `SP ${p.settlementHour * 2 + 1}-${p.settlementHour * 2 + 2}`,
      p.startTime,
      p.forecastGeneration,
      p.actualGeneration,
      p.errorMw,
      p.absErrorMw,
      p.percentageError != null ? p.percentageError.toFixed(2) : 'N/A',
      p.forecastPublishTime
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VortexPower_Wind_DA_${deliveryDate}_Gate${cutoffHour}GMT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = forecastData?.summary;
  const chartData = forecastData?.hourlySeries.map(p => ({
    hour: `${String(p.settlementHour).padStart(2, '0')}:00`,
    settlementHour: p.settlementHour,
    spRange: `SP ${p.settlementHour * 2 + 1}-${p.settlementHour * 2 + 2}`,
    forecastMW: Math.round(p.forecastGeneration),
    actualMW: Math.round(p.actualGeneration),
    errorMW: Math.round(p.errorMw),
    absErrorMW: Math.round(p.absErrorMw),
    publishTime: p.forecastPublishTime.slice(11, 16) + 'Z'
  })) || [];

  return (
    <div className="space-y-6">
      {/* Control Surface: Date & Gate Closure Filter */}
      <div className="bg-white border border-[#E0E9E2] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Delivery Date Stepper */}
            <div className="flex items-center space-x-1 bg-[#F7F9F5] p-1 rounded-xl border border-[#E0E9E2]">
              <button
                onClick={handlePrevDay}
                disabled={deliveryDate <= '2026-01-01'}
                className="p-1.5 rounded-lg text-[#1D302B] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous delivery day"
              >
                <ChevronLeft className="w-4 h-4 text-[#167D5A]" />
              </button>

              <div className="flex items-center space-x-2 px-2.5">
                <Calendar className="w-4 h-4 text-[#167D5A]" />
                <span className="text-xs font-medium text-[#75847D]">Delivery:</span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-transparent text-[#1D302B] text-xs font-mono font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleNextDay}
                disabled={deliveryDate >= '2026-01-31'}
                className="p-1.5 rounded-lg text-[#1D302B] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Next delivery day"
              >
                <ChevronRight className="w-4 h-4 text-[#167D5A]" />
              </button>
            </div>

            {/* Auction Gate Closure Cutoff */}
            <div className="flex items-center space-x-2 bg-[#F7F9F5] px-3.5 py-2 rounded-xl border border-[#E0E9E2]">
              <Clock className="w-4 h-4 text-[#167D5A]" />
              <span className="text-xs font-medium text-[#75847D]">Auction Gate Cutoff:</span>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-transparent text-xs text-[#1D302B] font-mono font-semibold focus:outline-none cursor-pointer"
              >
                <option value={9}>09:00 GMT (Early Morning Desk Review)</option>
                <option value={10}>10:00 GMT (Pre-Auction Gate Review)</option>
                <option value={11}>11:00 GMT (EPEX SPOT / Nord Pool GB Benchmark)</option>
                <option value={12}>12:00 GMT (European Standard Cutoff)</option>
                <option value={15}>15:30 GMT (Half-Hourly Auction Gate)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowEvolution(!showEvolution)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                showEvolution
                  ? 'bg-[#167D5A] text-white border-[#167D5A] shadow-xs'
                  : 'bg-white text-[#1D302B] border-[#E0E9E2] hover:bg-[#F7F9F5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showEvolution ? 'Hide NWP Evolution' : 'View NWP Model Evolution'}</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#167D5A] text-white hover:bg-[#126448] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white border border-[#E0E9E2] rounded-2xl p-16 text-center shadow-xs">
          <RefreshCw className="w-7 h-7 text-[#167D5A] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#75847D] font-mono">Querying Elexon WINDFOR and FUELHH streams for {deliveryDate}...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>Error retrieving dataset: {error}</span>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Executive Performance Metric Cards (White cards, Pale Green-Gray borders) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Day-Ahead Forecast */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#75847D] text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#75847D]">Day-Ahead Forecast</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F4F1] text-[#167D5A] font-mono font-medium">Locked 11:00</span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1D302B] tabular-nums font-['Plus_Jakarta_Sans']">
                  {(summary.totalForecastMWh / 1000).toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">GWh</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Peak: {Math.round(summary.peakForecastMW).toLocaleString()} MW</span>
                <span>Avg: {Math.round(summary.averageForecastMW).toLocaleString()} MW</span>
              </div>
            </div>

            {/* Card 2: Realized Generation */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#75847D] text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#75847D]">Realized Actuals</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF5E9] text-[#167D5A] font-mono font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#167D5A]"></span>
                  <span>Metered</span>
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#1D302B] tabular-nums font-['Plus_Jakarta_Sans']">
                  {summary.totalActualMWh ? (summary.totalActualMWh / 1000).toFixed(1) : '—'}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">GWh</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Avg: {summary.totalActualMWh ? Math.round(summary.totalActualMWh / 24).toLocaleString() : 0} MW</span>
                <span className={summary.totalActualMWh && summary.totalActualMWh < summary.totalForecastMWh ? 'text-amber-700 font-semibold' : 'text-[#167D5A] font-semibold'}>
                  {summary.totalActualMWh ? `${((summary.totalActualMWh / summary.totalForecastMWh - 1) * 100).toFixed(1)}%` : ''}
                </span>
              </div>
            </div>

            {/* Card 3: Forecast Accuracy (MAE) */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#75847D] text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#75847D]">Mean Absolute Error</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F9F5] text-[#1D302B] font-mono font-medium">
                  WAPE {summary.wapePct != null ? `${summary.wapePct.toFixed(1)}%` : '—'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#167D5A] tabular-nums font-['Plus_Jakarta_Sans']">
                  {summary.maeMW ? Math.round(summary.maeMW).toLocaleString() : '—'}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>RMSE: {summary.rmseMW ? Math.round(summary.rmseMW).toLocaleString() : '—'} MW</span>
                <span className="text-[#167D5A] font-semibold">Acc: {summary.wapePct != null ? `${(100 - summary.wapePct).toFixed(1)}%` : '—'}</span>
              </div>
            </div>

            {/* Card 4: Position Bias */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-[#75847D] text-xs mb-1">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-[#75847D]">Position Bias</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  (summary.biasMW || 0) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-50 text-blue-800'
                }`}>
                  {(summary.biasMW || 0) > 0 ? 'SHORT RISK' : 'SURPLUS'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums font-['Plus_Jakarta_Sans'] ${
                  (summary.biasMW || 0) > 0 ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {summary.biasMW ? `${summary.biasMW > 0 ? '+' : ''}${Math.round(summary.biasMW).toLocaleString()}` : '0'}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Net Gap: {summary.totalActualMWh ? `${Math.round(summary.totalForecastMWh - summary.totalActualMWh).toLocaleString()} MWh` : '—'}</span>
                <span>{(summary.biasMW || 0) > 0 ? 'Over-forecast' : 'Under-forecast'}</span>
              </div>
            </div>
          </div>

          {/* Primary Visualization: Day-Ahead Wind Forecast vs Realized Generation */}
          <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E0E9E2] gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                  Day-Ahead Wind Forecast vs Realized Actual Generation
                </h3>
                <p className="text-xs text-[#75847D] mt-0.5">
                  Comparison of latest WINDFOR forecast published prior to {cutoffHour}:00 GMT on {summary.decisionDate} against realized FUELHH actuals.
                </p>
              </div>

              {/* Fresh Lime Highlight Accent used sparingly */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#F7F9F5] border border-[#E0E9E2] text-[11px] text-[#1D302B]">
                <span className="w-2 h-2 rounded-full bg-[#B8E35A]"></span>
                <span className="font-medium font-mono">Delivery Day {deliveryDate}</span>
              </div>
            </div>

            {/* Recharts Chart with Light Palette */}
            <div className="h-80 sm:h-96 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 15 }}>
                  <defs>
                    <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#167D5A" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#167D5A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#75847D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E0E9E2' }}
                  />
                  <YAxis
                    stroke="#75847D"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E0E9E2' }}
                    tickFormatter={(val) => `${val.toLocaleString()} MW`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E0E9E2',
                      borderRadius: '0.75rem',
                      color: '#1D302B',
                      fontSize: '11px',
                      padding: '10px 14px',
                      boxShadow: '0 4px 20px -2px rgba(16, 42, 36, 0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Day-Ahead Forecast') return [`${value.toLocaleString()} MW`, name];
                      if (name === 'Realized Actual') return [`${value.toLocaleString()} MW`, name];
                      if (name === 'Forecast Gap (F - A)') {
                        const prefix = value > 0 ? '+' : '';
                        return [`${prefix}${value.toLocaleString()} MW`, name];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return `${label} (${payload[0].payload.spRange}) · Pub ${payload[0].payload.publishTime}`;
                      }
                      return label;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '2px' }}
                  />

                  {/* Realized Actual Area (Forest Green) */}
                  <Area
                    type="monotone"
                    dataKey="actualMW"
                    name="Realized Actual"
                    stroke="#167D5A"
                    strokeWidth={2.4}
                    fillOpacity={1}
                    fill="url(#actualAreaGrad)"
                  />

                  {/* Day-Ahead Forecast Line (Dark Forest / Charcoal) */}
                  <Line
                    type="monotone"
                    dataKey="forecastMW"
                    name="Day-Ahead Forecast"
                    stroke="#102A24"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#102A24', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />

                  {/* Differential Gap Line (Subtle amber/rose dashed) */}
                  <Line
                    type="monotone"
                    dataKey="errorMW"
                    name="Forecast Gap (F - A)"
                    stroke="#D97706"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Decision Reality Callout Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#F0F4F1] border border-[#E0E9E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#1D302B]">
              <div className="flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#167D5A] shrink-0"></span>
                <span>
                  <strong>Procurement Context: </strong>
                  At 11:00 GMT on {summary.decisionDate}, your desk locked bids based on <strong className="text-[#167D5A]">{summary.totalForecastMWh.toLocaleString()} MWh</strong> forecasted wind. Realized wind delivered <strong className="text-[#102A24]">{summary.totalActualMWh?.toLocaleString()} MWh</strong>.
                </span>
              </div>
              <span className="font-mono text-[#75847D] text-[11px] hidden md:inline shrink-0">Elexon BMRS WINDFOR Stream</span>
            </div>
          </div>

          {/* NWP Evolution Drawer (Optional) */}
          {showEvolution && (
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="pb-3 border-b border-[#E0E9E2] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans'] flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#167D5A]" />
                    <span>NWP Weather Model Evolution leading up to Gate Closure</span>
                  </h4>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Successive WINDFOR runs published on {summary.decisionDate} prior to 11:00 GMT auction gate closure.
                  </p>
                </div>
                {loadingEvolution && <RefreshCw className="w-4 h-4 text-[#167D5A] animate-spin" />}
              </div>

              {evolutionData && (
                <div className="h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 10, right: 15, left: 5, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        type="category"
                        allowDuplicatedCategory={false}
                        stroke="#75847D"
                        fontSize={11}
                      />
                      <YAxis stroke="#75847D" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()} MW`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E0E9E2',
                          borderRadius: '0.5rem',
                          color: '#1D302B',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />

                      {/* Actual Curve */}
                      <Line
                        data={evolutionData.actualHourlySeries.map(a => ({
                          hour: `${String(a.hour).padStart(2, '0')}:00`,
                          actual: Math.round(a.generation)
                        }))}
                        type="monotone"
                        dataKey="actual"
                        name="Realized Actual"
                        stroke="#167D5A"
                        strokeWidth={2.8}
                        dot={false}
                      />

                      {/* Evolution Runs */}
                      {evolutionData.evolutionSeries.map((series, idx) => {
                        const colors = ['#94A3B8', '#64748B', '#D97706', '#8B5CF6', '#102A24'];
                        const col = colors[idx % colors.length];
                        const cleanPub = series.publishTime.slice(11, 16) + 'Z';
                        const isLatest = idx === evolutionData.evolutionSeries.length - 1;

                        const sData = series.data.map(d => ({
                          hour: `${String(d.settlementHour).padStart(2, '0')}:00`,
                          generation: Math.round(d.generation)
                        }));

                        return (
                          <Line
                            key={series.publishTime}
                            data={sData}
                            type="monotone"
                            dataKey="generation"
                            name={`Run ${cleanPub} ${isLatest ? '(Final Bid)' : ''}`}
                            stroke={col}
                            strokeWidth={isLatest ? 2.5 : 1.2}
                            strokeDasharray={isLatest ? undefined : '3 3'}
                            dot={false}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Half-Hourly Settlement Audit Table */}
          <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E9E2]">
              <div>
                <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                  Settlement Schedule & Forecast Deviation Audit (SP 1 to 48)
                </h3>
                <p className="text-xs text-[#75847D] mt-0.5">
                  Complete hourly resolution with corresponding Elexon BSC half-hourly Settlement Periods.
                </p>
              </div>
              <span className="text-xs text-[#75847D] font-mono">24 Hours / 48 Settlement Periods</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F0F4F1] text-[#1D302B] uppercase text-[10px] tracking-wider border-b border-[#E0E9E2]">
                  <tr>
                    <th className="py-2.5 px-3">Hour</th>
                    <th className="py-2.5 px-3">Settlement Periods</th>
                    <th className="py-2.5 px-3 text-right">Day-Ahead Forecast</th>
                    <th className="py-2.5 px-3 text-right">Realized Actual</th>
                    <th className="py-2.5 px-3 text-right">Deviation (F - A)</th>
                    <th className="py-2.5 px-3 text-right">Abs Error</th>
                    <th className="py-2.5 px-3 text-right">Error %</th>
                    <th className="py-2.5 px-3">Forecast Locked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E9E2] text-[#1D302B]">
                  {forecastData.hourlySeries.map((row) => {
                    const isOver = row.errorMw > 0;
                    return (
                      <tr key={row.startTime} className="hover:bg-[#F7F9F5] transition-colors">
                        <td className="py-2 px-3 font-semibold text-[#1D302B]">
                          {String(row.settlementHour).padStart(2, '0')}:00
                        </td>
                        <td className="py-2 px-3 text-[#75847D]">
                          SP {row.settlementHour * 2 + 1} - {row.settlementHour * 2 + 2}
                        </td>
                        <td className="py-2 px-3 text-right text-[#102A24] font-medium">
                          {Math.round(row.forecastGeneration).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-[#167D5A] font-semibold">
                          {Math.round(row.actualGeneration).toLocaleString()} MW
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${isOver ? 'text-amber-800' : 'text-blue-700'}`}>
                          {isOver ? '+' : ''}{Math.round(row.errorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-[#75847D]">
                          {Math.round(row.absErrorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-[#1D302B]">
                          {row.percentageError != null ? `${row.percentageError.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-2 px-3 text-[#75847D] text-[11px]">
                          {row.forecastPublishTime.slice(11, 16)}Z ({row.forecastPublishTime.slice(5, 10)})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
