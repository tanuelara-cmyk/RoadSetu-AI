import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  HardHat,
} from 'lucide-react';
import { DemoScenario } from '../types';
import { SampleVerificationFlow } from '../components/SampleVerificationFlow';

interface LandingPageProps {
  onNavigate: (view: string, potholeId?: string) => void;
  scenarios?: DemoScenario[];
  onSelectScenario?: (scenarioId: string) => void;
  onOpenClusterModal?: () => void;
  onResolveComplaint?: (potholeId: string) => Promise<void> | void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onResolveComplaint,
}) => {
  const [trackQuery, setTrackQuery] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      onNavigate('detail', trackQuery.trim());
    }
  };

  return (
    <div id="landing-page" className="min-h-[calc(100vh-4.5rem)] bg-slate-50 flex flex-col justify-between">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-12">
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
                placeholder="Enter Complaint ID (e.g. PTH-MUM-2026-00142)"
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

        {/* 2. SAMPLE VERIFICATION (Assign Contractor -> Contractor Repair Upload -> AI Verification -> Verification Result) */}
        <section>
          <SampleVerificationFlow
            onResolveComplaint={onResolveComplaint}
            onViewDetails={(id) => onNavigate('detail', id)}
          />
        </section>
      </main>

      {/* 4. FOOTER (Darker contrasting background: deep navy/near-black with subtle top border and white/cyan text) */}
      <footer className="w-full bg-[#0B132B] border-t border-slate-800 text-slate-300 py-8 px-4 text-center mt-12 sm:mt-16">
        <div className="max-w-3xl mx-auto space-y-2">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            RoadSetu <span className="text-cyan-400">AI</span>
          </h2>
          <p className="text-xs font-semibold text-cyan-200">
            Report it. Track it. Prove it&apos;s repaired.
          </p>
          <p className="text-xs text-slate-400 pt-3">
            © 2026 RoadSetu AI • Built for Smart Cities &amp; Urban Development
          </p>
          <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-400 pt-1">
            <span className="hover:text-cyan-300 transition-colors cursor-pointer">Privacy</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-cyan-300 transition-colors cursor-pointer">Terms</span>
            <span className="text-slate-600">•</span>
            <span className="hover:text-cyan-300 transition-colors cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
