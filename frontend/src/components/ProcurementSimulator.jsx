import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Flame, ShieldCheck, DollarSign, Sliders, AlertTriangle,
  ArrowRight, CheckCircle2, TrendingDown, RefreshCw, Layers
} from 'lucide-react';
import { simulateProcurement } from '../services/api';

export default function ProcurementSimulator() {
  const [deliveryDate, setDeliveryDate] = useState('2026-01-02');
  const [utilityShare, setUtilityShare] = useState(10); // 10% of UK national demand
  const [deratingPct, setDeratingPct] = useState(0); // Derating margin slider
  const [wholesalePrice, setWholesalePrice] = useState(85); // £85 / MWh
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [baselineResult, setBaselineResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const sim = await simulateProcurement({
        deliveryDate,
        utilitySharePct: utilityShare,
        windDeratingPct: deratingPct,
        wholesalePricePerMWh: wholesalePrice,
        baseDemandMW: 28000.0,
        morningPeakMW: 6000.0,
        eveningPeakMW: 8000.0
      });
      setResult(sim);

      if (deratingPct > 0) {
        const base = await simulateProcurement({
          deliveryDate,
          utilitySharePct: utilityShare,
          windDeratingPct: 0.0,
          wholesalePricePerMWh: wholesalePrice,
          baseDemandMW: 28000.0,
          morningPeakMW: 6000.0,
          eveningPeakMW: 8000.0
        });
        setBaselineResult(base);
      } else {
        setBaselineResult(sim);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [deliveryDate, utilityShare, deratingPct, wholesalePrice]);

  const penaltySavings = baselineResult && result
    ? baselineResult.totalImbalanceCostGBP - result.totalImbalanceCostGBP
    : 0;

  const chartData = result?.hourlyBreakdown.map(h => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    demand: Math.round(h.demandMW),
    procuredThermal: Math.round(h.procuredThermalMW),
    deratedWind: Math.round(h.deratedWindForecastMW),
    actualWind: Math.round(h.actualWindMW),
    imbalance: Math.round(h.imbalanceMW)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Thermal Generation Sizing & Balancing Exposure Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Determine optimal Day-Ahead thermal procurement schedules beyond weather-dependent wind generation.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Target Delivery:</span>
            <span className="px-2.5 py-1 rounded bg-[#070A12] border border-slate-800 text-cyan-400 font-semibold">
              {deliveryDate}
            </span>
          </div>
        </div>

        {/* Input Parameters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Delivery Date</label>
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Utility Retail Demand Portfolio</label>
            <select
              value={utilityShare}
              onChange={(e) => setUtilityShare(Number(e.target.value))}
              className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
            >
              <option value={5}>5% UK Market (~1.4–1.8 GW demand)</option>
              <option value={10}>10% UK Market (~2.8–3.6 GW demand)</option>
              <option value={20}>20% UK Market (Tier-1 Supplier)</option>
              <option value={100}>100% National Transmission Scale</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Day-Ahead Wholesale Price (£/MWh)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          {/* Derating Slider Card */}
          <div className="bg-[#070A12] p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-slate-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quantified Bias Haircut</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700/60">
                {deratingPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={deratingPct}
              onChange={(e) => setDeratingPct(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (Raw)</span>
              <span>10% (Desk rec.)</span>
              <span>25%</span>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* Executive Dispatch KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Consumer Demand Volume
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
                  {Math.round(result.totalDemandMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 font-mono">24h Required Volume</span>
            </div>

            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Day-Ahead Thermal Scheduled
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
                  {Math.round(result.totalProcuredThermalMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-400">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 font-mono">
                Wholesale: £{(result.totalWholesaleCostGBP / 1000).toFixed(0)}k @ £{wholesalePrice}/MWh
              </span>
            </div>

            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Unhedged Short Position
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-rose-400 tabular-nums">
                  {Math.round(result.totalShortMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-rose-300">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 font-mono">Exposed to SBP Penalty</span>
            </div>

            <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] uppercase font-medium tracking-wider text-slate-400 block mb-1">
                Derating Risk Protection
              </span>
              <div className="flex items-baseline space-x-1.5 my-1">
                <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
                  {penaltySavings > 0 ? `+£${Math.round(penaltySavings).toLocaleString()}` : '£0'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/90 block mt-1 font-mono">
                {penaltySavings > 0 ? 'Balancing penalty savings' : 'Apply haircut to simulate'}
              </span>
            </div>
          </div>

          {/* Energy Stack Chart */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Energy Balance Stack: Consumer Demand vs Wind Contribution vs Thermal Procurement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing how day-ahead procurement covers consumer demand, compared against realized wind generation.
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 15, left: 5, bottom: 15 }}>
                  <defs>
                    <linearGradient id="thermalStackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="windStackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284C7" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#F8FAFC'
                    }}
                    formatter={(v, name) => [`${v.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />

                  {/* Demand Curve */}
                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Consumer Electricity Demand"
                    stroke="#FFFFFF"
                    strokeWidth={2.4}
                    dot={false}
                  />

                  {/* Procured Thermal Stack */}
                  <Area
                    type="monotone"
                    dataKey="procuredThermal"
                    name="Day-Ahead Thermal Scheduled"
                    stroke="#D97706"
                    fill="url(#thermalStackGrad)"
                  />

                  {/* Wind Contribution */}
                  <Area
                    type="monotone"
                    dataKey="deratedWind"
                    name="Derated Wind Forecast"
                    stroke="#0284C7"
                    fill="url(#windStackGrad)"
                  />

                  {/* Realized Actual Wind Line */}
                  <Line
                    type="monotone"
                    dataKey="actualWind"
                    name="Realized Actual Wind"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Breakdown Table */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Hourly Dispatch & Cashout Penalty Audit
              </h3>
              <span className="text-xs text-slate-400 font-mono">Wholesale: £{wholesalePrice}/MWh</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070A12] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Hour</th>
                    <th className="py-2.5 px-3 text-right">Demand</th>
                    <th className="py-2.5 px-3 text-right">Derated Wind</th>
                    <th className="py-2.5 px-3 text-right">Thermal Procured</th>
                    <th className="py-2.5 px-3 text-right">Realized Wind</th>
                    <th className="py-2.5 px-3 text-right">Net Imbalance</th>
                    <th className="py-2.5 px-3 text-right">Hourly Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {result.hourlyBreakdown.map((h) => (
                    <tr key={h.hour} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-semibold text-white">{String(h.hour).padStart(2, '0')}:00</td>
                      <td className="py-2 px-3 text-right text-white">{Math.round(h.demandMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-cyan-300">{Math.round(h.deratedWindForecastMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-amber-400">{Math.round(h.procuredThermalMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-emerald-400">{Math.round(h.actualWindMW).toLocaleString()} MW</td>
                      <td className={`py-2 px-3 text-right font-medium ${h.isShort ? 'text-rose-400' : 'text-blue-400'}`}>
                        {h.imbalanceMW > 0 ? '+' : ''}{Math.round(h.imbalanceMW).toLocaleString()} MW
                      </td>
                      <td className="py-2 px-3 text-right text-slate-200">
                        £{Math.round(h.simulatedTotalCostGBP).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
