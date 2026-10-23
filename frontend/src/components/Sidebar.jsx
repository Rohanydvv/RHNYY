import React from 'react';
import {
  Wind, BarChart3, Flame, Presentation, FileCode2,
  Calendar, Layers, Sparkles, ExternalLink, ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenPitch, onOpenTechLead, deliveryDate, setDeliveryDate }) {
  const menuItems = [
    { id: 'cockpit', label: 'Day-Ahead Cockpit', icon: Wind },
    { id: 'evaluation', label: 'Forecast Accuracy', icon: BarChart3 },
    { id: 'procurement', label: 'Thermal Dispatch', icon: Flame },
  ];

  const caseStudies = [
    { date: '2026-01-02', label: 'Jan 02: +3.2 GW Over-forecast' },
    { date: '2026-01-05', label: 'Jan 05: Baseline Low Error' },
    { date: '2026-01-08', label: 'Jan 08: 18 GW Peak Ramp' },
    { date: '2026-01-15', label: 'Jan 15: Low Wind Trough' },
    { date: '2026-01-24', label: 'Jan 24: High Volatility' }
  ];

  return (
    <aside className="w-64 lg:w-72 bg-white rounded-[26px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#E6ECE4] flex flex-col justify-between shrink-0 h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-3rem)] lg:h-[calc(100vh-3.5rem)] sticky top-5 sm:top-6 lg:top-7 select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-1">
          <div className="w-10 h-10 rounded-full bg-[#123E33] flex items-center justify-center text-white shadow-xs">
            <Wind className="w-5 h-5 text-[#B8E35A] stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-base text-[#1D302B] font-['Plus_Jakarta_Sans'] tracking-tight block">
              VortexPower
            </span>
            <span className="text-[11px] text-[#75847D] font-medium block -mt-0.5">
              Renewable Intelligence
            </span>
          </div>
        </div>

        {/* Primary Menu Navigation */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#91A299] px-2.5 mb-2 block font-['Plus_Jakarta_Sans']">
            Menu
          </span>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-[16px] text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF3EC] text-[#167D5A] font-semibold shadow-2xs'
                      : 'text-[#556960] hover:bg-[#F4F7F2] hover:text-[#1D302B]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#167D5A]' : 'text-[#75847D]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* January 2026 Scenarios */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#91A299] px-2.5 mb-2 block font-['Plus_Jakarta_Sans']">
            Case Studies
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
                  className={`w-full text-left text-xs px-3 py-2 rounded-[14px] transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#F2F7F3] text-[#167D5A] font-semibold border border-[#D5E6DB]'
                      : 'text-[#647970] hover:bg-[#F4F7F2] hover:text-[#1D302B]'
                  }`}
                >
                  <span className="truncate">{cs.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#167D5A] shrink-0 ml-1"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Elexon Stream Status */}
        <div className="px-1">
          <div className="bg-[#F7F9F6] p-3 rounded-[18px] border border-[#E8EDE6] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847D]">
                BMRS Stream
              </span>
              <span className="flex items-center space-x-1 text-[10px] text-[#167D5A] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#167D5A] animate-pulse"></span>
                <span>Live Jan 2026</span>
              </span>
            </div>
            <p className="text-[11px] text-[#75847D] leading-tight">
              Synced with Elexon FUELHH & WINDFOR streams (744 trading hours).
            </p>
          </div>
        </div>
      </div>

      {/* Dark Forest Green Bottom Card (Matching the EcoSync Pro Card in Image) */}
      <div className="mt-4 bg-[#123E33] rounded-[22px] p-4 text-white shadow-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8E35A] block mb-1">
          Trading Desk Intel
        </span>
        <h4 className="text-xs font-bold text-white font-['Plus_Jakarta_Sans'] leading-tight">
          Executive Dossiers
        </h4>
        <p className="text-[11px] text-[#C0D4CC] mt-1 leading-snug">
          Inspect client pitch and technical architecture specifications.
        </p>

        <div className="flex space-x-2 mt-3">
          <button
            onClick={onOpenPitch}
            className="flex-1 bg-white hover:bg-[#F2F7F4] text-[#123E33] font-bold text-xs py-2 px-3 rounded-full text-center transition-colors cursor-pointer shadow-xs"
          >
            Client Pitch
          </button>
          <button
            onClick={onOpenTechLead}
            className="bg-[#1C4E42] hover:bg-[#256052] text-white font-medium text-xs py-2 px-3 rounded-full text-center transition-colors cursor-pointer"
            title="Tech Architecture"
          >
            Tech
          </button>
        </div>
      </div>
    </aside>
  );
}
