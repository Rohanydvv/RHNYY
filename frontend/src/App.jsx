import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DayAheadCockpit from './components/DayAheadCockpit';
import EvaluationStudio from './components/EvaluationStudio';
import ProcurementSimulator from './components/ProcurementSimulator';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadReviewModal from './components/TechLeadReviewModal';
import { ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [deliveryDate, setDeliveryDate] = useState('2026-01-05');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9F5] text-[#1D302B] flex font-['Inter'] antialiased selection:bg-[#B8E35A] selection:text-[#102A24]">
      {/* Deep Forest Sidebar (#102A24) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
      />

      {/* Main Content Area (Warm White #F7F9F5) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar activeTab={activeTab} deliveryDate={deliveryDate} />

        {/* Content Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'cockpit' && (
            <DayAheadCockpit deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate} />
          )}
          {activeTab === 'evaluation' && <EvaluationStudio />}
          {activeTab === 'procurement' && <ProcurementSimulator />}
        </main>

        {/* Platform Footer */}
        <footer className="border-t border-[#E0E9E2] bg-white py-5 px-6 sm:px-8 text-xs text-[#75847D] mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#1D302B] font-['Plus_Jakarta_Sans']">VORTEXPOWER</span>
              <span className="text-[#E0E9E2]">|</span>
              <span className="text-[#75847D]">UK Renewable Energy Intelligence & Wholesale Decision Support</span>
              <span className="text-[#E0E9E2]">|</span>
              <span className="text-[#75847D] font-mono text-[11px]">Elexon BMRS Stream (January 2026)</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <button
                onClick={() => setIsPitchOpen(true)}
                className="text-[#167D5A] hover:underline cursor-pointer font-medium"
              >
                Client Pitch Dossier
              </button>
              <span className="text-[#E0E9E2]">•</span>
              <button
                onClick={() => setIsTechLeadOpen(true)}
                className="text-[#167D5A] hover:underline cursor-pointer font-medium"
              >
                Architecture Specification
              </button>
              <span className="text-[#E0E9E2]">•</span>
              <a
                href="https://bmrs.elexon.co.uk"
                target="_blank"
                rel="noreferrer"
                className="text-[#75847D] hover:text-[#167D5A] transition-colors flex items-center space-x-1"
              >
                <span>bmrs.elexon.co.uk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Briefing Dossiers */}
      <ClientPitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
      <TechLeadReviewModal isOpen={isTechLeadOpen} onClose={() => setIsTechLeadOpen(false)} />
    </div>
  );
}
