import React from 'react';
import {
  X, Presentation, CheckCircle, ArrowRight, ShieldCheck,
  TrendingUp, AlertTriangle, Flame, Wind, DollarSign
} from 'lucide-react';

export default function ClientPitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Presentation className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Client Pitch: VortexPower UK Day-Ahead Platform</h2>
              <p className="text-xs text-slate-400">Tailored for the UK Utility Wholesale Electricity Procurement Desk</p>
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
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-800/40 rounded-2xl p-5">
            <h3 className="text-emerald-400 font-semibold text-base mb-2">Executive Summary</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
              For a UK energy utility, buying power in the day-ahead wholesale market is a high-stakes balance: procure too little thermal generation and face punitively expensive emergency Balancing Mechanism buy prices; procure too much and spill power at deeply discounted cashout prices. 
              <strong> VortexPower</strong> solves this by synchronizing Elexon BMRS renewable forecasts to your exact day-ahead auction cutoff (11:00 GMT), quantifying historical forecasting error, and enabling risk-adjusted thermal procurement.
            </p>
          </div>

          {/* The Client's Core Challenge */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>The Problem: The High Cost of Unhedged Renewable Forecast Error</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs font-semibold text-amber-400 block mb-1">1. Auction Gate Timing</span>
                <p className="text-xs text-slate-400">
                  Decisions must be finalized at <strong>11:00 GMT on D-1</strong> (EPEX SPOT / Nord Pool). Standard tools fail to clarify which exact forecast snapshot was available at gate closure.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs font-semibold text-rose-400 block mb-1">2. Systematic Over-Forecast Bias</span>
                <p className="text-xs text-slate-400">
                  In January 2026, raw wind forecasts over-predicted generation in <strong>84.4% of hours</strong> with an average over-estimation of <strong>+1,840 MW</strong> (up to +6,833 MW miss).
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                <span className="text-xs font-semibold text-cyan-400 block mb-1">3. Net Thermal Gap Sizing</span>
                <p className="text-xs text-slate-400">
                  Every megawatt of wind over-forecast translates directly into an unhedged thermal generation deficit, triggering high Balancing Mechanism cashout penalties.
                </p>
              </div>
            </div>
          </div>

          {/* Product Capabilities Tailored to Requirements */}
          <div>
            <h3 className="text-white font-semibold text-base mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>The VortexPower Solution: Tailored Capabilities</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">1. Gate-Closure Synchronized Forecast Cockpit (Requirement 1)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Filters the Elexon WINDFOR dataset strictly prior to your 11:00 GMT auction gate closure on Day D-1. Eliminates lookahead bias, displays latest forecast profiles, and tracks multi-run NWP model evolution across 02:30, 04:30, 07:30, and 09:30 publication runs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">2. Quantified Forecast Accuracy & Bias Studio (Requirement 2)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Delivers institutional-grade statistical evaluation across January 2026: Mean Absolute Error (MAE: 2,123 MW), RMSE (2,617 MW), Trading Bias (+1,840 MW), WAPE (18.3%), Capacity Normalized nMAE (10.1%), Diurnal diurnal curves, and Error Frequency Histograms.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">3. Risk-Adjusted Thermal Dispatch Simulator</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Enables your desk to simulate consumer demand profiles and adjust the wind derating factor (e.g., applying a 10-15% safety haircut based on quantified historical bias). Demonstrates instantaneous reduction of unhedged short positions and balancing penalty savings.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Impact & ROI */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-base mb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Measurable ROI for Your Trading Desk</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Penalty Avoidance:</strong> On high miss days (such as Jan 2's +3.2 GW over-forecast), applying an 18% bias haircut saves up to <strong>£40,000 - £80,000 per delivery day</strong> for a 10% market share utility.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Audit Compliance:</strong> Full half-hourly settlement period mapping (SP 1 to 48) aligned with Elexon BSC settlement standards with one-click CSV export.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Instant Turnaround:</strong> Sub-5ms query response times via high-performance SQLite caching over official Elexon BMRS stream APIs.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            Explore Live Application
          </button>
        </div>
      </div>
    </div>
  );
}
