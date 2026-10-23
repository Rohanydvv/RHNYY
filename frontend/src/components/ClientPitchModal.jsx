import React from 'react';
import {
  X, Presentation, CheckCircle, ArrowRight, ShieldCheck,
  TrendingUp, AlertTriangle, Flame, Wind, DollarSign, FileText
} from 'lucide-react';

export default function ClientPitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Dossier Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0B0F19]/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                  Executive Briefing Dossier · Ref VP-UK-2026-01
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                VortexPower: Wholesale Day-Ahead Renewable Procurement Solution
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

        {/* Dossier Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Executive Summary */}
          <div className="bg-[#070A12] border-l-2 border-emerald-500 border-y border-r border-slate-800 p-4 rounded-r-xl">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 block mb-1">
              Executive Context & Problem Statement
            </span>
            <p className="text-slate-200">
              For a UK electricity supplier, power procurement on the Day-Ahead auction (EPEX SPOT / Nord Pool GB) requires locking in purchase contracts at <strong>11:00 GMT on Day D-1</strong> to cover forecast consumer demand across all 48 half-hourly settlement periods of Day D.
              Deciding how much thermal generation to purchase requires subtracting expected renewable wind output. 
              However, <strong>in January 2026, raw wind forecasts systematically over-projected output in 84.4% of trading periods by an average of +1,840 MW</strong>. A desk blindly trusting raw forecasts faces severe unhedged short positions in the Balancing Mechanism, incurring heavy System Buy Price penalties.
            </p>
          </div>

          {/* Three Core Pillars */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
              The VortexPower Solution: Three Operational Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#070A12] border border-slate-800 p-4 rounded-xl">
                <span className="text-cyan-400 font-mono font-semibold block mb-1">1. Causal Gate Lock</span>
                <p className="text-slate-400">
                  Filters Elexon WINDFOR strictly prior to your 11:00 GMT gate closure, eliminating lookahead bias and providing full auditability across SP 1–48.
                </p>
              </div>

              <div className="bg-[#070A12] border border-slate-800 p-4 rounded-xl">
                <span className="text-amber-400 font-mono font-semibold block mb-1">2. NWP Evolution Tracking</span>
                <p className="text-slate-400">
                  Tracks successive Numerical Weather Prediction model updates (02:30, 04:30, 07:30, 09:30 GMT) so traders evaluate model convergence before bidding.
                </p>
              </div>

              <div className="bg-[#070A12] border border-slate-800 p-4 rounded-xl">
                <span className="text-emerald-400 font-mono font-semibold block mb-1">3. Risk-Adjusted Derating</span>
                <p className="text-slate-400">
                  Calculates real-world MAE (2,123 MW) and bias (+1,840 MW), allowing traders to apply a 10–18% haircut to wind forecasts and eliminate costly short balancing positions.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional ROI Proof */}
          <div className="bg-[#070A12] border border-slate-800 p-5 rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
              Demonstrated ROI for a 10% UK Market Share Desk
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 text-[11px] block">January 2, 2026 Severe Miss Event:</span>
                <span className="text-rose-400 font-mono font-bold text-sm block mt-0.5">+3,196 MW National Wind Over-forecast</span>
                <p className="text-slate-500 text-[11px] mt-1">
                  Without derating, a 10% utility under-procured 7,670 MWh thermal day-ahead, incurring substantial emergency balancing cashouts.
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">VortexPower Derating Mitigation:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm block mt-0.5">+£45,000–£78,000 Cashout Savings</span>
                <p className="text-slate-500 text-[11px] mt-1">
                  Applying an 18% bias haircut protected the utility by purchasing sufficient thermal power at wholesale rates (£85/MWh).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex justify-end bg-[#070A12]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer border border-slate-700"
          >
            Close Executive Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
