import React from 'react';
import {
  X, Presentation, CheckCircle, ArrowRight, ShieldCheck,
  TrendingUp, AlertTriangle, Flame, Wind, DollarSign, FileText
} from 'lucide-react';

export default function ClientPitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#E0E9E2] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Dossier Header */}
        <div className="p-5 sm:p-6 border-b border-[#E0E9E2] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0F4F1] border border-[#E0E9E2] flex items-center justify-center text-[#167D5A]">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#75847D] font-bold">
                  Executive Briefing Dossier · Ref VP-UK-2026-01
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1D302B] tracking-tight font-['Plus_Jakarta_Sans']">
                VortexPower: Wholesale Day-Ahead Renewable Procurement Platform
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

        {/* Dossier Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-[#1D302B] leading-relaxed font-['Inter']">
          {/* Executive Summary Callout */}
          <div className="bg-[#F7F9F5] border-l-3 border-[#167D5A] border-y border-r border-[#E0E9E2] p-5 rounded-r-2xl">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#167D5A] block mb-1">
              Executive Context & Problem Statement
            </span>
            <p className="text-[#1D302B] leading-relaxed">
              For a UK electricity utility, power procurement on the Day-Ahead auction (EPEX SPOT / Nord Pool GB) requires locking in wholesale purchases at <strong>11:00 GMT on Day D-1</strong> to cover forecast consumer demand across all 48 settlement periods of delivery day D.
              Deciding how much thermal generation to purchase requires subtracting expected renewable wind output. 
              However, <strong>in January 2026, raw wind forecasts systematically over-projected output in 84.4% of trading periods by an average of +1,840 MW</strong>. A desk blindly trusting raw forecasts faces severe unhedged short positions in the Balancing Mechanism, incurring heavy System Buy Price penalties.
            </p>
          </div>

          {/* Three Core Operational Pillars */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75847D] mb-3 font-mono">
              The VortexPower Solution: Three Operational Pillars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="text-[#167D5A] font-mono font-bold block mb-1 text-xs">1. Causal Gate Lock</span>
                <p className="text-[#75847D] leading-relaxed">
                  Filters Elexon WINDFOR strictly prior to your 11:00 GMT gate closure, eliminating lookahead bias and providing full auditability across SP 1–48.
                </p>
              </div>

              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="text-[#102A24] font-mono font-bold block mb-1 text-xs">2. NWP Evolution Tracking</span>
                <p className="text-[#75847D] leading-relaxed">
                  Tracks successive Numerical Weather Prediction model updates (02:30, 04:30, 07:30, 09:30 GMT) so traders evaluate model convergence before bidding.
                </p>
              </div>

              <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-4 rounded-xl">
                <span className="text-[#167D5A] font-mono font-bold block mb-1 text-xs">3. Risk-Adjusted Derating</span>
                <p className="text-[#75847D] leading-relaxed">
                  Calculates real-world MAE (2,123 MW) and bias (+1,840 MW), allowing traders to apply a 10–18% haircut to wind forecasts and eliminate costly short balancing positions.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional ROI Proof */}
          <div className="bg-[#F7F9F5] border border-[#E0E9E2] p-5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#75847D] mb-2 font-mono">
              Demonstrated Financial ROI for a 10% UK Market Share Desk
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[#75847D] text-[11px] block">January 2, 2026 Severe Miss Event:</span>
                <span className="text-amber-800 font-mono font-bold text-sm block mt-0.5">+3,196 MW National Wind Over-forecast</span>
                <p className="text-[#75847D] text-[11px] mt-1 leading-relaxed">
                  Without derating, a 10% utility under-procured 7,670 MWh thermal day-ahead, incurring substantial emergency balancing cashouts.
                </p>
              </div>

              <div>
                <span className="text-[#75847D] text-[11px] block">VortexPower Derating Mitigation:</span>
                <span className="text-[#167D5A] font-mono font-bold text-sm block mt-0.5">+£45,000–£78,000 Cashout Savings</span>
                <p className="text-[#75847D] text-[11px] mt-1 leading-relaxed">
                  Applying an 18% bias haircut protected the utility by purchasing sufficient thermal power at wholesale rates (£85/MWh).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E0E9E2] flex justify-end bg-[#F7F9F5] rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#167D5A] hover:bg-[#126448] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Executive Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
