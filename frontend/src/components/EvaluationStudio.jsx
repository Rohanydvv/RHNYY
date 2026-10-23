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
      <div className="bg-white border border-[#E0E9E2] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-[#F7F9F5] px-3.5 py-2 rounded-xl border border-[#E0E9E2]">
              <Calendar className="w-4 h-4 text-[#167D5A]" />
              <span className="text-xs font-medium text-[#75847D]">Evaluation Window:</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[#1D302B] text-xs font-mono font-semibold focus:outline-none"
              />
              <span className="text-[#75847D] font-mono">→</span>
              <input
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[#1D302B] text-xs font-mono font-semibold focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 bg-[#F7F9F5] px-3.5 py-2 rounded-xl border border-[#E0E9E2]">
              <Clock className="w-4 h-4 text-[#167D5A]" />
              <span className="text-xs font-medium text-[#75847D]">Gate Cutoff:</span>
              <select
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="bg-transparent text-xs text-[#1D302B] font-mono font-semibold focus:outline-none cursor-pointer"
              >
                <option value={9}>09:00 GMT</option>
                <option value={11}>11:00 GMT (EPEX/NordPool)</option>
                <option value={12}>12:00 GMT</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-[11px] text-[#75847D] font-medium mr-1 uppercase tracking-wider">Presets:</span>
            {[
              { id: 'full', label: 'Full Jan 2026 (744h)' },
              { id: 'w1', label: 'Week 1' },
              { id: 'w2', label: 'Week 2' },
              { id: 'w3', label: 'Week 3' },
              { id: 'w4', label: 'Week 4' }
            ].map((p) => {
              const isActive = (p.id === 'full' && startDate === '2026-01-01' && endDate === '2026-01-31');
              return (
                <button
                  key={p.id}
                  onClick={() => setPresetRange(p.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#167D5A] text-white border-[#167D5A] font-semibold shadow-xs'
                      : 'bg-[#F7F9F5] text-[#1D302B] border-[#E0E9E2] hover:bg-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {metrics && (
        <>
          {/* Quantitative Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* MAE */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Mean Absolute Error (MAE)
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#167D5A] tabular-nums font-['Plus_Jakarta_Sans']">
                  {Math.round(metrics.maeMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Capacity nMAE: {metrics.nmaePct.toFixed(1)}%</span>
                <span>{metrics.sampleHoursCount} Hours</span>
              </div>
            </div>

            {/* RMSE */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Root Mean Squared Error
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#102A24] tabular-nums font-['Plus_Jakarta_Sans']">
                  {Math.round(metrics.rmseMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Peak Hour MAE: {Math.round(metrics.peakHoursMaeMW).toLocaleString()} MW</span>
                <span className="text-[#75847D]">Volatility</span>
              </div>
            </div>

            {/* Trading Bias */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D]">
                  Trading Position Bias
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  84.4% Over-forecast
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-800 tabular-nums font-['Plus_Jakarta_Sans']">
                  +{Math.round(metrics.biasMW).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MW</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Max Miss: +{Math.round(metrics.maxOverForecastMW).toLocaleString()} MW</span>
                <span className="text-amber-800 font-semibold">Short Imbalance</span>
              </div>
            </div>

            {/* WAPE Error & Accuracy */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D]">
                  WAPE Error Rate
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAF5E9] text-[#167D5A] font-mono font-semibold">
                  Acc {(100 - metrics.wapePct).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#167D5A] tabular-nums font-['Plus_Jakarta_Sans']">
                  {metrics.wapePct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Forecast: {metrics.totalForecastTWh} TWh</span>
                <span>Actual: {metrics.totalActualTWh} TWh</span>
              </div>
            </div>
          </div>

          {/* Quantitative Risk Callout Banner */}
          <div className="p-4 rounded-2xl bg-[#F0F4F1] border border-[#E0E9E2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#1D302B]">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-[#167D5A] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#102A24] font-bold">Renewable Intelligence Insight: </strong>
                <span className="text-[#1D302B]">
                  Across January 2026, Elexon wind forecasts exceeded actual generation in <strong className="text-[#167D5A]">{metrics.overForecastHoursPct}% of hours</strong>, creating a systemic shortfall averaging <strong className="text-[#102A24]">+{Math.round(metrics.biasMW).toLocaleString()} MW</strong>.
                  Energy procurement desks should apply an 11–18% safety derating buffer to guard against real-time Balancing Mechanism buy prices.
                </span>
              </div>
            </div>
          </div>

          {/* Diurnal Hourly Profile & Error Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Diurnal 24h Profile */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="pb-3 border-b border-[#E0E9E2] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                    Diurnal Error Profile (00:00 to 23:00 GMT)
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Mean Absolute Error and Systematic Trading Bias evaluated across each hour of the day.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#75847D]">24 Hourly Slices</span>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                    <XAxis dataKey="hour" stroke="#75847D" fontSize={10} interval={2} tickLine={false} />
                    <YAxis stroke="#75847D" fontSize={10} tickLine={false} tickFormatter={(v) => `${v} MW`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E9E2',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#1D302B'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={0} stroke="#CBD5E1" />
                    <Line type="monotone" dataKey="mae" name="MAE (MW)" stroke="#167D5A" strokeWidth={2.2} dot={false} />
                    <Line type="monotone" dataKey="rmse" name="RMSE (MW)" stroke="#102A24" strokeWidth={1.8} dot={false} />
                    <Line type="monotone" dataKey="bias" name="Mean Bias (MW)" stroke="#D97706" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#75847D] pt-2 border-t border-[#E0E9E2] font-mono">
                <span>Peak (07–19 GMT) MAE: <strong className="text-[#1D302B]">{metrics.peakHoursMaeMW} MW</strong></span>
                <span>Off-Peak MAE: <strong className="text-[#1D302B]">{metrics.offPeakHoursMaeMW} MW</strong></span>
              </div>
            </div>

            {/* Error Distribution Histogram */}
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="pb-3 border-b border-[#E0E9E2] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                    Forecast Error Frequency Distribution (Forecast - Actual)
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Histogram showing probability density, right-hand skewness, and tail volatility.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#75847D]">744 Hours Sample</span>
              </div>

              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 10, right: 15, left: 5, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                    <XAxis
                      dataKey="binStart"
                      stroke="#75847D"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${Math.round(v / 1000)}k`}
                    />
                    <YAxis stroke="#75847D" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}h`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E0E9E2',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#1D302B'
                      }}
                      formatter={(val, name, item) => [`${val} hours (${item.payload.frequencyPct}%)`, 'Trading Frequency']}
                      labelFormatter={(val, p) => p?.[0]?.payload?.binLabel || val}
                    />
                    <ReferenceLine x={0} stroke="#167D5A" strokeDasharray="3 3" />
                    <Bar dataKey="count" name="Frequency (Hours)">
                      {distribution.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={entry.binStart >= 0 ? '#167D5A' : '#75847D'}
                          opacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#75847D] pt-2 border-t border-[#E0E9E2] font-mono">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#75847D]"></span>
                  <span>Under-forecast: <strong className="text-[#1D302B]">{metrics.underForecastHoursPct}%</strong></span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#167D5A]"></span>
                  <span>Over-forecast: <strong className="text-[#1D302B]">{metrics.overForecastHoursPct}%</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Daily Trend Across Month */}
          <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E9E2]">
              <div>
                <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                  Daily Day-Ahead Accuracy Trend Across January 2026
                </h3>
                <p className="text-xs text-[#75847D] mt-0.5">
                  Daily progression of Mean Absolute Error (bars) and Mean Trading Bias (line).
                </p>
              </div>
              <span className="text-xs text-[#75847D] font-mono">31 Daily Sessions</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                  <XAxis dataKey="date" stroke="#75847D" fontSize={10} tickLine={false} />
                  <YAxis stroke="#75847D" fontSize={10} tickLine={false} tickFormatter={(v) => `${v} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E0E9E2',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#1D302B'
                    }}
                    formatter={(val, name) => [`${val.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine y={0} stroke="#CBD5E1" />
                  <Bar dataKey="mae" name="Daily MAE (MW)" fill="#167D5A" opacity={0.8} />
                  <Line type="monotone" dataKey="bias" name="Daily Bias (MW)" stroke="#D97706" strokeWidth={2} dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
