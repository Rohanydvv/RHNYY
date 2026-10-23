import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import {
  Calendar, BarChart3, AlertOctagon, TrendingDown, TrendingUp,
  Percent, ShieldAlert, Award, Clock, ArrowRight, Download
} from 'lucide-react';
import {
  fetchAccuracyMetrics, fetchHourlyProfile, fetchDailyBreakdown, fetchErrorDistribution
} from '../services/api';

export default function EvaluationStudio() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [cutoffHour, setCutoffHour] = useState(11);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [hourlyProfile, setHourlyProfile] = useState([]);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [distribution, setDistribution] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, hp, db, dist] = await Promise.all([
        fetchAccuracyMetrics(startDate, endDate, cutoffHour),
        fetchHourlyProfile(startDate, endDate, cutoffHour),
        fetchDailyBreakdown(startDate, endDate, cutoffHour),
        fetchErrorDistribution(startDate, endDate, cutoffHour, 16)
      ]);
      setMetrics(m);
      setHourlyProfile(hp);
      setDailyBreakdown(db);
      setDistribution(dist);
    } catch (err) {
      console.error('Failed to load evaluation metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, cutoffHour]);

  const setPresetRange = (preset) => {
    if (preset === 'full') {
      setStartDate('2026-01-01');
      setEndDate('2026-01-31');
    } else if (preset === 'w1') {
      setStartDate('2026-01-01');
      setEndDate('2026-01-07');
    } else if (preset === 'w2') {
      setStartDate('2026-01-08');
      setEndDate('2026-01-14');
    } else if (preset === 'w3') {
      setStartDate('2026-01-15');
      setEndDate('2026-01-21');
    } else if (preset === 'w4') {
      setStartDate('2026-01-22');
      setEndDate('2026-01-31');
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range & Gate Closure Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Evaluation Window Start</label>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Evaluation Window End</label>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Decision Gate Cutoff</label>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
              >
                <option value={9}>09:00 GMT (Early Morning)</option>
                <option value={11}>11:00 GMT (EPEX SPOT / Nord Pool Benchmark)</option>
                <option value={12}>12:00 GMT (European Standard)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
            <button
              onClick={() => setPresetRange('full')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                startDate === '2026-01-01' && endDate === '2026-01-31'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Full Jan 2026 (744h)
            </button>
            <button
              onClick={() => setPresetRange('w1')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                startDate === '2026-01-01' && endDate === '2026-01-07'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Week 1
            </button>
            <button
              onClick={() => setPresetRange('w2')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                startDate === '2026-01-08' && endDate === '2026-01-14'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Week 2
            </button>
            <button
              onClick={() => setPresetRange('w3')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                startDate === '2026-01-15' && endDate === '2026-01-21'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Week 3
            </button>
            <button
              onClick={() => setPresetRange('w4')}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                startDate === '2026-01-22' && endDate === '2026-01-31'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Week 4
            </button>
          </div>
        </div>
      </div>

      {metrics && (
        <>
          {/* Executive Quantitative Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* MAE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Mean Abs Error (MAE)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  {Math.round(metrics.maeMW).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MW</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Average deviation per hour
              </span>
            </div>

            {/* RMSE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Root Mean Sq Err (RMSE)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-indigo-400 font-mono">
                  {Math.round(metrics.rmseMW).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MW</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Volatility & spike sensitivity
              </span>
            </div>

            {/* Trading Bias */}
            <div className="bg-slate-900 border border-rose-900/40 bg-gradient-to-br from-slate-900 to-rose-950/20 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-rose-300 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Trading Bias (Mean Err)</span>
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-rose-400 font-mono">
                  +{Math.round(metrics.biasMW).toLocaleString()}
                </span>
                <span className="text-xs text-rose-300 font-semibold">MW</span>
              </div>
              <span className="text-[11px] text-rose-400/90 font-medium block mt-1">
                ⚠️ Systematic Over-forecast
              </span>
            </div>

            {/* WAPE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Weighted Abs Err (WAPE)
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-purple-400 font-mono">
                  {metrics.wapePct.toFixed(1)}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Sum(|err|) / Sum(Actual)
              </span>
            </div>

            {/* Capacity-Normalized nMAE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Capacity-Norm nMAE
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-cyan-400 font-mono">
                  {metrics.nmaePct.toFixed(1)}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Relative to 21 GW UK fleet
              </span>
            </div>

            {/* Over-forecast Frequency */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Over-forecast Rate
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-rose-400 font-mono">
                  {metrics.overForecastHoursPct.toFixed(1)}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                {metrics.sampleHoursCount} sample hours
              </span>
            </div>
          </div>

          {/* Key Domain Warning Alert */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">
                  Critical Procurement Finding for Day-Ahead Trading Desk
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Across January 2026, Elexon WINDFOR forecasts over-estimated wind generation in <strong className="text-white">{metrics.overForecastHoursPct}%</strong> of all trading periods, with an average bias of <strong className="text-white">+{Math.round(metrics.biasMW).toLocaleString()} MW</strong>. 
                  A desk relying unadjusted on raw forecasts would systematically under-procure thermal energy at Day-Ahead auction, resulting in persistent short balancing cashouts.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-slate-400 block">Total Forecast: <strong className="text-cyan-400">{metrics.totalForecastTWh} TWh</strong></span>
              <span className="text-xs font-mono text-slate-400 block">Total Realized: <strong className="text-emerald-400">{metrics.totalActualTWh} TWh</strong></span>
            </div>
          </div>

          {/* Diurnal Hourly Profile & Error Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diurnal Error Profile */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Diurnal Error Profile (Hour 00 to 23 GMT)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reveals how forecasting error changes across morning ramp, afternoon, and evening peak hours.
                </p>
              </div>

              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyProfile.map(h => ({
                    hour: `${String(h.hour).padStart(2, '0')}:00`,
                    mae: Math.round(h.maeMW),
                    rmse: Math.round(h.rmseMW),
                    bias: Math.round(h.biasMW)
                  }))} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} interval={2} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v} MW`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f8fafc'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="mae" name="MAE (MW)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="rmse" name="RMSE (MW)" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="bias" name="Mean Bias (MW)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Peak Hours (07:00-19:00) MAE: <strong className="text-amber-400 font-mono">{metrics.peakHoursMaeMW} MW</strong></span>
                <span>Off-Peak MAE: <strong className="text-indigo-400 font-mono">{metrics.offPeakHoursMaeMW} MW</strong></span>
              </div>
            </div>

            {/* Error Distribution Histogram */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Forecast Error Frequency Distribution (Forecast - Actual)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Histogram of error buckets (MW) demonstrating positive skew and fat tail risks.
                </p>
              </div>

              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="binStart" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v > 0 ? '+' : ''}${Math.round(v/1000)}k`} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v}h`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '11px',
                        color: '#f8fafc'
                      }}
                      formatter={(val, name, item) => [`${val} hours (${item.payload.frequencyPct}%)`, 'Occurrences']}
                      labelFormatter={(val, payload) => payload?.[0]?.payload?.binLabel || val}
                    />
                    <ReferenceLine x={0} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: 'Zero Error', fill: '#38bdf8', fontSize: 10 }} />
                    <Bar dataKey="count" name="Trading Hours">
                      {distribution.map((entry, index) => {
                        const isOver = entry.binStart >= 0;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isOver ? '#f43f5e' : '#38bdf8'}
                            opacity={0.85}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span>
                  <span>Under-forecast: <strong className="text-blue-300 font-mono">{metrics.underForecastHoursPct}%</strong></span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                  <span>Over-forecast: <strong className="text-rose-300 font-mono">{metrics.overForecastHoursPct}%</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Daily Accuracy Trend Across Entire Month */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">Daily Day-Ahead Accuracy Trend Across January 2026</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Day-by-day progression of Mean Absolute Error (MAE) and Mean Bias (Forecast - Actual).
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">31 Delivery Days</span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyBreakdown.map(d => ({
                  date: d.date.slice(5),
                  fullDate: d.date,
                  mae: Math.round(d.maeMW),
                  bias: Math.round(d.biasMW),
                  wape: d.wapePct
                }))} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                    formatter={(val, name) => [`${val.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="#64748b" />
                  <Bar dataKey="mae" name="Daily MAE (MW)" fill="#f59e0b" opacity={0.85} />
                  <Line type="monotone" dataKey="bias" name="Daily Bias (MW)" stroke="#f43f5e" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
