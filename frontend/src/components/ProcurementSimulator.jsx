import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
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
      <div className="bg-white border border-[#E0E9E2] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E0E9E2] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-[#167D5A]" />
              <h3 className="text-base font-bold text-[#1D302B] font-['Outfit']">
                Thermal Generation Sizing & Balancing Exposure Simulator
              </h3>
            </div>
            <p className="text-xs text-[#75847D] mt-0.5">
              Determine required Day-Ahead thermal procurement schedules beyond weather-dependent wind generation.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-[#75847D]">Delivery:</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#F0F4F1] border border-[#E0E9E2] text-[#167D5A] font-semibold">
              {deliveryDate}
            </span>
          </div>
        </div>

        {/* Input Parameters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
          <div>
            <label className="block text-[#75847D] mb-1 font-medium">Delivery Date</label>
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-[#F7F9F5] border border-[#E0E9E2] rounded-xl px-3 py-2 text-[#1D302B] font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#75847D] mb-1 font-medium">Utility Customer Portfolio</label>
            <select
              value={utilityShare}
              onChange={(e) => setUtilityShare(Number(e.target.value))}
              className="w-full bg-[#F7F9F5] border border-[#E0E9E2] rounded-xl px-3 py-2 text-[#1D302B] font-mono focus:outline-none cursor-pointer"
            >
              <option value={5}>5% UK Market (~1.4–1.8 GW demand)</option>
              <option value={10}>10% UK Market (~2.8–3.6 GW demand)</option>
              <option value={20}>20% UK Market (Tier-1 Supplier)</option>
              <option value={100}>100% National Transmission Scale</option>
            </select>
          </div>

          <div>
            <label className="block text-[#75847D] mb-1 font-medium">Day-Ahead Wholesale Price (£/MWh)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(Number(e.target.value))}
              className="w-full bg-[#F7F9F5] border border-[#E0E9E2] rounded-xl px-3 py-2 text-[#1D302B] font-mono focus:outline-none"
            />
          </div>

          {/* Derating Slider Card with subtle Fresh Lime highlight tag */}
          <div className="bg-[#F7F9F5] p-3 rounded-xl border border-[#E0E9E2]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#1D302B] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#167D5A]" />
                <span>Bias Derating Haircut</span>
              </span>
              <span className="font-mono text-[#102A24] font-bold bg-[#B8E35A] px-2 py-0.5 rounded text-[11px] shadow-xs">
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
              className="w-full h-1.5 bg-[#E0E9E2] rounded appearance-none cursor-pointer accent-[#167D5A]"
            />
            <div className="flex justify-between text-[10px] text-[#75847D] font-mono mt-1">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Consumer Demand Volume
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D302B] tabular-nums font-['Outfit']">
                  {Math.round(result.totalDemandMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MWh</span>
              </div>
              <span className="text-[11px] text-[#75847D] block mt-1">24h Delivery Requirement</span>
            </div>

            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Thermal Scheduled Day-Ahead
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#167D5A] tabular-nums font-['Outfit']">
                  {Math.round(result.totalProcuredThermalMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-[#75847D]">MWh</span>
              </div>
              <span className="text-[11px] text-[#75847D] block mt-1">
                Wholesale: £{(result.totalWholesaleCostGBP / 1000).toFixed(0)}k @ £{wholesalePrice}/MWh
              </span>
            </div>

            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Unhedged Short Position
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-800 tabular-nums font-['Outfit']">
                  {Math.round(result.totalShortMWh).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-amber-800">MWh</span>
              </div>
              <span className="text-[11px] text-[#75847D] block mt-1">Exposed to SBP Penalty</span>
            </div>

            <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D] block mb-1">
                Derating Risk Protection
              </span>
              <div className="flex items-baseline space-x-1.5 my-1.5">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#167D5A] tabular-nums font-['Outfit']">
                  {penaltySavings > 0 ? `+£${Math.round(penaltySavings).toLocaleString()}` : '£0'}
                </span>
              </div>
              <span className="text-[11px] text-[#167D5A] font-semibold block mt-1">
                {penaltySavings > 0 ? 'Balancing penalty savings' : 'Apply haircut to simulate'}
              </span>
            </div>
          </div>

          {/* Energy Stack Chart */}
          <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="pb-3 border-b border-[#E0E9E2] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1D302B] font-['Outfit']">
                  Energy Balance Stack: Consumer Demand vs Wind Contribution vs Thermal Procurement
                </h3>
                <p className="text-xs text-[#75847D] mt-0.5">
                  Visualizing how day-ahead procurement covers consumer demand, compared against realized wind generation.
                </p>
              </div>
            </div>

            <div className="h-80 sm:h-96 mt-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 15, left: 5, bottom: 15 }}>
                  <defs>
                    <linearGradient id="thermalStackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C2410C" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#C2410C" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="windStackGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#167D5A" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#167D5A" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
                  <XAxis dataKey="hour" stroke="#75847D" fontSize={11} tickLine={false} />
                  <YAxis stroke="#75847D" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()} MW`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E0E9E2',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                      color: '#1D302B'
                    }}
                    formatter={(v, name) => [`${v.toLocaleString()} MW`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />

                  {/* Demand Curve */}
                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Consumer Electricity Demand"
                    stroke="#1D302B"
                    strokeWidth={2.4}
                    dot={false}
                  />

                  {/* Procured Thermal Stack */}
                  <Area
                    type="monotone"
                    dataKey="procuredThermal"
                    name="Day-Ahead Thermal Scheduled"
                    stroke="#C2410C"
                    fill="url(#thermalStackGrad)"
                  />

                  {/* Wind Contribution */}
                  <Area
                    type="monotone"
                    dataKey="deratedWind"
                    name="Derated Wind Forecast"
                    stroke="#167D5A"
                    fill="url(#windStackGrad)"
                  />

                  {/* Realized Actual Wind Line */}
                  <Line
                    type="monotone"
                    dataKey="actualWind"
                    name="Realized Actual Wind"
                    stroke="#102A24"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Breakdown Table */}
          <div className="bg-white border border-[#E0E9E2] rounded-2xl p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E9E2]">
              <h3 className="text-sm font-bold text-[#1D302B] font-['Outfit']">
                Hourly Dispatch & Cashout Penalty Audit
              </h3>
              <span className="text-xs text-[#75847D] font-mono">Wholesale: £{wholesalePrice}/MWh</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F0F4F1] text-[#1D302B] uppercase text-[10px] tracking-wider border-b border-[#E0E9E2]">
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
                <tbody className="divide-y divide-[#E0E9E2] text-[#1D302B]">
                  {result.hourlyBreakdown.map((h) => (
                    <tr key={h.hour} className="hover:bg-[#F7F9F5]">
                      <td className="py-2 px-3 font-semibold text-[#1D302B]">{String(h.hour).padStart(2, '0')}:00</td>
                      <td className="py-2 px-3 text-right text-[#1D302B] font-medium">{Math.round(h.demandMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-[#167D5A] font-semibold">{Math.round(h.deratedWindForecastMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-[#C2410C] font-semibold">{Math.round(h.procuredThermalMW).toLocaleString()} MW</td>
                      <td className="py-2 px-3 text-right text-[#102A24] font-medium">{Math.round(h.actualWindMW).toLocaleString()} MW</td>
                      <td className={`py-2 px-3 text-right font-medium ${h.isShort ? 'text-amber-800' : 'text-[#167D5A]'}`}>
                        {h.imbalanceMW > 0 ? '+' : ''}{Math.round(h.imbalanceMW).toLocaleString()} MW
                      </td>
                      <td className="py-2 px-3 text-right text-[#1D302B]">
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
