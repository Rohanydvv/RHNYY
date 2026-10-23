import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import {
  Calendar, BarChart2, ShieldAlert, Clock, ArrowRight,
  TrendingDown, TrendingUp, AlertTriangle, Layers, Info
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
      {/* Date Filter & Range Controls */}
      <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-[#070A12] px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Window:</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-white text-xs font-mono font-medium focus:outline-none"
              />
              <span className="text-slate-600 font-mono">→</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-white text-xs font-mono font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 bg-[#070A12] px-3 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Auction Gate:</span>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-transparent text-xs text-white font-mono font-medium focus:outline-none"
              >
                <option value={9} className="bg-slate-900">09:00 GMT</option>
                <option value={11} className="bg-slate-900">11:00 GMT (EPEX/NordPool)</option>
                <option value={12} className="bg-slate-900">12:00 GMT</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] text-slate-500 font-medium mr-1 uppercase tracking-wider">Presets:</span>
            {[
              { id: 'full', label: 'Full Jan 2026 (744h)' },
              { id: 'w1', label: 'Week 1' },
              { id: 'w2', label: 'Week 2' },
              { id: 'w3', label: 'Week 3' },
              { id: 'w4', label: 'Week 4' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetRange(p.id)}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-all cursor-pointer whitespace-nowrap ${
                  (p.id === 'full' && startDate === '2026-01-01' && endDate === '2026-01-31')
                    ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 font-semibold'
                    : 'bg-[#070A12] text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {metrics && (
        <>
          {/* Quantitative Risk Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* MAE */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Mean Absolute Error (MAE)
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
                  {Math.round(metrics.maeMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Capacity nMAE: {metrics.nmaePct.toFixed(1)}%</span>
                <span>{metrics.sampleHoursCount} Hours</span>
              </div>
            </div>

            {/* RMSE */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Root Mean Squared Error (RMSE)
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-slate-200 tabular-nums">
                  {Math.round(metrics.rmseMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Peak Hour MAE: {Math.round(metrics.peakHoursMaeMW).toLocaleString()} MW</span>
                <span className="text-slate-500">Dispersion</span>
              </div>
            </div>

            {/* Trading Bias */}
            <div className="bg-[#0D1322] border border-rose-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="text-[10px] uppercase font-medium tracking-wider text-rose-300">
                  Trading Position Bias
                </span>
                <span className="text-[10px] text-rose-400 font-mono font-medium">84.4% Over-forecast</span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-rose-400 tabular-nums">
                  +{Math.round(metrics.biasMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-rose-300">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Max Miss: +{Math.round(metrics.maxOverForecastMW).toLocaleString()} MW</span>
                <span className="text-rose-400 font-medium">Short Imbalance</span>
              </div>
            </div>

            {/* WAPE Error & Accuracy */}
            <div className="bg-[#0D1322] border border-slate-800/90 rounded-xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400">
                  WAPE Error Rate
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Accuracy {(100 - metrics.wapePct).toFixed(1)}%</span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-cyan-400 tabular-nums">
                  {metrics.wapePct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60 font-mono">
                <span>Forecast: {metrics.totalForecastTWh} TWh</span>
                <span>Actual: {metrics.totalActualTWh} TWh</span>
              </div>
            </div>
          </div>

          {/* Quantitative Risk Briefing Note */}
          <div className="p-4 rounded-xl bg-[#070A12] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Quantitative Trader Finding: </strong>
                <span>
                  National wind forecasts over-projected power output in <strong className="text-white">{metrics.overForecastHoursPct}% of hours</strong> in January 2026, creating an average shortfall of <strong className="text-rose-400">+{Math.round(metrics.biasMW).toLocaleString()} MW</strong>. 
                  Trading desks should factor an 11–18% derating margin when scheduling day-ahead thermal hedge blocks.
                </span>
              </div>
            </div>
          </div>

          {/* Diurnal Hourly Profile & Error Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diurnal 24h Profile */}
            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    Diurnal Error Profile (00:00 to 23:00 GMT)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mean Absolute Error and Systematic Trading Bias evaluated across each hour of the day.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">24 Hourly Slices</span>
              </div>

              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={hourlyProfile.map(h => ({
                      hour: `${String(h.hour).padStart(2, '0')}:00`,
                      mae: Math.round(h.maeMW),
                      rmse: Math.round(h.rmseMW),
                      bias: Math.round(h.biasMW)
                    }))}
                    margin={{ top: 10, right: 15, left: 5, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={10} interval={2} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v} MW`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#F8FAFC'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={0} stroke="#334155" />
                    <Line type="monotone" dataKey="mae" name="MAE (MW)" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="rmse" name="RMSE (MW)" stroke="#94A3B8" strokeWidth={1.8} dot={false} />
                    <Line type="monotone" dataKey="bias" name="Mean Bias (MW)" stroke="#F43F5E" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span>Peak (07–19 GMT) MAE: <strong className="text-slate-200">{metrics.peakHoursMaeMW} MW</strong></span>
                <span>Off-Peak MAE: <strong className="text-slate-200">{metrics.offPeakHoursMaeMW} MW</strong></span>
              </div>
            </div>

            {/* Error Distribution Histogram */}
            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    Forecast Error Frequency Distribution (Forecast - Actual)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Histogram showing probability density, right-hand skewness, and tail volatility.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-500">744 Hours Sample</span>
              </div>

              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 10, right: 15, left: 5, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                    <XAxis
                      dataKey="binStart"
                      stroke="#64748B"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${Math.round(v / 1000)}k`}
                    />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}h`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#F8FAFC'
                      }}
                      formatter={(val, name, item) => [`${val} hours (${item.payload.frequencyPct}%)`, 'Trading Frequency']}
                      labelFormatter={(val, p) => p?.[0]?.payload?.binLabel || val}
                    />
                    <ReferenceLine x={0} stroke="#38BDF8" strokeDasharray="3 3" />
                    <Bar dataKey="count" name="Frequency (Hours)">
                      {distribution.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.binStart >= 0 ? '#F43F5E' : '#38BDF8'}
                          opacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Under-forecast: <strong className="text-slate-200">{metrics.underForecastHoursPct}%</strong></span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Over-forecast: <strong className="text-slate-200">{metrics.overForecastHoursPct}%</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Daily Trend Across Month */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Daily Day-Ahead Accuracy Trend Across January 2026
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily progression of Mean Absolute Error (bars) and Mean Trading Bias (line).
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">31 Daily Sessions</span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyBreakdown.map(d => ({
                    date: d.date.slice(5),
                    mae: Math.round(d.maeMW),
                    bias: Math.round(d.biasMW)
                  }))}
                  margin={{ top: 10, right: 15, left: 5, bottom: 15 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} tickFormatter={(v) => `${v} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#F8FAFC'
                    }}
                    formatter={(val, name) => [`${val.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="#334155" />
                  <Bar dataKey="mae" name="Daily MAE (MW)" fill="#F59E0B" opacity={0.75} />
                  <Line type="monotone" dataKey="bias" name="Daily Bias (MW)" stroke="#F43F5E" strokeWidth={2} dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
