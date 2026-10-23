import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Calendar, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  Download, Layers, RefreshCw, Zap, TrendingUp, Filter,
  ChevronLeft, ChevronRight, CheckCircle2
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
  const [chartView, setChartView] = useState('combined'); // 'combined', 'forecast', 'actual'

  // Curated benchmark sessions for quick desk testing
  const benchmarkSessions = [
    { date: '2026-01-02', label: 'Jan 02', tag: 'High Over-forecast (+3.2 GW Bias)', type: 'danger' },
    { date: '2026-01-05', label: 'Jan 05', tag: 'High Accuracy Baseline (11% WAPE)', type: 'success' },
    { date: '2026-01-08', label: 'Jan 08', tag: 'Major 18 GW Peak Ramp', type: 'info' },
    { date: '2026-01-15', label: 'Jan 15', tag: 'Low Wind Trough (<5 GW)', type: 'warning' },
    { date: '2026-01-24', label: 'Jan 24', tag: 'Tight Margin / Volatile', type: 'danger' }
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
    link.setAttribute('download', `VortexPower_UK_Wind_DA_${deliveryDate}_Gate${cutoffHour}GMT.csv`);
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
      {/* Control Surface: Date Scrubber & Gate Closure Selection */}
      <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Date Selector with Steppers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 bg-[#070A12] p-1 rounded-lg border border-slate-800">
              <button
                onClick={handlePrevDay}
                disabled={deliveryDate <= '2026-01-01'}
                className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                title="Previous delivery day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 px-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">Delivery:</span>
                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-01-31"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-transparent text-white text-xs font-mono font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleNextDay}
                disabled={deliveryDate >= '2026-01-31'}
                className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
                title="Next delivery day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Auction Gate Closure Cutoff */}
            <div className="flex items-center space-x-2 bg-[#070A12] px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Gate Closure Cutoff:</span>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-transparent text-xs text-white font-mono font-medium focus:outline-none cursor-pointer"
              >
                <option value={9} className="bg-slate-900">09:00 GMT (Pre-Morning Desk Brief)</option>
                <option value={10} className="bg-slate-900">10:00 GMT (Pre-Auction Gate Review)</option>
                <option value={11} className="bg-slate-900">11:00 GMT (EPEX SPOT / Nord Pool GB Benchmark)</option>
                <option value={12} className="bg-slate-900">12:00 GMT (European Standard Cutoff)</option>
                <option value={15} className="bg-slate-900">15:30 GMT (Half-Hourly Auction Gate)</option>
              </select>
            </div>
          </div>

          {/* Benchmark Trading Sessions Quick Nav */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] text-slate-500 font-medium mr-1 uppercase tracking-wider">Trading Case Studies:</span>
            {benchmarkSessions.map((s) => (
              <button
                key={s.date}
                onClick={() => setDeliveryDate(s.date)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all cursor-pointer whitespace-nowrap ${
                  deliveryDate === s.date
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 font-semibold shadow-sm'
                    : 'bg-[#070A12] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={s.tag}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-16 text-center">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Executing causal query across Elexon WINDFOR and FUELHH streams...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-rose-950/20 border border-rose-800/80 rounded-xl p-4 text-rose-300 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>Error retrieving dataset: {error}</span>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Executive Performance Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Day-Ahead Forecast Energy */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-medium uppercase tracking-wider text-[10px]">Day-Ahead Forecast (WINDFOR)</span>
                <span className="text-[10px] text-slate-500 font-mono">Locked 11:00 GMT</span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {(summary.totalForecastMWh / 1000).toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-400">GWh</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Peak: {Math.round(summary.peakForecastMW).toLocaleString()} MW</span>
                <span>Min: {Math.round(summary.minForecastMW).toLocaleString()} MW</span>
              </div>
            </div>

            {/* Card 2: Realized Generation */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-medium uppercase tracking-wider text-[10px]">Realized Generation (FUELHH)</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Metered</span>
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {summary.totalActualMWh ? (summary.totalActualMWh / 1000).toFixed(1) : '—'}
                </span>
                <span className="text-xs font-semibold text-slate-400">GWh</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Avg: {summary.totalActualMWh ? Math.round(summary.totalActualMWh / 24).toLocaleString() : 0} MW</span>
                <span className={summary.totalActualMWh && summary.totalActualMWh < summary.totalForecastMWh ? 'text-rose-400' : 'text-emerald-400'}>
                  {summary.totalActualMWh ? `${((summary.totalActualMWh / summary.totalForecastMWh - 1) * 100).toFixed(1)}%` : ''}
                </span>
              </div>
            </div>

            {/* Card 3: Forecast Error Metrics */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-medium uppercase tracking-wider text-[10px]">Mean Absolute Error</span>
                <span className="text-[10px] text-slate-500 font-mono">WAPE: {summary.wapePct != null ? `${summary.wapePct.toFixed(1)}%` : 'N/A'}</span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
                  {summary.maeMW ? Math.round(summary.maeMW).toLocaleString() : '—'}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>RMSE: {summary.rmseMW ? Math.round(summary.rmseMW).toLocaleString() : '—'} MW</span>
                <span>Accuracy: {summary.wapePct != null ? `${(100 - summary.wapePct).toFixed(1)}%` : '—'}</span>
              </div>
            </div>

            {/* Card 4: Procurement Position Bias */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-medium uppercase tracking-wider text-[10px]">Desk Position Imbalance Bias</span>
                <span className={`text-[10px] font-mono font-medium ${
                  (summary.biasMW || 0) > 0 ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  {(summary.biasMW || 0) > 0 ? 'SHORT RISK' : 'LONG SURPLUS'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                  (summary.biasMW || 0) > 0 ? 'text-rose-400' : 'text-blue-400'
                }`}>
                  {summary.biasMW ? `${summary.biasMW > 0 ? '+' : ''}${Math.round(summary.biasMW).toLocaleString()}` : '0'}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Net Gap: {summary.totalActualMWh ? `${Math.round(summary.totalForecastMWh - summary.totalActualMWh).toLocaleString()} MWh` : '—'}</span>
                <span className={(summary.biasMW || 0) > 0 ? 'text-rose-400' : 'text-blue-400'}>
                  {(summary.biasMW || 0) > 0 ? 'Over-forecast' : 'Under-forecast'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Chart: Generation Profile */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Day-Ahead Generation Schedule vs Realized Actual Generation
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Delivery Day {deliveryDate}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison of latest WINDFOR forecast published prior to {cutoffHour}:00 GMT on {summary.decisionDate} against actual metered FUELHH.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEvolution(!showEvolution)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    showEvolution
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40'
                      : 'bg-[#070A12] text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showEvolution ? 'Hide NWP Evolution' : 'View NWP Model Evolution'}</span>
                </button>

                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#070A12] text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* High-Performance Recharts Display */}
            <div className="h-80 sm:h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 15, left: 5, bottom: 15 }}>
                  <defs>
                    <linearGradient id="actualAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={(val) => `${val.toLocaleString()} MW`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      padding: '10px 14px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.7)'
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

                  {/* Realized Actual Area */}
                  <Area
                    type="monotone"
                    dataKey="actualMW"
                    name="Realized Actual"
                    stroke="#10B981"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#actualAreaGrad)"
                  />

                  {/* Day-Ahead Forecast Line */}
                  <Line
                    type="monotone"
                    dataKey="forecastMW"
                    name="Day-Ahead Forecast"
                    stroke="#38BDF8"
                    strokeWidth={2.2}
                    dot={{ r: 2.5, fill: '#38BDF8', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />

                  {/* Differential Error Line */}
                  <Line
                    type="monotone"
                    dataKey="errorMW"
                    name="Forecast Gap (F - A)"
                    stroke="#F43F5E"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trading Decision Note */}
            <div className="mt-4 p-3 rounded-lg bg-[#070A12] border border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>
                  <strong>Procurement Context: </strong>
                  At 11:00 GMT on {summary.decisionDate}, your desk locked bids based on <strong className="text-slate-200">{summary.totalForecastMWh.toLocaleString()} MWh</strong> forecasted wind. Realized wind delivered <strong className="text-slate-200">{summary.totalActualMWh?.toLocaleString()} MWh</strong>.
                </span>
              </div>
              <span className="font-mono text-slate-500 hidden md:inline">Elexon BMRS WINDFOR Stream</span>
            </div>
          </div>

          {/* NWP Evolution Drawer (Optional Collapsible) */}
          {showEvolution && (
            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>NWP Weather Model Evolution leading up to Gate Closure</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Successive WINDFOR runs published on {summary.decisionDate} prior to the 11:00 GMT auction gate closure.
                  </p>
                </div>
                {loadingEvolution && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
              </div>

              {evolutionData && (
                <div className="h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 10, right: 15, left: 5, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        type="category"
                        allowDuplicatedCategory={false}
                        stroke="#64748B"
                        fontSize={11}
                      />
                      <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()} MW`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          color: '#F8FAFC',
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
                        stroke="#10B981"
                        strokeWidth={2.8}
                        dot={false}
                      />

                      {/* Evolution Runs */}
                      {evolutionData.evolutionSeries.map((series, idx) => {
                        const colors = ['#E2E8F0', '#94A3B8', '#F59E0B', '#A855F7', '#38BDF8'];
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
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Settlement Schedule & Forecast Deviation Audit (SP 1 to 48)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete hourly resolution with corresponding Elexon BSC half-hourly Settlement Periods.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">24 Hours / 48 Settlement Periods</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070A12] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {forecastData.hourlySeries.map((row) => {
                    const isOver = row.errorMw > 0;
                    return (
                      <tr key={row.startTime} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-3 font-semibold text-white">
                          {String(row.settlementHour).padStart(2, '0')}:00
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          SP {row.settlementHour * 2 + 1} - {row.settlementHour * 2 + 2}
                        </td>
                        <td className="py-2 px-3 text-right text-cyan-300 font-medium">
                          {Math.round(row.forecastGeneration).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                          {Math.round(row.actualGeneration).toLocaleString()} MW
                        </td>
                        <td className={`py-2 px-3 text-right font-medium ${isOver ? 'text-rose-400' : 'text-blue-400'}`}>
                          {isOver ? '+' : ''}{Math.round(row.errorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-amber-400">
                          {Math.round(row.absErrorMw).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">
                          {row.percentageError != null ? `${row.percentageError.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
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
