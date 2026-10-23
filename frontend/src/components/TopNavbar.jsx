import React from 'react';
import { Search, Bell, Clock, Calendar, ShieldCheck, User } from 'lucide-react';

export default function TopNavbar({ activeTab, deliveryDate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      {/* Search / Context Pill (Matching image's rounded-full search bar) */}
      <div className="flex items-center space-x-2.5 bg-white rounded-full px-4 py-2.5 border border-[#E6ECE4] shadow-xs w-full sm:max-w-md">
        <Search className="w-4 h-4 text-[#75847D] shrink-0" />
        <span className="text-xs text-[#75847D] font-mono">
          Elexon BMRS Stream · GB Day-Ahead Wholesale Market (Jan 2026)
        </span>
      </div>

      {/* Right Controls & Profile Pill (Matching image's circular action buttons + user pill) */}
      <div className="flex items-center space-x-2 self-end sm:self-auto">
        {/* Gate Closure Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-white rounded-full px-3.5 py-2 border border-[#E6ECE4] shadow-xs text-xs font-mono font-medium text-[#1D302B]">
          <Clock className="w-3.5 h-3.5 text-[#167D5A]" />
          <span>Cutoff: <strong>11:00 GMT (D-1)</strong></span>
        </div>

        {/* Live Grid Icon */}
        <div className="w-9 h-9 rounded-full bg-white border border-[#E6ECE4] shadow-xs flex items-center justify-center text-[#167D5A]">
          <ShieldCheck className="w-4 h-4" />
        </div>

        {/* Desk Profile Badge (Matching image's user pill) */}
        <div className="flex items-center space-x-2.5 bg-white rounded-full pl-3 pr-4 py-1.5 border border-[#E6ECE4] shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#EAF3EC] text-[#167D5A] flex items-center justify-center font-bold text-xs font-['Plus_Jakarta_Sans']">
            UK
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold text-[#1D302B] block font-['Plus_Jakarta_Sans']">Wholesale Desk</span>
            <span className="text-[10px] text-[#75847D] block -mt-0.5">Procurement Lead</span>
          </div>
        </div>
      </div>
    </div>
  );
}
