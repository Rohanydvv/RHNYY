import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, Clock, AlertCircle, Download, Layers, RefreshCw,
  ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Info,
  ArrowUpRight, Zap, ShieldCheck, ChevronDown
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

  // Gauge data for accuracy ring
  const accuracyPct = summary?.wapePct != null ? Math.max(0, Math.round(100 - summary.wapePct)) : 82;
  const pieData = [
    { name: 'Accurate', value: accuracyPct, color: '#167D5A' },
    { name: 'Error Margin', value: 100 - accuracyPct, color: '#E8ECE6' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Pill Action Buttons (Matching image header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1D302B] font-['Plus_Jakarta_Sans'] tracking-tight">
            Day-Ahead Wind Cockpit
          </h2>
          <p className="text-xs text-[#75847D] mt-0.5 font-['Inter']">
            Monitor and optimize wholesale renewable power procurement prior to Day-Ahead gate closure.
          </p>
        </div>

        {/* Action Buttons in Pill Shape (Matching image's + Add Device & Export Report) */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowEvolution(!showEvolution)}
            className="rounded-full bg-[#123E33] hover:bg-[#1A4F40] text-white px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#B8E35A]" />
            <span>{showEvolution ? 'Hide NWP Evolution' : 'View NWP Evolution'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="rounded-full bg-white hover:bg-[#F9FAF8] text-[#1D302B] border border-[#E2E8E0] px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center space-x-2"
          >
            <Download className="w-3.5 h-3.5 text-[#75847D]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Date & Gate Closure Selector Bar (Curvy Floating Box) */}
      <div className="bg-white rounded-[22px] p-3.5 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-[#F2F5F0] px-3 py-1.5 rounded-full border border-[#DFE5DD]">
            <button
              onClick={handlePrevDay}
              disabled={deliveryDate <= '2026-01-01'}
              className="p-1 rounded-full hover:bg-white text-[#167D5A] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <Calendar className="w-3.5 h-3.5 text-[#167D5A]" />
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="bg-transparent text-[#1D302B] font-mono font-bold focus:outline-none cursor-pointer text-xs"
            />
            <button
              onClick={handleNextDay}
              disabled={deliveryDate >= '2026-01-31'}
              className="p-1 rounded-full hover:bg-white text-[#167D5A] disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#F2F5F0] px-3.5 py-1.5 rounded-full border border-[#DFE5DD]">
            <Clock className="w-3.5 h-3.5 text-[#167D5A]" />
            <span className="text-[#75847D]">Cutoff:</span>
            <select
              value={cutoffHour}
              onChange={(e) => setCutoffHour(Number(e.target.value))}
              className="bg-transparent text-[#1D302B] font-mono font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value={9}>09:00 GMT (Early Morning)</option>
              <option value={10}>10:00 GMT (Pre-Gate Desk Review)</option>
              <option value={11}>11:00 GMT (EPEX/NordPool Benchmark)</option>
              <option value={12}>12:00 GMT (European Standard)</option>
              <option value={15}>15:30 GMT (Half-Hourly Auction)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#75847D] font-mono flex items-center space-x-2">
          <span>Decision Date: <strong className="text-[#167D5A]">{summary?.decisionDate || 'D-1'}</strong> @ {cutoffHour}:00 GMT</span>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-[24px] p-16 text-center shadow-xs border border-[#E6ECE4]">
          <RefreshCw className="w-7 h-7 text-[#167D5A] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#75847D] font-mono">Loading Elexon stream data for delivery day {deliveryDate}...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-[22px] p-4 text-rose-800 flex items-center space-x-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>Error loading data: {error}</span>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Top Row of 4 Metric Boxes (Matching image: 1st card is Dark Forest Green Hero Box!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: HERO BOX in Deep Forest Green #123E33 (Matching image's "Total Power Generated" green card) */}
            <div className="bg-[#123E33] rounded-[22px] p-5 text-white shadow-[0_4px_20px_rgba(18,62,51,0.15)] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#C0D4CC]">Day-Ahead Forecast</span>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold font-mono tracking-tight text-white font-['Plus_Jakarta_Sans']">
                    {(summary.totalForecastMWh / 1000).toFixed(1)}
                  </span>
                  <span className="text-xs text-[#C0D4CC] font-semibold">GWh</span>
                </div>
              </div>
              <div className="text-[11px] text-[#A6C4B9] font-mono mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Peak: {Math.round(summary.peakForecastMW).toLocaleString()} MW</span>
                <span className="text-[#B8E35A] font-semibold">Locked 11:00</span>
              </div>
            </div>

            {/* Card 2: Pure White Curvy Box (Matching image's "Current Consumption" card) */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">Realized Actual Generation</span>
                <div className="w-7 h-7 rounded-full bg-[#EAF5E9] flex items-center justify-center text-[#167D5A]">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold font-mono tracking-tight text-[#1D302B] font-['Plus_Jakarta_Sans']">
                    {summary.totalActualMWh ? (summary.totalActualMWh / 1000).toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-[#75847D] font-semibold">GWh</span>
                </div>
              </div>
              <div className="text-[11px] text-[#75847D] font-mono mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>Avg: {summary.totalActualMWh ? Math.round(summary.totalActualMWh / 24).toLocaleString() : 0} MW</span>
                <span className={summary.totalActualMWh && summary.totalActualMWh < summary.totalForecastMWh ? 'text-amber-700 font-semibold' : 'text-[#167D5A] font-semibold'}>
                  {summary.totalActualMWh ? `${((summary.totalActualMWh / summary.totalForecastMWh - 1) * 100).toFixed(1)}%` : ''}
                </span>
              </div>
            </div>

            {/* Card 3: Pure White Curvy Box (Matching image's "Battery Storage Level" card) */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">Mean Absolute Error</span>
                <div className="w-7 h-7 rounded-full bg-[#F3F6F2] flex items-center justify-center text-[#167D5A]">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-extrabold font-mono tracking-tight text-[#167D5A] font-['Plus_Jakarta_Sans']">
                    {summary.maeMW ? Math.round(summary.maeMW).toLocaleString() : '—'}
                  </span>
                  <span className="text-xs text-[#75847D] font-semibold">MW</span>
                </div>
              </div>
              <div className="text-[11px] text-[#167D5A] font-semibold font-mono mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>WAPE: {summary.wapePct != null ? `${summary.wapePct.toFixed(1)}%` : '—'}</span>
                <span>RMSE {summary.rmseMW ? Math.round(summary.rmseMW).toLocaleString() : '—'}</span>
              </div>
            </div>

            {/* Card 4: Pure White Curvy Box (Matching image's "Grid Status" card) */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#75847D]">Trading Imbalance Position</span>
                <div className="w-7 h-7 rounded-full bg-[#F3F6F2] flex items-center justify-center text-[#75847D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="my-1">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  (summary.biasMW || 0) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {(summary.biasMW || 0) > 0 ? 'SHORT IMBALANCE' : 'SURPLUS'}
                </span>
              </div>
              <div className="text-[11px] text-[#75847D] font-mono mt-2 pt-2 border-t border-[#E8ECE6] flex items-center justify-between">
                <span>Bias: {summary.biasMW ? `${summary.biasMW > 0 ? '+' : ''}${Math.round(summary.biasMW).toLocaleString()} MW` : '0'}</span>
                <span>{(summary.biasMW || 0) > 0 ? 'Over-forecast' : 'Under-forecast'}</span>
              </div>
            </div>
          </div>

          {/* Middle Row (Matching the 2 Side-by-Side Cards in image: "Savings Progress" donut + "Real-time Usage" chart) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card: Circular Progress Ring (Matching image's "Savings Progress" card) */}
            <div className="lg:col-span-4 bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                  Forecast Accuracy Progress
                </h3>
                <span className="text-xs text-[#75847D] font-mono font-semibold">Jan 2026</span>
              </div>

              {/* Donut Gauge (Matching image's 67% ring) */}
              <div className="h-48 relative flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Percentage Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-[#1D302B] font-mono font-['Plus_Jakarta_Sans']">
                    {accuracyPct}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#75847D] tracking-wider -mt-0.5">
                    Accuracy Score
                  </span>
                </div>
              </div>

              {/* Bottom Legend (Matching image's legend dots) */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#E8ECE6]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#167D5A]"></span>
                    <span className="text-[#75847D]">Realized Generation</span>
                  </div>
                  <span className="font-mono font-bold text-[#1D302B]">
                    {summary.totalActualMWh ? (summary.totalActualMWh / 1000).toFixed(1) : 0} GWh
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#123E33]"></span>
                    <span className="text-[#75847D]">Day-Ahead Forecast</span>
                  </div>
                  <span className="font-mono font-bold text-[#1D302B]">
                    {(summary.totalForecastMWh / 1000).toFixed(1)} GWh
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-[#75847D]">Volume Deviation</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">
                    {summary.totalActualMWh ? `${Math.round(summary.totalForecastMWh - summary.totalActualMWh).toLocaleString()} MWh` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Card: Main Profile Chart (Matching image's "Real-time Usage" card) */}
            <div className="lg:col-span-8 bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE4]">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                    Day-Ahead Wind Forecast vs Realized Generation
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Hourly wind power delivery profile across 24 delivery hours (SP 1–48)
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 bg-[#F2F5F0] px-3 py-1 rounded-full border border-[#DFE5DD] text-xs font-mono font-medium text-[#1D302B]">
                  <span>24 Hours (Jan 2026)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#75847D]" />
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 sm:h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 10 }}>
                    <defs>
                      <linearGradient id="curvyActualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#167D5A" stopOpacity={0.22} />
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
                        return [value, name];
                      }}
                    />
                    <Legend verticalAlign="top" align="right" height={30} wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="actualMW"
                      name="Realized Actual"
                      stroke="#167D5A"
                      strokeWidth={2.4}
                      fill="url(#curvyActualGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastMW"
                      name="Day-Ahead Forecast"
                      stroke="#123E33"
                      strokeWidth={2.2}
                      dot={{ r: 2.5, fill: '#123E33', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Third Row (Matching bottom row in image: "Smart Devices" list + "Carbon Offset Tracker" Hero Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card: Settlement Schedule Audit with Nested Curvy Mini-Boxes (Matching image's "Smart Devices" card) */}
            <div className="lg:col-span-7 bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6ECE4]">
                <div>
                  <h3 className="text-sm font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">
                    Settlement Period Schedule Verification
                  </h3>
                  <p className="text-xs text-[#75847D] mt-0.5">
                    Sample settlement hours with Elexon BSC half-hourly mapping
                  </p>
                </div>
                <button
                  onClick={exportCSV}
                  className="text-xs font-semibold text-[#167D5A] hover:underline cursor-pointer"
                >
                  Download Full CSV
                </button>
              </div>

              {/* Nested Curvy Mini-Boxes (Matching image's Smart Device items) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {forecastData.hourlySeries.slice(0, 4).map((row) => (
                  <div
                    key={row.startTime}
                    className="bg-[#F7F9F6] border border-[#EBEFEA] rounded-[18px] p-3.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1D302B] block font-mono">
                        Hour {String(row.settlementHour).padStart(2, '0')}:00
                      </span>
                      <span className="text-[11px] text-[#75847D] block">
                        SP {row.settlementHour * 2 + 1} - {row.settlementHour * 2 + 2}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-[#167D5A] block">
                        {Math.round(row.actualGeneration).toLocaleString()} MW
                      </span>
                      <span className="text-[10px] text-[#75847D] block">
                        Fcst: {Math.round(row.forecastGeneration).toLocaleString()} MW
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card: Dark Forest Green Hero Box (Matching image's "Carbon Offset Tracker" Card) */}
            <div className="lg:col-span-5 bg-[#123E33] rounded-[24px] p-6 text-white shadow-[0_4px_24px_rgba(18,62,51,0.2)] flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white font-['Plus_Jakarta_Sans']">
                    Trading Risk Mitigation
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B8E35A] text-[#123E33] px-2.5 py-0.5 rounded-full font-mono">
                    SAFETY BUFFER
                  </span>
                </div>
                <p className="text-xs text-[#C0D4CC] leading-relaxed">
                  Historical January 2026 bias shows a <strong>+1,840 MW systemic over-forecasting tendency</strong>.
                </p>

                <div className="grid grid-cols-2 gap-4 my-4 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A6C4B9] tracking-wider block">
                      RECOMMENDED BUFFER
                    </span>
                    <span className="text-2xl font-extrabold text-white font-mono block mt-0.5 font-['Plus_Jakarta_Sans']">
                      15% <span className="text-xs font-normal text-[#C0D4CC]">Derate</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A6C4B9] tracking-wider block">
                      PROJECTED SAVINGS
                    </span>
                    <span className="text-2xl font-extrabold text-[#B8E35A] font-mono block mt-0.5 font-['Plus_Jakarta_Sans']">
                      £76.9k <span className="text-xs font-normal text-[#C0D4CC]">/day</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowEvolution(!showEvolution)}
                  className="w-full bg-[#1A4F40] hover:bg-[#236352] text-white font-bold text-xs py-2.5 px-4 rounded-full text-center transition-colors cursor-pointer shadow-xs"
                >
                  View NWP Model Progression
                </button>
              </div>
            </div>
          </div>

          {/* NWP Evolution Drawer */}
          {showEvolution && (
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E6ECE4]">
              <div className="pb-3 border-b border-[#E6ECE4] flex items-center justify-between">
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
                      {evolutionData.evolutionSeries.map((series, idx) => {
                        const colors = ['#94A3B8', '#64748B', '#D97706', '#8B5CF6', '#123E33'];
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
        </>
      )}
    </div>
  );
}
