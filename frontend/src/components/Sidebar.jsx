import React from 'react';
import {
  Wind, BarChart3, Flame, Presentation, FileCode2,
  ExternalLink, Sparkles, ShieldCheck, Clock, Calendar
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenPitch, onOpenTechLead, deliveryDate, setDeliveryDate }) {
  const navItems = [
    { id: 'cockpit', label: 'Day-Ahead Cockpit', icon: Wind, description: 'Locked D-1 Auction Forecasts' },
    { id: 'evaluation', label: 'Forecast Accuracy Studio', icon: BarChart3, description: 'MAE, Bias & Diurnal Risk' },
    { id: 'procurement', label: 'Thermal Dispatch Simulator', icon: Flame, description: 'Balancing & Derating Model' },
  ];

  const caseStudies = [
    { date: '2026-01-02', label: 'Jan 02: Severe Over-forecast (+3.2 GW)' },
    { date: '2026-01-05', label: 'Jan 05: High Accuracy Baseline' },
    { date: '2026-01-08', label: 'Jan 08: 18 GW Peak Generation Ramp' },
    { date: '2026-01-15', label: 'Jan 15: Low Wind Trough (<5 GW)' },
    { date: '2026-01-24', label: 'Jan 24: High Balancing Volatility' },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[#102A24] text-white flex flex-col shrink-0 border-r border-[#1B3E35] select-none min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1B3E35] flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-[#167D5A] flex items-center justify-center text-[#B8E35A] shadow-sm shrink-0">
          <Wind className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
              VortexPower
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#167D5A]/40 text-[#B8E35A] font-medium border border-[#B8E35A]/30 font-mono">
              GB v1.0
            </span>
          </div>
          <p className="text-[11px] text-[#A3B8B0] tracking-tight">
            Renewable Energy Intelligence
          </p>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="p-3 space-y-1">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#75847D] px-3 py-1.5 block">
          Platform Modules
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#167D5A] text-white shadow-sm font-semibold'
                  : 'text-[#C5D6CF] hover:bg-[#167D5A]/25 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-[#B8E35A]' : 'text-[#75847D]'}`} />
              <div>
                <div className="text-xs font-['Plus_Jakarta_Sans'] font-medium">{item.label}</div>
                <div className={`text-[10px] ${isActive ? 'text-[#D0E2DB]' : 'text-[#75847D]'}`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Case Study Presets */}
      <div className="px-3 py-2 flex-1">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#75847D] px-3 py-1.5 block">
          January 2026 Scenarios
        </span>
        <div className="space-y-1">
          {caseStudies.map((cs) => {
            const isSelected = deliveryDate === cs.date;
            return (
              <button
                key={cs.date}
                onClick={() => {
                  setDeliveryDate(cs.date);
                  setActiveTab('cockpit');
                }}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#167D5A]/40 text-[#B8E35A] font-medium border border-[#B8E35A]/30'
                    : 'text-[#A3B8B0] hover:bg-[#167D5A]/15 hover:text-white'
                }`}
              >
                <span className="truncate">{cs.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#B8E35A] shrink-0 ml-1"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Stream Connectivity Card */}
      <div className="p-3 border-t border-[#1B3E35]">
        <div className="bg-[#0A1D19] p-3 rounded-xl border border-[#1B3E35] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#75847D]">
              Elexon BMRS Stream
            </span>
            <span className="flex items-center space-x-1 text-[10px] text-[#B8E35A] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8E35A] animate-pulse"></span>
              <span>Synced</span>
            </span>
          </div>
          <p className="text-[11px] text-[#A3B8B0] leading-tight">
            National wind actuals (FUELHH) & forecasts (WINDFOR) for January 2026 (744h).
          </p>
          <div className="mt-2 pt-2 border-t border-[#1B3E35] flex items-center justify-between text-[10px] text-[#75847D] font-mono">
            <span>Cutoff: 11:00 GMT</span>
            <span>Capacity: 21 GW</span>
          </div>
        </div>
      </div>

      {/* Briefings & Specs Footer */}
      <div className="p-3 border-t border-[#1B3E35] space-y-1">
        <button
          onClick={onOpenPitch}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-[#C5D6CF] hover:bg-[#167D5A]/25 hover:text-white transition-colors cursor-pointer"
        >
          <Presentation className="w-4 h-4 text-[#B8E35A]" />
          <span>Client Pitch Dossier</span>
        </button>

        <button
          onClick={onOpenTechLead}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-[#C5D6CF] hover:bg-[#167D5A]/25 hover:text-white transition-colors cursor-pointer"
        >
          <FileCode2 className="w-4 h-4 text-[#A3B8B0]" />
          <span>Technical Architecture</span>
        </button>
      </div>
    </aside>
  );
}
