import React from 'react';
import { PotholeStatus } from '../types';
import {
  FileText,
  UserCheck,
  HardHat,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

interface WorkflowVisualizerProps {
  currentStatus?: PotholeStatus;
  compact?: boolean;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  currentStatus,
  compact = false,
}) => {
  // Determine active step index based on status (4-step walkthrough)
  const getStepStatus = (stepIndex: number) => {
    if (!currentStatus) return 'default';
    switch (stepIndex) {
      case 1: // 01 REPORT
        return 'completed';
      case 2: // 02 ASSIGN
        if (currentStatus === 'Reported') return 'current';
        return 'completed';
      case 3: // 03 REPAIR & UPLOAD
        if (['Assigned', 'Repair In Progress'].includes(currentStatus)) return 'current';
        if (currentStatus === 'Reported') return 'upcoming';
        return 'completed';
      case 4: // 04 AI VERIFY
        if (['Repair Claimed', 'AI Verification', 'Verification In Progress'].includes(currentStatus))
          return 'current';
        if (['Reported', 'Assigned', 'Repair In Progress'].includes(currentStatus)) return 'upcoming';
        return 'completed';
      default:
        return 'default';
    }
  };

  const steps = [
    {
      num: 1,
      title: 'REPORT',
      actor: 'CITIZEN',
      desc: 'Citizen reports pothole with location, camera image, severity & complaint ID.',
      icon: FileText,
    },
    {
      num: 2,
      title: 'ASSIGN',
      actor: 'AUTHORITY',
      desc: 'Authority/Admin reviews complaint and ASSIGNS the complaint to a contractor.',
      icon: UserCheck,
    },
    {
      num: 3,
      title: 'REPAIR & UPLOAD',
      actor: 'CONTRACTOR',
      desc: 'Contractor repairs pothole at location and uploads the AFTER/repair image claim.',
      icon: UploadCloud,
    },
    {
      num: 4,
      title: 'AI VERIFY',
      actor: 'ROADSETU AI',
      desc: 'RoadSetu AI compares citizen image with contractor evidence across 7 checks.',
      icon: Sparkles,
    },
  ];

  const isOutcomeVerified = currentStatus === 'Verified' || currentStatus === 'Resolved';
  const isOutcomeSuspicious = currentStatus === 'Suspicious' || currentStatus === 'Reinspection Required';
  const isOutcomeFailed = currentStatus === 'Failed';

  return (
    <div id="repair-workflow-visualizer" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>Official Civic Repair &amp; Verification Protocol</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">
            RoadSetu AI Repair Workflow
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Verification must NOT happen immediately after comparing images. Work order assignment and contractor repair execution are mandatory.
          </p>
        </div>

        {currentStatus && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
            <span>Current State: {currentStatus}</span>
          </div>
        )}
      </div>

      {/* Sequential Pipeline Steps (01 to 04 Walkthrough) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const state = getStepStatus(s.num);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div
              key={s.num}
              className={`relative rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-200 shadow-xs'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50/70 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    STEP 0{s.num}
                  </span>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500">
                    {s.actor}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-sky-700 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                    {s.title}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {/* Arrow connector for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Downward Transition to AI Verification Checks & Outcomes */}
      <div className="my-5 flex flex-col items-center">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200">
          <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
          <span>RoadSetu AI Checks 7 Verification Signals</span>
          <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
        </div>
        <div className="mt-2 text-[11px] text-slate-500 text-center flex flex-wrap justify-center gap-x-3 gap-y-1 font-medium max-w-2xl">
          <span>• GPS / location</span>
          <span>• Pothole / damaged region</span>
          <span>• Camera viewpoint</span>
          <span>• Background / landmarks</span>
          <span>• Road surface</span>
          <span>• Timestamp</span>
          <span>• Visual repair evidence</span>
        </div>
      </div>

      {/* Outcome Branching: VERIFIED -> RESOLVED or SUSPICIOUS -> AUTHORITY REVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 🟢 REPAIR VERIFIED */}
        <div
          className={`rounded-xl border-2 p-4 transition-all ${
            isOutcomeVerified
              ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-200 shadow-sm'
              : 'border-emerald-300 bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-emerald-950">
              🟢 REPAIR VERIFIED
            </h4>
          </div>
          <p className="text-xs font-bold text-emerald-900 mb-1">
            → Same pothole appears repaired
          </p>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            GPS telemetry (≤ 15m), background fixtures, and bituminous asphalt compaction match.
          </p>
          <div className="mt-2.5 pt-2 border-t border-emerald-200 text-xs font-black text-emerald-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Complaint can then become RESOLVED</span>
          </div>
        </div>

        {/* 🟡 SUSPICIOUS REPAIR */}
        <div
          className={`rounded-xl border-2 p-4 transition-all ${
            isOutcomeSuspicious
              ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-200 shadow-sm'
              : 'border-amber-300 bg-amber-50/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-amber-950">
              🟡 SUSPICIOUS REPAIR
            </h4>
          </div>
          <p className="text-xs font-bold text-amber-900 mb-1">
            → Evidence does not sufficiently match
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Borderline GPS drift or partially occluded background landmarks. Payout held.
          </p>
          <div className="mt-2.5 pt-2 border-t border-amber-200 text-xs font-black text-amber-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>Keep complaint open for authority review</span>
          </div>
        </div>

        {/* 🔴 VERIFICATION FAILED */}
        <div
          className={`rounded-xl border-2 p-4 transition-all ${
            isOutcomeFailed
              ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-200 shadow-sm'
              : 'border-rose-300 bg-rose-50/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-rose-950">
              🔴 VERIFICATION FAILED
            </h4>
          </div>
          <p className="text-xs font-bold text-rose-900 mb-1">
            → Invalid / unrelated evidence
          </p>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            Severe coordinate delta (&gt; 15m) or completely mismatched roadway structures detected.
          </p>
          <div className="mt-2.5 pt-2 border-t border-rose-200 text-xs font-black text-rose-950 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span>Do NOT mark as resolved</span>
          </div>
        </div>
      </div>

      {/* Critical Rule Notice */}
      <div className="mt-5 p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
          <span className="font-semibold text-slate-200">
            <strong>Mandatory Constraint:</strong> Uploading or comparing images must <strong>NEVER</strong> automatically make the complaint &quot;RESOLVED&quot;.
            The status should only become RESOLVED after successful AI verification.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700 whitespace-nowrap">
          RoadSetu AI Guardrail
        </span>
      </div>
    </div>
  );
};
