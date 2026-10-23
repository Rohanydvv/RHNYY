import React, { useState } from 'react';
import Header from './components/Header';
import DayAheadCockpit from './components/DayAheadCockpit';
import EvaluationStudio from './components/EvaluationStudio';
import ProcurementSimulator from './components/ProcurementSimulator';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadReviewModal from './components/TechLeadReviewModal';
import { ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Institutional Top Bar & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cockpit' && <DayAheadCockpit />}
        {activeTab === 'evaluation' && <EvaluationStudio />}
        {activeTab === 'procurement' && <ProcurementSimulator />}
      </main>

      {/* Trading Desk Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070A12] py-5 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-semibold text-slate-400">VORTEXPOWER</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">UK Wholesale Electricity Day-Ahead Decision Support</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500 font-mono">Elexon BMRS Live Streams (January 2026)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <button
              onClick={() => setIsPitchOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Client Briefing Dossier
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsTechLeadOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Architecture Specification
            </button>
            <span className="text-slate-700">•</span>
            <a
              href="https://bmrs.elexon.co.uk"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center space-x-1"
            >
              <span>Elexon BMRS Stream</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Slide-over / Briefing Modals */}
      <ClientPitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
      <TechLeadReviewModal isOpen={isTechLeadOpen} onClose={() => setIsTechLeadOpen(false)} />
    </div>
  );
}
