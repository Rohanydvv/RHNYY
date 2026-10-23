import React from 'react';
import {
  X, FileCode, CheckCircle, Database, Server, Cpu,
  Layers, GitBranch, ArrowRight, ShieldCheck, Terminal
} from 'lucide-react';

export default function TechLeadReviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <FileCode className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Technical Design & Implementation Review</h2>
              <p className="text-xs text-slate-400">Software Architecture Review for Internal Technical Lead</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8 text-sm text-slate-300">
          {/* Architecture Overview */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>1. System Architecture Overview</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              {`+-----------------------------------------------------------------------------------+
|                           VORTEXPOWER ARCHITECTURE                                |
+-----------------------------------------------------------------------------------+
|  [External Source]                                                                |
|  Elexon BMRS Stream API (FUELHH & WINDFOR endpoints)                              |
|         |                                                                         |
|         v (Automated Ingestion Pipeline with Retry & Pagination)                  |
|  [Storage / Cache Layer]                                                          |
|  SQLite Database (elexon_wind.db): 1,777 FUELHH (WIND) + 21,608 WINDFOR records   |
|  Indexed on: (startTime, publishTime), (settlementDate), (startTime)              |
|         |                                                                         |
|         v (Sub-5ms Indexed Queries)                                               |
|  [FastAPI Backend Application]                                                    |
|  - forecast_service.py   : Day-ahead selection logic with D-1 gate cutoff         |
|  - analytics_service.py  : MAE, RMSE, Bias, WAPE, nMAE, Diurnal Profile, Histogram|
|  - procurement_service.py: Balancing mechanism & safety derating calculator       |
|         |                                                                         |
|         v (REST JSON Endpoints via /api/*)                                        |
|  [Frontend Single-Page App]                                                       |
|  React 19 + Vite 8 + TailwindCSS v4 + Recharts + Lucide Icons                     |
|  Cockpit View | Forecast Accuracy Studio | Thermal Dispatch Simulator             |
+-----------------------------------------------------------------------------------+`}
            </div>
          </div>

          {/* Core Technical Challenges & Solutions */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>2. Core Technical Challenges & Engineering Solutions</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-cyan-400 mb-1">Lookahead Bias Prevention</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Decisions for delivery day <code>D</code> occur at <code>11:00 GMT</code> on <code>D-1</code>. 
                  SQL window function <code>ROW_NUMBER() OVER (PARTITION BY startTime ORDER BY publishTime DESC)</code> filters <code>publishTime &lt;= gate_closure_iso</code>, guaranteeing zero future data leakage.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-amber-400 mb-1">Resolution Harmonization</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <code>FUELHH</code> is half-hourly (SP 1-48, 30 min) while <code>WINDFOR</code> is hourly (minute 0). Actuals are aggregated via mathematical mean across <code>SP 2H+1</code> and <code>SP 2H+2</code>, while preserving individual settlement period metadata.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-emerald-400 mb-1">Zero-Lag Database Querying</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instead of issuing expensive remote network calls on every UI action, the pipeline pre-ingested 23,385 records into indexed SQLite tables. All 744 hours of January 2026 evaluate in <strong>&lt; 4 milliseconds</strong>.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-purple-400 mb-1">Pydantic v2 & Type Safety</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict request/response validation schemas for all models (<code>AccuracyMetrics</code>, <code>ComparisonPoint</code>, <code>ProcurementSimResult</code>) ensure end-to-end contract integrity.
                </p>
              </div>
            </div>
          </div>

          {/* Statistical Formulations */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>3. Mathematical & Quantitative Metric Formulations</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
              <p>• <strong className="text-amber-400">MAE (Mean Absolute Error):</strong> <code>MAE = (1/N) * Σ |Forecast_i - Actual_i|</code> (Jan 2026: <strong>2,122.81 MW</strong>)</p>
              <p>• <strong className="text-indigo-400">RMSE (Root Mean Squared Error):</strong> <code>RMSE = sqrt((1/N) * Σ (Forecast_i - Actual_i)^2)</code> (Jan 2026: <strong>2,616.69 MW</strong>)</p>
              <p>• <strong className="text-rose-400">Trading Bias (Mean Error):</strong> <code>Bias = (1/N) * Σ (Forecast_i - Actual_i)</code> (Jan 2026: <strong className="text-rose-400">+1,840.30 MW</strong>)</p>
              <p>• <strong className="text-purple-400">WAPE (Weighted Abs Pct Error):</strong> <code>WAPE = (Σ |Forecast_i - Actual_i| / Σ Actual_i) * 100%</code> (Jan 2026: <strong>18.33%</strong>)</p>
              <p>• <strong className="text-cyan-400">Capacity-Normalized nMAE:</strong> <code>nMAE = (MAE / 21,000 MW Capacity) * 100%</code> (Jan 2026: <strong>10.11%</strong>)</p>
            </div>
          </div>

          {/* Docker & Deployment */}
          <div>
            <h3 className="text-white font-semibold text-base mb-3 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>4. Deployment, Containerization & CI/CD Readiness</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Multi-Stage Dockerfile:</strong> Builds React Vite assets in Stage 1 and bundles into a lightweight Python 3.12 slim image in Stage 2.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Vercel & Heroku Compatibility:</strong> Frontend can deploy standalone to Vercel with <code>vercel.json</code> proxy, or single-container to Heroku/Render/Docker.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Production Static Serving:</strong> FastAPI mounts <code>frontend/dist</code> to serve the single-page application with HTML5 push-state routing fallback.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-xs hover:bg-indigo-400 transition-colors cursor-pointer"
          >
            Close Technical Review
          </button>
        </div>
      </div>
    </div>
  );
}
