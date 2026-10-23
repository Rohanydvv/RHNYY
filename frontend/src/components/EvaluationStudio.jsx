import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import {
  Calendar, BarChart3, ShieldAlert, Clock, ArrowRight,
  TrendingDown, TrendingUp, AlertTriangle, Layers, Info,
  ArrowUpRight, Award, Zap
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
      {/* Page Title & Preset Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D302B] font-['Outfit'] tracking-tight">
            Forecast Accuracy & Quantitative Risk Studio
          </h2>
          <p className="text-xs text-[#75847D] mt-0.5 font-['Outfit']">
            Empirical statistical evaluation across all 744 trading hours of January 2026.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'full', label: 'Full Jan (744h)' },
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
                className={`text-xs px-3.5 py-1.5 rounded-full font-['Outfit'] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#123E33] text-white font-semibold shadow-xs'
                    : 'bg-white text-[#1D302B] border border-[#E6ECE4] hover:bg-[#F2F5F0]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {metrics && (
        <>
          {/* Top Row of Curvy Metric Cards (1st card is Deep Forest Hero Box) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: HERO BOX in Deep Forest Green #123E33 */}
            <div className="bg-[#123E33] rounded-[22px] p-5 text-white shadow-[0_4px_20px_rgba(18,62,51,0.15)] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#C0D4CC]">Mean Absolute Error</span>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-white font-['Outfit'] tabular-nums">
                    {Math.round(metrics.maeMW).toLocaleString()}
                  </span>
                  <span className="text-xs text-[#C0D4CC] font-semibold">MW</span>
                </div>
              </div>
              <div className="text-[11px] text-[#A6C4B9] mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Capacity nMAE: {metrics.nmaePct.toFixed(1)}%</span>
                <span className="text-[#B8E35A] font-semibold">{metrics.sampleHoursCount} Hours</span>
              </div>
            </div>

            {/* Card 2: Pure White Curvy Box */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">Root Mean Squared Error</span>
                <div className="w-7 h-7 rounded-full bg-[#EAF5E9] flex items-center justify-center text-[#167D5A]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-[#1D302B] font-['Outfit'] tabular-nums">
                    {Math.round(metrics.rmseMW).toLocaleString()}
                  </span>
                  <span className="text-xs text-[#75847D] font-semibold">MW</span>
                </div>
              </div>
              <div className="text-[11px] text-[#75847D] mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>Peak Hour MAE: {Math.round(metrics.peakHoursMaeMW).toLocaleString()} MW</span>
                <span>Volatility</span>
              </div>
            </div>

            {/* Card 3: Pure White Curvy Box */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">Trading Position Bias</span>
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-amber-800 font-['Outfit'] tabular-nums">
                    +{Math.round(metrics.biasMW).toLocaleString()}
                  </span>
                  <span className="text-xs text-[#75847D] font-semibold">MW</span>
                </div>
              </div>
              <div className="text-[11px] text-amber-800 font-bold mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>{metrics.overForecastHoursPct}% Over-forecast</span>
                <span>Short Risk</span>
              </div>
            </div>

            {/* Card 4: Pure White Curvy Box */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">WAPE Error Rate</span>
                <div className="w-7 h-7 rounded-full bg-[#EAF5E9] flex items-center justify-center text-[#167D5A]">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-[#167D5A] font-['Outfit'] tabular-nums">
                    {metrics.wapePct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-[#167D5A] font-semibold mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>Accuracy {(100 - metrics.wapePct).toFixed(1)}%</span>
                <span>{metrics.totalForecastTWh} TWh</span>
              </div>
            </div>
          </div>

          {/* Diurnal Hourly Profile & Error Distribution Grid (Curvy White Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Diurnal 24h Profile */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4]">
              <div className="pb-3 border-b border-[#E6ECE4] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Outfit']">
                    Diurnal Error Profile (00:00 to 23:00 GMT)
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Mean Absolute Error and Systematic Trading Bias across 24 delivery hours.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#75847D]">24 Hours</span>
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
                    <Line type="monotone" dataKey="rmse" name="RMSE (MW)" stroke="#123E33" strokeWidth={1.8} dot={false} />
                    <Line type="monotone" dataKey="bias" name="Mean Bias (MW)" stroke="#D97706" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Distribution Histogram */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4]">
              <div className="pb-3 border-b border-[#E6ECE4] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Outfit']">
                    Forecast Error Frequency Distribution
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Histogram showing probability density and over-forecasting skewness.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#75847D]">744h Sample</span>
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
                      formatter={(val, name, item) => [`${val} hours (${item.payload.frequencyPct}%)`, 'Trading Hours']}
                    />
                    <ReferenceLine x={0} stroke="#167D5A" strokeDasharray="3 3" />
                    <Bar dataKey="count" name="Frequency">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
