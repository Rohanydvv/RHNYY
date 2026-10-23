import React from 'react';
import {
  X, Code2, Server, Cpu, Database, CheckCircle,
  Layers, Terminal, FileCode2
} from 'lucide-react';

export default function TechLeadReviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0B0F19]/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                  Technical Architecture Specification · Ref ARCH-VP-01
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Software Design & Implementation Review
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Architecture Matrix */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              1. System Topology & Data Flow
            </h3>
            <div className="bg-[#070A12] border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-slate-400 overflow-x-auto leading-normal">
              {`[Elexon BMRS Live Streams] -> FUELHH (half-hourly actuals) & WINDFOR (hourly NWP forecasts)
              |
              v (Automated ETL Pipeline: scripts/sync_elexon.py)
[SQLite Local Storage Layer] -> elexon_wind.db (1,777 FUELHH WIND rows + 21,608 WINDFOR rows)
              |                 Indexes: (startTime, publishTime), (settlementDate)
              v (Sub-5ms Indexed SQL Window Queries)
[FastAPI Python Backend]    -> forecast_service.py (Causal D-1 cutoff matching & evolution)
              |                 analytics_service.py (MAE, RMSE, Bias, WAPE, nMAE)
              |                 procurement_service.py (Demand balance & balancing cashout)
              v (REST Endpoints /api/*)
[React 19 Frontend SPA]     -> Cockpit | Accuracy Studio | Dispatch Simulator (Vite + Recharts)`}
            </div>
          </div>

          {/* Key Engineering Solutions */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              2. Technical Decision Log & Engineering Solves
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#070A12] border border-slate-800 p-3.5 rounded-xl">
                <span className="font-semibold text-cyan-400 font-mono block mb-1">Causal Gate Cutoff</span>
                <p className="text-slate-400">
                  SQL window function <code>ROW_NUMBER() OVER (PARTITION BY startTime ORDER BY publishTime DESC)</code> enforces <code>publishTime &lt;= cutoff</code> on Day D-1, guaranteeing zero lookahead data leakage into the decision dataset.
                </p>
              </div>

              <div className="bg-[#070A12] border border-slate-800 p-3.5 rounded-xl">
                <span className="font-semibold text-amber-400 font-mono block mb-1">Resolution Alignment</span>
                <p className="text-slate-400">
                  WINDFOR is hourly (`minute == 0`); FUELHH is half-hourly (SP 1–48). Actuals are averaged across SP 2H+1 and SP 2H+2 for mathematical pairing, while retaining the raw half-hourly breakdown for BSC settlement compliance.
                </p>
              </div>

              <div className="bg-[#070A12] border border-slate-800 p-3.5 rounded-xl">
                <span className="font-semibold text-emerald-400 font-mono block mb-1">Sub-5ms Execution</span>
                <p className="text-slate-400">
                  SQLite compound B-tree indexing on <code>(startTime, publishTime)</code> and <code>(settlementDate)</code> executes full-month analytics across 744 hours in &lt; 4 milliseconds.
                </p>
              </div>

              <div className="bg-[#070A12] border border-slate-800 p-3.5 rounded-xl">
                <span className="font-semibold text-indigo-400 font-mono block mb-1">Dual-Mode Production Serving</span>
                <p className="text-slate-400">
                  FastAPI mounts <code>frontend/dist</code> to serve the single-page application directly in production from a single container, eliminating CORS overhead on Heroku and Docker.
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Equations */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              3. Statistical Verification Equations
            </h3>
            <div className="bg-[#070A12] border border-slate-800 p-4 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
              <p>• MAE:  (1/N) * Σ |Forecast_i - Actual_i| = 2,122.81 MW</p>
              <p>• RMSE: sqrt((1/N) * Σ (Forecast_i - Actual_i)^2) = 2,616.69 MW</p>
              <p>• Bias: (1/N) * Σ (Forecast_i - Actual_i) = +1,840.30 MW (Over-forecast)</p>
              <p>• WAPE: (Σ |Forecast_i - Actual_i| / Σ Actual_i) * 100% = 18.33%</p>
              <p>• nMAE: (MAE / 21,000 MW Capacity) * 100% = 10.11%</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex justify-end bg-[#070A12]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer border border-slate-700"
          >
            Close Architecture Spec
          </button>
        </div>
      </div>
    </div>
  );
}
