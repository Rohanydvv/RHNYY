import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Calendar, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Download, Layers, RefreshCw, Zap, TrendingUp, HelpCircle
} from 'lucide-react';
import { fetchDayAheadForecast, fetchForecastEvolution } from '../services/api';

export default function DayAheadCockpit() {
  const [deliveryDate, setDeliveryDate] = useState('2026-01-05');
  const [cutoffHour, setCutoffHour] = useState(11);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionData, setEvolutionData] = useState(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);

  const quickDates = [
    { date: '2026-01-02', label: 'Jan 2: High Over-forecast (+3.2 GW)' },
    { date: '2026-01-05', label: 'Jan 5: Baseline Low Error (11% WAPE)' },
    { date: '2026-01-08', label: 'Jan 8: 18 GW Peak Ramp' },
    { date: '2026-01-15', label: 'Jan 15: Low Wind Day (<5 GW)' },
    { date: '2026-01-24', label: 'Jan 24: High Volatility' }
  ];

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

  const exportCSV = () => {
    if (!forecastData || !forecastData.hourlySeries) return;
    const headers = ['Hour', 'Settlement Periods', 'Target Start Time', 'Day-Ahead Forecast (MW)', 'Actual Generation (MW)', 'Error (MW)', 'Abs Error (MW)', 'Percent Error (%)', 'Forecast Publish Time'];
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
    link.setAttribute('download', `VortexPower_DayAhead_${deliveryDate}_Cutoff${cutoffHour}GMT.csv`);
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
      {/* Control Bar: Date & Gate Closure Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Delivery Date (Day D)</span>
              </label>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-mono font-medium shadow-inner"
              />
            </div>

            {/* Day-Ahead Gate Closure Cutoff */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Decision Cutoff (D-1 Gate Closure)</span>
              </label>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 font-mono font-medium shadow-inner"
              >
                <option value={9}>09:00 GMT (Early Morning Assessment)</option>
                <option value={10}>10:00 GMT (Pre-Auction Desk Review)</option>
                <option value={11}>11:00 GMT (EPEX SPOT / Nord Pool GB Benchmark Auction)</option>
                <option value={12}>12:00 GMT (European Standard Cutoff)</option>
                <option value={15}>15:30 GMT (Half-Hourly Auction Gate)</option>
              </select>
            </div>

            {/* Decision Timing Context Pill */}
            {summary && (
              <div className="hidden md:flex flex-col justify-end">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Decision Context</span>
                <span className="text-xs text-slate-300 font-mono bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  Decision Date: <strong className="text-cyan-400">{summary.decisionDate}</strong> @ {cutoffHour}:00 GMT
                </span>
              </div>
            )}
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Case Studies:</span>
            {quickDates.map((qd) => (
              <button
                key={qd.date}
                onClick={() => setDeliveryDate(qd.date)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  deliveryDate === qd.date
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {qd.label.split(':')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 text-sm">Querying Elexon WINDFOR and FUELHH streams for {deliveryDate}...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-2xl p-5 text-rose-300 flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Failed to retrieve forecast data</p>
            <p className="text-xs text-rose-300/80">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Day-Ahead Forecast
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
                  {(summary.totalForecastMWh / 1000).toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">GWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Peak: {Math.round(summary.peakForecastMW).toLocaleString()} MW
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Actual Generation
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                  {summary.totalActualMWh ? (summary.totalActualMWh / 1000).toFixed(1) : 'N/A'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">GWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Avg: {summary.totalActualMWh ? Math.round(summary.totalActualMWh / 24).toLocaleString() : 0} MW
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Mean Abs Error (MAE)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
                  {summary.maeMW ? Math.round(summary.maeMW).toLocaleString() : 'N/A'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MW</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Avg deviation per hour
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Root Mean Sq Err (RMSE)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-indigo-400 font-mono">
                  {summary.rmseMW ? Math.round(summary.rmseMW).toLocaleString() : 'N/A'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MW</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Penalizes extreme misses
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Trading Bias (Mean Err)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className={`text-xl sm:text-2xl font-bold font-mono ${
                  (summary.biasMW || 0) > 0 ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  {summary.biasMW ? `${summary.biasMW > 0 ? '+' : ''}${Math.round(summary.biasMW).toLocaleString()}` : '0'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MW</span>
              </div>
              <span className={`text-[11px] font-medium block mt-1 ${
                (summary.biasMW || 0) > 0 ? 'text-rose-400/90' : 'text-blue-400/90'
              }`}>
                {(summary.biasMW || 0) > 0 ? '⚠️ Over-forecasted' : 'ℹ️ Under-forecasted'}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                WAPE Error Rate
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">
                  {summary.wapePct != null ? `${summary.wapePct.toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Weighted percentage error
              </span>
            </div>
          </div>

          {/* Primary Visualization: Day-Ahead Forecast vs Realized Generation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <span>Day-Ahead Wind Forecast vs Realized Actual Generation</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                    Delivery Day {deliveryDate}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison of latest WINDFOR forecast published prior to {cutoffHour}:00 GMT on {summary.decisionDate} against realized FUELHH actuals.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowEvolution(!showEvolution)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    showEvolution
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showEvolution ? 'Hide Evolution' : 'View Forecast Evolution'}</span>
                </button>

                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-950 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-80 sm:h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${val.toLocaleString()} MW`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Day-Ahead Forecast') return [`${value.toLocaleString()} MW`, name];
                      if (name === 'Realized Actual') return [`${value.toLocaleString()} MW`, name];
                      if (name === 'Forecast Error (F - A)') return [`${value > 0 ? '+' : ''}${value.toLocaleString()} MW`, name];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return `${label} (${payload[0].payload.spRange}) · Pub @ ${payload[0].payload.publishTime}`;
                      }
                      return label;
                    }}
                  />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  
                  {/* Realized Actual Area */}
                  <Area
                    type="monotone"
                    dataKey="actualMW"
                    name="Realized Actual"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#actualGradient)"
                  />
                  
                  {/* Day-Ahead Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="forecastMW"
                    name="Day-Ahead Forecast"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#06b6d4' }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Hourly Error Indicator */}
                  <Line
                    type="monotone"
                    dataKey="errorMW"
                    name="Forecast Error (F - A)"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Decision Insights Callout Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <Zap className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200">Procurement Decision Reality Check: </span>
                  <span className="text-slate-400">
                    On {summary.decisionDate} at {cutoffHour}:00 GMT, procurement teams placed wholesale bids based on the 
                    <strong className="text-cyan-400"> {summary.totalForecastMWh.toLocaleString()} MWh</strong> forecast. 
                    Realized generation was <strong className="text-emerald-400">{summary.totalActualMWh?.toLocaleString()} MWh</strong>, 
                    creating an average hourly procurement gap of <strong className="text-amber-400">±{Math.round(summary.maeMW || 0).toLocaleString()} MW</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Run Forecast Evolution Drawer */}
          {showEvolution && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg animate-fadeIn">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Forecast Evolution Across Numerical Weather Prediction (NWP) Runs</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Observing how successive WINDFOR publications updated leading up to Gate Closure on {summary.decisionDate}.
                  </p>
                </div>
                {loadingEvolution && (
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                )}
              </div>

              {evolutionData && (
                <div className="h-80 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis
                        dataKey="hour"
                        type="category"
                        allowDuplicatedCategory={false}
                        stroke="#94a3b8"
                        fontSize={11}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickFormatter={(v) => `${v.toLocaleString()} MW`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                          fontSize: '12px'
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
                        name="Actual Realized"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                      />

                      {/* Evolution Runs */}
                      {evolutionData.evolutionSeries.map((series, idx) => {
                        const colors = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];
                        const col = colors[idx % colors.length];
                        const cleanPub = series.publishTime.replace('T', ' ').slice(5, 16);
                        const isLatest = idx === evolutionData.evolutionSeries.length - 1;

                        const seriesData = series.data.map(d => ({
                          hour: `${String(d.settlementHour).padStart(2, '0')}:00`,
                          generation: Math.round(d.generation)
                        }));

                        return (
                          <Line
                            key={series.publishTime}
                            data={seriesData}
                            type="monotone"
                            dataKey="generation"
                            name={`Run ${cleanPub} ${isLatest ? '(Locked Bid)' : ''}`}
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

          {/* Detailed Hourly Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Half-Hourly Settlement Schedule & Forecast Deviation</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete 24-hour settlement period profile for wholesale auction trade verification.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">24 Hours / 48 Settlement Periods</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Hour</th>
                    <th className="py-2.5 px-3">Settlement Periods</th>
                    <th className="py-2.5 px-3">Day-Ahead Forecast</th>
                    <th className="py-2.5 px-3">Realized Actual</th>
                    <th className="py-2.5 px-3">Error (F - A)</th>
                    <th className="py-2.5 px-3">Abs Error</th>
                    <th className="py-2.5 px-3">Error %</th>
                    <th className="py-2.5 px-3">Forecast Publish Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {forecastData.hourlySeries.map((row) => {
                    const isOver = row.errorMw > 0;
                    return (
                      <tr key={row.startTime} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2 px-3 font-semibold text-white">
                          {String(row.settlementHour).padStart(2, '0')}:00
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          SP {row.settlementHour * 2 + 1} - {row.settlementHour * 2 + 2}
                        </td>
                        <td className="py-2 px-3 text-cyan-400 font-medium">
                          {Math.round(row.forecastGeneration).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-medium">
                          {Math.round(row.actualGeneration).toLocaleString()} MW
                        </td>
                        <td className={`py-2 px-3 font-medium ${isOver ? 'text-rose-400' : 'text-blue-400'}`}>
                          {isOver ? '+' : ''}{Math.round(row.errorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-amber-400">
                          {Math.round(row.absErrorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          {row.percentageError != null ? `${row.percentageError.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {row.forecastPublishTime.replace('T', ' ').slice(0, 16)}Z
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
