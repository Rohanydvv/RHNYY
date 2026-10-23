import React from 'react';
import {
  Activity, BarChart2, Flame, Layers, Presentation,
  Code2, ExternalLink, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenPitch, onOpenTechLead }) {
  const tabs = [
    { id: 'cockpit', label: 'Day-Ahead Cockpit', icon: Activity, badge: 'D-1 Auction' },
    { id: 'evaluation', label: 'Forecast Accuracy Studio', icon: BarChart2, badge: 'Quant Risk' },
    { id: 'procurement', label: 'Thermal Dispatch Simulator', icon: Flame, badge: 'Balancing' },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F19]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Utility Bar */}
      <div className="border-b border-slate-800/50 bg-[#070A12] px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-slate-200">ELEXON BMRS STREAM</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">FUELHH & WINDFOR (Jan 2026)</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-400">
              Auction Cutoff: <strong className="text-slate-300 font-mono">11:00 GMT (D-1)</strong>
            </span>
            <span className="hidden lg:inline text-slate-600">|</span>
            <span className="hidden lg:inline text-slate-400">
              Benchmark GB Wind Fleet: <strong className="text-slate-300 font-mono">21,000 MW</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">System: Operational (744h Synced)</span>
            <span className="text-slate-700">•</span>
            <a
              href="https://bmrs.elexon.co.uk"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition-colors flex items-center space-x-1"
            >
              <span>bmrs.elexon.co.uk</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-cyan-400 shadow-inner">
              <Activity className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm tracking-wider text-white uppercase font-mono">
                  VORTEX<span className="text-cyan-400">POWER</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60">
                  GB Wholesale v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                UK Day-Ahead Renewable Procurement & Forecast Risk Studio
              </p>
            </div>
          </div>

          {/* Institutional Segmented Navigation Tabs */}
          <nav className="flex items-center bg-[#070A12] p-1 rounded-lg border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm font-semibold border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Executive Documentation / Briefing Modals */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenPitch}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
              title="Open Client Pitch & Executive Value Dossier"
            >
              <Presentation className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Client Pitch</span>
            </button>

            <button
              onClick={onOpenTechLead}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
              title="Open Technical Design & Implementation Spec"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Tech Review</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
