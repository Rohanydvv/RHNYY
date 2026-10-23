import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Flame, Wind, ShieldCheck, DollarSign, Sliders, AlertTriangle,
  ArrowRight, CheckCircle2, TrendingDown, RefreshCw
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
      // Run current sim with derating
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

      // Run baseline (0% derating) for comparison
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
    rawWind: Math.round(h.rawWindForecastMW),
    actualWind: Math.round(h.actualWindMW),
    actualThermalNeeded: Math.round(h.actualThermalNeededMW),
    imbalance: Math.round(h.imbalanceMW)
  })) || [];

  return (
    <div className="space-y-6">
      {/* Simulation Controls & Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Day-Ahead Thermal Procurement & Imbalance Risk Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate required thermal power purchases to meet consumer demand beyond variable wind generation.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              Target Delivery: <strong className="text-cyan-400">{deliveryDate}</strong>
            </span>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Delivery Date</label>
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Utility Customer Demand Share ({utilityShare}% of UK)
            </label>
            <select
              value={utilityShare}
              onChange={(e) => setUtilityShare(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
            >
              <option value={5}>5% UK Market Share (~1.4 - 1.8 GW demand)</option>
              <option value={10}>10% UK Market Share (~2.8 - 3.6 GW demand)</option>
              <option value={20}>20% UK Market Share (Major Tier 1 Supplier)</option>
              <option value={100}>100% National Grid Scale (28 - 36 GW demand)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Wholesale Power Benchmark (£/MWh)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono"
            />
          </div>

          {/* Derating Margin Slider */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-900/40">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-cyan-300 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quantified Bias Haircut</span>
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {deratingPct}% Derate
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={deratingPct}
              onChange={(e) => setDeratingPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Recommended: 10-18% (matches Jan 2026 forecast over-estimation)
            </span>
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* Simulation Output KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Total Consumer Demand
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-white font-mono">
                  {Math.round(result.totalDemandMWh).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                24-Hour consumption volume
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Day-Ahead Thermal Procured
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  {Math.round(result.totalProcuredThermalMWh).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Cost: £{(result.totalWholesaleCostGBP / 1000).toFixed(1)}k @ wholesale
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Short Balancing Volume
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-rose-400 font-mono">
                  {Math.round(result.totalShortMWh).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-semibold">MWh</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">
                Unhedged deficit at real time
              </span>
            </div>

            <div className={`border rounded-2xl p-4 shadow-sm ${
              deratingPct > 0 && penaltySavings > 0
                ? 'bg-emerald-950/20 border-emerald-800/60'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Derating Risk Mitigation</span>
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold text-emerald-400 font-mono">
                  {penaltySavings > 0 ? `+£${Math.round(penaltySavings).toLocaleString()}` : 'Baseline'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium block mt-1">
                {penaltySavings > 0 ? 'Avoided balancing penalty costs' : 'Set haircut >0% to derate'}
              </span>
            </div>
          </div>

          {/* Energy Stack Area Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Day-Ahead Energy Balance: Demand vs Wind Forecast vs Thermal Procured
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visualizing how day-ahead procurement covers consumer demand, compared against realized wind generation.
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="thermalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v.toLocaleString()} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                      color: '#f8fafc'
                    }}
                    formatter={(v, name) => [`${v.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />

                  {/* Customer Demand Line */}
                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Consumer Electricity Demand"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={false}
                  />

                  {/* Day-Ahead Procured Thermal Stack */}
                  <Area
                    type="monotone"
                    dataKey="procuredThermal"
                    name="Procured Day-Ahead Thermal"
                    stroke="#f59e0b"
                    fill="url(#thermalGrad)"
                  />

                  {/* Derated Wind Forecast */}
                  <Area
                    type="monotone"
                    dataKey="deratedWind"
                    name="Derated Wind Generation Forecast"
                    stroke="#06b6d4"
                    fill="url(#windGrad)"
                  />

                  {/* Actual Wind Realized Line */}
                  <Line
                    type="monotone"
                    dataKey="actualWind"
                    name="Realized Wind Generation"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly Thermal Dispatch Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Hourly Procurement & Imbalance Audit</h3>
              <span className="text-xs text-slate-400 font-mono">Wholesale Price: £{wholesalePrice}/MWh</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Hour</th>
                    <th className="py-2.5 px-3">Demand</th>
                    <th className="py-2.5 px-3">Raw Wind</th>
                    <th className="py-2.5 px-3">Derated Wind</th>
                    <th className="py-2.5 px-3">Thermal Procured</th>
                    <th className="py-2.5 px-3">Actual Wind</th>
                    <th className="py-2.5 px-3">Real-Time Need</th>
                    <th className="py-2.5 px-3">Imbalance (MW)</th>
                    <th className="py-2.5 px-3">Total Cost (£)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {result.hourlyBreakdown.map((h) => {
                    return (
                      <tr key={h.hour} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-white">{String(h.hour).padStart(2, '0')}:00</td>
                        <td className="py-2 px-3 text-white">{Math.round(h.demandMW).toLocaleString()} MW</td>
                        <td className="py-2 px-3 text-slate-400">{Math.round(h.rawWindForecastMW).toLocaleString()} MW</td>
                        <td className="py-2 px-3 text-cyan-400">{Math.round(h.deratedWindForecastMW).toLocaleString()} MW</td>
                        <td className="py-2 px-3 text-amber-400">{Math.round(h.procuredThermalMW).toLocaleString()} MW</td>
                        <td className="py-2 px-3 text-emerald-400">{Math.round(h.actualWindMW).toLocaleString()} MW</td>
                        <td className="py-2 px-3 text-slate-300">{Math.round(h.actualThermalNeededMW).toLocaleString()} MW</td>
                        <td className={`py-2 px-3 font-medium ${h.isShort ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {h.imbalanceMW > 0 ? '+' : ''}{Math.round(h.imbalanceMW).toLocaleString()} MW
                        </td>
                        <td className="py-2 px-3 text-slate-200">
                          £{Math.round(h.simulatedTotalCostGBP).toLocaleString()}
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
