import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  HardHat,
  MapPin,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { PotholeRecord } from '../types';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { EvidenceMap } from '../components/EvidenceMap';
import { StatusBadge } from '../components/StatusBadge';

interface LandingPageProps {
  potholes?: PotholeRecord[];
  onNavigate: (view: string, potholeId?: string) => void;
  onResolveComplaint?: (potholeId: string) => Promise<void> | void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  potholes = [],
  onNavigate,
}) => {
  const [trackQuery, setTrackQuery] = useState('');
  const [activeMapPotholeId, setActiveMapPotholeId] = useState<string>(
    potholes.length > 0 ? (potholes[0].complaintId || potholes[0].potholeId) : ''
  );

  const selectedMapPothole =
    potholes.find((p) => (p.complaintId || p.potholeId) === activeMapPotholeId) ||
    potholes[0] ||
    null;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      onNavigate('detail', trackQuery.trim());
    }
  };

  return (
    <div id="landing-page" className="min-h-[calc(100vh-4.5rem)] bg-slate-50 flex flex-col justify-between">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* 1. HERO SECTION */}
        <section className="max-w-4xl mx-auto w-full text-center">
          {/* Civic Verification Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold mb-5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-sky-700" />
            <span>Transparent Civic Infrastructure Platform</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
            RoadSetu <span className="text-sky-700">AI</span>
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            “Report it. Track it. Prove it’s repaired.”
          </p>

          {/* Supporting text */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered evidence verification for civic infrastructure. RoadSetu tracks every pothole
            with a persistent digital identity and proves whether the contractor actually repaired the
            <strong> same pothole and location</strong> originally reported.
          </p>

          {/* Primary Main Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onNavigate('report')}
              className="px-6 py-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-sky-200" />
              <span>Report a Pothole</span>
            </button>

            <button
              onClick={() => onNavigate('track')}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5 text-slate-500" />
              <span>Track Complaint</span>
            </button>

            <button
              onClick={() => onNavigate('authority')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <HardHat className="w-5 h-5 text-amber-400" />
              <span>Authority Portal</span>
            </button>
          </div>

          {/* Fast Tracking Input */}
          <div className="mt-7 max-w-md mx-auto">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Enter Complaint ID (e.g. PTH-2026-00142)"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="w-full pl-4 pr-24 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-600 shadow-2xs font-mono"
              />
              <button
                type="submit"
                className="absolute right-1 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-md text-xs font-semibold"
              >
                Track
              </button>
            </form>
          </div>
        </section>

        {/* 2. VISUAL REPAIR WORKFLOW (4-Step Walkthrough: 01 REPORT -> 02 ASSIGN -> 03 REPAIR & UPLOAD -> 04 AI VERIFY) */}
        <section>
          <WorkflowVisualizer />
        </section>

        {/* 3. CIVIC EVIDENCE MAP (Dynamic Complaints from Firestore) */}
        {selectedMapPothole && (
          <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-700" />
                  <span>Dynamic Civic Map &amp; Spatial Audit</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-950">
                  Live Civic Geolocation Map
                </h2>
                <p className="text-xs text-slate-600">
                  Inspect real-time road defect locations and contractor repair coordinates across the municipality.
                </p>
              </div>

              {/* Selector for active pothole on map */}
              {potholes.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Select Record:</span>
                  <select
                    value={activeMapPotholeId || (selectedMapPothole.complaintId || selectedMapPothole.potholeId)}
                    onChange={(e) => setActiveMapPotholeId(e.target.value)}
                    className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono focus:ring-2 focus:ring-sky-600"
                  >
                    {potholes.map((p) => {
                      const id = p.complaintId || p.potholeId;
                      return (
                        <option key={id} value={id}>
                          {id} - {p.address ? p.address.slice(0, 30) + '...' : p.severity}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* Embedded Evidence Map Component (strictly no raw coords or external GPS links) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <EvidenceMap
                  originalLat={selectedMapPothole.latitude}
                  originalLon={selectedMapPothole.longitude}
                  afterLat={selectedMapPothole.afterLatitude}
                  afterLon={selectedMapPothole.afterLongitude}
                  originalAddress={selectedMapPothole.address || selectedMapPothole.location}
                  afterAddress={selectedMapPothole.afterAddress}
                  height="h-72 sm:h-80"
                />
              </div>

              {/* Selected Pothole Info Panel */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-900 bg-sky-100/70 px-2 py-0.5 rounded text-xs">
                      {selectedMapPothole.complaintId || selectedMapPothole.potholeId}
                    </span>
                    <StatusBadge status={selectedMapPothole.status} />
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Civic Location</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {selectedMapPothole.address || selectedMapPothole.location || 'Reported Road Section'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Defect Summary</span>
                    <p className="text-slate-700 mt-0.5 line-clamp-2">
                      {selectedMapPothole.description}
                    </p>
                  </div>

                  {selectedMapPothole.assignedContractor?.name && (
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Assigned Contractor</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {selectedMapPothole.assignedContractor.name} ({selectedMapPothole.assignedContractor.company})
                      </p>
                    </div>
                  )}

                  {selectedMapPothole.verification?.verificationStatus && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>AI Result: {selectedMapPothole.verification.verificationStatus}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Verification Confidence: {selectedMapPothole.verification.overallVerificationScore.toFixed(0)}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 mt-4">
                  <button
                    onClick={() =>
                      onNavigate('detail', selectedMapPothole.complaintId || selectedMapPothole.potholeId)
                    }
                    className="w-full py-2 px-3 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <span>View Full Evidence &amp; Audit Trail</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
