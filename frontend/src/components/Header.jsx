import React from 'react';
import { Wind, BarChart3, Flame, Presentation, FileCode, CheckCircle2, Zap } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenPitch, onOpenTechLead }) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-cyan-500/20 shadow-md">
              <Wind className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">VortexPower</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-medium">
                  UK Day-Ahead v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Renewable Procurement & Forecast Risk Evaluation · Elexon BMRS Stream
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'cockpit'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span className="hidden md:inline">Day-Ahead Cockpit</span>
              <span className="md:hidden">Cockpit</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Forecast Accuracy Studio</span>
              <span className="md:hidden">Accuracy</span>
            </button>

            <button
              onClick={() => setActiveTab('procurement')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'procurement'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="hidden md:inline">Thermal Dispatch Simulator</span>
              <span className="md:hidden">Dispatch</span>
            </button>
          </nav>

          {/* Action Modals */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPitch}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
              title="Present and pitch to client"
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden lg:inline">Client Pitch</span>
            </button>

            <button
              onClick={onOpenTechLead}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all cursor-pointer"
              title="Technical lead design & implementation review"
            >
              <FileCode className="w-4 h-4" />
              <span className="hidden lg:inline">Tech Review</span>
            </button>

            {/* Elexon Stream Pill */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2 py-1 bg-slate-800/70 rounded-full border border-slate-700 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BMRS Live Jan 2026</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
