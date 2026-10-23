import React from 'react';
import {
  X, Code2, Server, Cpu, Database, CheckCircle,
  Layers, Terminal, FileCode2
} from 'lucide-react';

export default function TechLeadReviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E0E9E2] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E0E9E2] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0F4F1] border border-[#E0E9E2] flex items-center justify-center text-[#167D5A]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#75847D] font-bold">
                  Technical Architecture Specification · Ref ARCH-VP-01
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1D302B] tracking-tight font-['Outfit']">
                Software Design & Implementation Review
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#75847D] hover:text-[#1D302B] hover:bg-[#F7F9F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-[#1D302B] leading-relaxed font-['Outfit']">
          {/* Architecture Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75847D] mb-2 font-mono">
              1. System Topology & Data Flow
            </h3>
            <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl font-mono text-[11px] text-[#1D302B] overflow-x-auto leading-normal">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75847D] mb-2 font-mono">
              2. Technical Decision Log & Engineering Solves
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="font-bold text-[#167D5A] font-mono block mb-1">Causal Gate Cutoff</span>
                <p className="text-[#75847D] leading-relaxed">
                  SQL window function <code>ROW_NUMBER() OVER (PARTITION BY startTime ORDER BY publishTime DESC)</code> enforces <code>publishTime &lt;= cutoff</code> on Day D-1, guaranteeing zero lookahead data leakage into the decision dataset.
                </p>
              </div>

              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="font-bold text-[#102A24] font-mono block mb-1">Resolution Alignment</span>
                <p className="text-[#75847D] leading-relaxed">
                  WINDFOR is hourly (`minute == 0`); FUELHH is half-hourly (SP 1–48). Actuals are averaged across SP 2H+1 and SP 2H+2 for mathematical pairing, while retaining the raw half-hourly breakdown for BSC settlement compliance.
                </p>
              </div>

              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="font-bold text-[#167D5A] font-mono block mb-1">Sub-5ms Execution</span>
                <p className="text-[#75847D] leading-relaxed">
                  SQLite compound B-tree indexing on <code>(startTime, publishTime)</code> and <code>(settlementDate)</code> executes full-month analytics across 744 hours in &lt; 4 milliseconds.
                </p>
              </div>

              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="font-bold text-[#102A24] font-mono block mb-1">Dual-Mode Production Serving</span>
                <p className="text-[#75847D] leading-relaxed">
                  FastAPI mounts <code>frontend/dist</code> to serve the single-page application directly in production from a single container, eliminating CORS overhead on Heroku and Docker.
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Equations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75847D] mb-2 font-mono">
              3. Statistical Verification Equations
            </h3>
            <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl font-mono text-[11px] text-[#1D302B] space-y-1">
              <p>• MAE:  (1/N) * Σ |Forecast_i - Actual_i| = 2,122.81 MW</p>
              <p>• RMSE: sqrt((1/N) * Σ (Forecast_i - Actual_i)^2) = 2,616.69 MW</p>
              <p>• Bias: (1/N) * Σ (Forecast_i - Actual_i) = +1,840.30 MW (Over-forecast)</p>
              <p>• WAPE: (Σ |Forecast_i - Actual_i| / Σ Actual_i) * 100% = 18.33%</p>
              <p>• nMAE: (MAE / 21,000 MW Capacity) * 100% = 10.11%</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E0E9E2] flex justify-end bg-[#F7F9F5] rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#167D5A] hover:bg-[#126448] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Architecture Spec
          </button>
        </div>
      </div>
    </div>
  );
}
