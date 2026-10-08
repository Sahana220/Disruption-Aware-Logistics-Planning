import React, { useState } from 'react';
import Header from './components/Header';
import StatusBanner from './components/StatusBanner';
import MapView from './components/MapView';
import FleetCards from './components/FleetCards';
import ScheduleList from './components/ScheduleList';
import DisruptionModal from './components/DisruptionModal';
import ImpactPanel from './components/ImpactPanel';
import OptionsPanel from './components/OptionsPanel';
import BeforeAfter from './components/BeforeAfter';
import DependencyGraph from './components/DependencyGraph';
import ActivityLog from './components/ActivityLog';

export default function App() {
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. Control Room Header */}
      <Header onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)} />

      {/* 2. Three-Part Status Banner: WHAT CHANGED -> WHAT IS AFFECTED -> WHAT NEXT */}
      <StatusBanner onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)} />

      {/* Main Workspace Dashboard: 2-Column Layout */}
      <main className="flex-1 p-3 md:p-4 max-w-[1720px] w-full mx-auto flex flex-col gap-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 items-start">
          {/* LEFT AREA: Live Plan (Vans, Map, Dependency Graph & Manifest) - 7 cols */}
          <section className="lg:col-span-7 flex flex-col gap-3">
            {/* Live Fleet Cards */}
            <FleetCards />

            {/* Interactive Leaflet Map with OSRM routes, weather overlay, and road closure markings */}
            <div className="h-[520px] relative isolate z-0" style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}>
              <MapView />
            </div>

            {/* Real SVG Cross-Van Dependency Node-Link Graph */}
            <DependencyGraph />

            {/* Live Delivery Schedule Table */}
            <ScheduleList />
          </section>

          {/* RIGHT AREA: Impact + Options + Before/After - 5 cols */}
          <section className="lg:col-span-5 flex flex-col gap-3">
            <div className="sticky top-16 flex flex-col gap-3">
              {/* Stage 2: What is Affected — capped height so Options is visible without scrolling */}
              <ImpactPanel maxHeight={320} />

              {/* Stage 3: Before/After card (shown only after Apply) */}
              <BeforeAfter />

              {/* Stage 3: Recommended Actions / Options Panel */}
              <OptionsPanel />
            </div>
          </section>
        </div>

        {/* Collapsible Incident & Event Timeline */}
        <ActivityLog />
      </main>

      {/* Disruption Report Modal */}
      <DisruptionModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
      />
    </div>
  );
}
