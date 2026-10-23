import React, { useState } from 'react';
import Header from './components/Header';
import DayAheadCockpit from './components/DayAheadCockpit';
import EvaluationStudio from './components/EvaluationStudio';
import ProcurementSimulator from './components/ProcurementSimulator';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadReviewModal from './components/TechLeadReviewModal';
import { Wind, Shield, Database, ExternalLink, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'cockpit' && <DayAheadCockpit />}
        {activeTab === 'evaluation' && <EvaluationStudio />}
        {activeTab === 'procurement' && <ProcurementSimulator />}
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
              V
            </div>
            <span className="text-slate-300 font-medium">VortexPower Energy Decision-Support Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">UK Wholesale Day-Ahead Renewable Procurement</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <a
              href="https://bmrs.elexon.co.uk"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
            >
              <span>Elexon BMRS Stream</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsPitchOpen(true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Client Pitch
            </button>
            <button
              onClick={() => setIsTechLeadOpen(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Tech Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClientPitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
      <TechLeadReviewModal isOpen={isTechLeadOpen} onClose={() => setIsTechLeadOpen(false)} />
    </div>
  );
}
