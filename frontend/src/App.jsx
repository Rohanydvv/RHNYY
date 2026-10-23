import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DayAheadCockpit from './components/DayAheadCockpit';
import EvaluationStudio from './components/EvaluationStudio';
import ProcurementSimulator from './components/ProcurementSimulator';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadReviewModal from './components/TechLeadReviewModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit');
  const [deliveryDate, setDeliveryDate] = useState('2026-01-05');
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF2ED] text-[#1D302B] p-5 sm:p-6 lg:p-7 flex items-start gap-5 sm:gap-6 font-['Inter'] antialiased selection:bg-[#B8E35A] selection:text-[#102A24]">
      {/* Floating Left Sidebar (Exact same top level as search bar, equal 4-edge margins) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
      />

      {/* Main Content Area (Starts at exact same top level as sidebar) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Interactive Top Navbar (Search bar & Profile Pills on same horizontal line) */}
        <TopNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          deliveryDate={deliveryDate}
          setDeliveryDate={setDeliveryDate}
        />

        {/* Content Views */}
        <main className="flex-1 w-full">
          {activeTab === 'cockpit' && (
            <DayAheadCockpit deliveryDate={deliveryDate} setDeliveryDate={setDeliveryDate} />
          )}
          {activeTab === 'evaluation' && <EvaluationStudio />}
          {activeTab === 'procurement' && <ProcurementSimulator />}
        </main>
      </div>

      {/* Briefing Dossier Modals */}
      <ClientPitchModal isOpen={isPitchOpen} onClose={() => setIsPitchOpen(false)} />
      <TechLeadReviewModal isOpen={isTechLeadOpen} onClose={() => setIsTechLeadOpen(false)} />
    </div>
  );
}
