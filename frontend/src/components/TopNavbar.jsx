import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Clock, Calendar, ShieldCheck, User, X, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function TopNavbar({ activeTab, setActiveTab, deliveryDate, setDeliveryDate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const searchSuggestions = [
    { type: 'date', label: '2026-01-02', desc: 'Severe Over-forecast (+3.2 GW Bias)', tab: 'cockpit' },
    { type: 'date', label: '2026-01-05', desc: 'Baseline Low Error (11% WAPE)', tab: 'cockpit' },
    { type: 'date', label: '2026-01-08', desc: '18 GW Peak Generation Ramp Day', tab: 'cockpit' },
    { type: 'date', label: '2026-01-15', desc: 'Low Wind Trough (<5 GW)', tab: 'cockpit' },
    { type: 'date', label: '2026-01-24', labelText: 'Jan 24', desc: 'High Balancing Volatility', tab: 'cockpit' },
    { type: 'metric', label: 'Mean Absolute Error (MAE)', desc: 'View Full Jan 2026 MAE (2,123 MW)', tab: 'evaluation' },
    { type: 'metric', label: 'Systematic Trading Bias', desc: 'View +1,840 MW Over-forecast Rate (84.4%)', tab: 'evaluation' },
    { type: 'tool', label: 'Thermal Dispatch Simulator', desc: 'Calculate derating & balancing cashouts', tab: 'procurement' },
  ];

  const filteredSuggestions = searchQuery.trim() === ''
    ? searchSuggestions.slice(0, 5)
    : searchSuggestions.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (item) => {
    if (item.type === 'date') {
      const target = item.label.startsWith('2026-01-') ? item.label : `2026-01-${item.label.padStart(2, '0')}`;
      if (setDeliveryDate) setDeliveryDate(target);
      if (setActiveTab) setActiveTab('cockpit');
    } else if (item.tab && setActiveTab) {
      setActiveTab(item.tab);
    }
    setSearchQuery('');
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      // Match day number like "8" or "08" or "2026-01-08"
      if (/^\d{1,2}$/.test(q)) {
        const day = parseInt(q, 10);
        if (day >= 1 && day <= 31) {
          const dateStr = `2026-01-${String(day).padStart(2, '0')}`;
          if (setDeliveryDate) setDeliveryDate(dateStr);
          if (setActiveTab) setActiveTab('cockpit');
          setSearchQuery('');
          setIsFocused(false);
        }
      } else if (/^2026-01-\d{2}$/.test(q)) {
        if (setDeliveryDate) setDeliveryDate(q);
        if (setActiveTab) setActiveTab('cockpit');
        setSearchQuery('');
        setIsFocused(false);
      } else if (filteredSuggestions.length > 0) {
        handleSelect(filteredSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative">
      {/* Interactive, Clickable Search Pill (Alignd to same Y level as sidebar) */}
      <div ref={searchRef} className="relative w-full sm:max-w-md">
        <div className={`flex items-center space-x-2.5 bg-white rounded-full px-4 h-11 border transition-all shadow-xs ${
          isFocused
            ? 'border-[#167D5A] ring-2 ring-[#167D5A]/15 shadow-sm'
            : 'border-[#E6ECE4] hover:border-[#CBD5C8]'
        }`}>
          <Search className={`w-4 h-4 shrink-0 transition-colors ${isFocused ? 'text-[#167D5A]' : 'text-[#75847D]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search dates (e.g. 2026-01-08), metrics, or tabs..."
            className="w-full bg-transparent text-xs text-[#1D302B] placeholder:text-[#8FA097] focus:outline-none font-medium cursor-text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full hover:bg-[#F2F5F0] text-[#75847D] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Interactive Dropdown Results */}
        {isFocused && (
          <div className="absolute left-0 right-0 top-12 mt-1 bg-white rounded-[20px] p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-[#E6ECE4] z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#91A299] font-['Outfit']">
              Quick Navigation & Insights
            </div>
            <div className="space-y-1">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-2 rounded-[14px] hover:bg-[#F2F7F4] text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#EAF3EC] text-[#167D5A] flex items-center justify-center font-mono font-bold text-[10px]">
                      {item.type === 'date' ? 'D' : item.type === 'metric' ? 'M' : 'T'}
                    </div>
                    <div>
                      <span className="font-bold text-[#1D302B] block font-mono text-[11px] group-hover:text-[#167D5A]">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-[#75847D] block">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#91A299] group-hover:text-[#167D5A] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
            <div className="px-3 py-1.5 mt-1 border-t border-[#E8ECE6] text-[10px] text-[#8FA097] flex items-center justify-between">
              <span>Type date (1–31) & press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">Enter</kbd></span>
              <span><kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono">Esc</kbd> to close</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls & Profile Pill (Aligned to same level) */}
      <div className="flex items-center space-x-2.5 self-end sm:self-auto shrink-0">
        {/* Gate Closure Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-white rounded-full px-4 h-11 border border-[#E6ECE4] shadow-xs text-xs font-medium text-[#1D302B]">
          <Clock className="w-3.5 h-3.5 text-[#167D5A]" />
          <span>Cutoff: <strong className="font-semibold text-[#167D5A]">11:00 GMT (D-1)</strong></span>
        </div>

        {/* Live Status Icon */}
        <div className="w-11 h-11 rounded-full bg-white border border-[#E6ECE4] shadow-xs flex items-center justify-center text-[#167D5A]">
          <ShieldCheck className="w-4 h-4" />
        </div>

        {/* Desk Profile Badge */}
        <div className="flex items-center space-x-2.5 bg-white rounded-full pl-2.5 pr-4 h-11 border border-[#E6ECE4] shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#EAF3EC] text-[#167D5A] flex items-center justify-center font-bold text-xs font-['Outfit']">
            UK
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-bold text-[#1D302B] block font-['Outfit']">Wholesale Desk</span>
            <span className="text-[10px] text-[#75847D] block -mt-0.5">Procurement Lead</span>
          </div>
        </div>
      </div>
    </div>
  );
}
