import React from 'react';
import { ExternalLink, Calendar, Clock, Activity, ShieldCheck } from 'lucide-react';

export default function TopNavbar({ activeTab, deliveryDate }) {
  const titles = {
    cockpit: {
      title: 'Day-Ahead Wind Procurement Cockpit',
      subtitle: `Gate-closure synchronized forecast vs realized actuals for delivery day ${deliveryDate}`
    },
    evaluation: {
      title: 'Forecast Accuracy & Quantitative Risk Studio',
      subtitle: 'MAE, RMSE, Trading Bias (+MW), WAPE & Diurnal error distributions across January 2026'
    },
    procurement: {
      title: 'Thermal Dispatch & Balancing Exposure Simulator',
      subtitle: 'Dynamic wind derating safety margins and wholesale balancing cashout risk model'
    }
  };

  const current = titles[activeTab] || titles.cockpit;

  return (
    <nav className="bg-white border-b border-[#E0E9E2] px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#1D302B] font-['Plus_Jakarta_Sans'] tracking-tight">
            {current.title}
          </h1>
          <p className="text-xs text-[#75847D] mt-0.5 font-['Inter']">
            {current.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Day-Ahead Gate Notice */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F7F9F5] border border-[#E0E9E2] text-[#1D302B] font-medium font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#167D5A]" />
            <span>Auction Cutoff: <strong>11:00 GMT (D-1)</strong></span>
          </div>

          <a
            href="https://bmrs.elexon.co.uk"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-[#167D5A] hover:bg-[#F0F4F1] transition-colors font-medium border border-[#E0E9E2]"
          >
            <span>Elexon BMRS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </nav>
  );
}
