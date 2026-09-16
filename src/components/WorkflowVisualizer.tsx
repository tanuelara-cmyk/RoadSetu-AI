import React from 'react';
import { PotholeStatus } from '../types';
import {
  FileText,
  UserCheck,
  HardHat,
  UploadCloud,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface WorkflowVisualizerProps {
  currentStatus?: PotholeStatus;
  compact?: boolean;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  currentStatus,
  compact = false,
}) => {
  // Determine active step index based on status
  const getStepStatus = (stepIndex: number) => {
    if (!currentStatus) return 'default';
    switch (stepIndex) {
      case 1: // REPORTED
        return 'completed';
      case 2: // ASSIGNED
        if (currentStatus === 'Reported') return 'current';
        return 'completed';
      case 3: // REPAIR IN PROGRESS
        if (currentStatus === 'Assigned') return 'current';
        if (currentStatus === 'Reported') return 'upcoming';
        return 'completed';
      case 4: // REPAIR CLAIMED
        if (currentStatus === 'Repair In Progress') return 'current';
        if (['Reported', 'Assigned'].includes(currentStatus)) return 'upcoming';
        return 'completed';
      case 5: // AI VERIFICATION
        if (['Repair Claimed', 'Verification In Progress'].includes(currentStatus)) return 'current';
        if (['Reported', 'Assigned', 'Repair In Progress'].includes(currentStatus)) return 'upcoming';
        return 'completed';
      default:
        return 'default';
    }
  };

  const steps = [
    {
      num: 1,
      title: 'REPORTED',
      actor: 'CITIZEN',
      desc: 'Citizen captures pothole with live camera photo, GPS coordinates, and severity level.',
      icon: FileText,
      accent: 'amber',
    },
    {
      num: 2,
      title: 'ASSIGNED TO CONTRACTOR',
      actor: 'AUTHORITY',
      desc: 'Municipal admin reviews complaint and officially assigns work order to verified contractor.',
      icon: UserCheck,
      accent: 'blue',
    },
    {
      num: 3,
      title: 'REPAIR IN PROGRESS',
      actor: 'CONTRACTOR',
      desc: 'Assigned contractor arrives at exact location, excavates cavity, and rolls hot-mix asphalt.',
      icon: HardHat,
      accent: 'indigo',
    },
    {
      num: 4,
      title: 'REPAIR CLAIMED',
      actor: 'CONTRACTOR',
      desc: 'Contractor uploads AFTER repair photo & device GPS telemetry. Status is NOT resolved yet.',
      icon: UploadCloud,
      accent: 'purple',
    },
    {
      num: 5,
      title: 'AI VERIFICATION',
      actor: 'RoadSetu AI',
      desc: 'RoadSetu AI compares original vs repair evidence across 7 spatial & computer vision signals.',
      icon: Sparkles,
      accent: 'sky',
    },
  ];

  return (
    <div id="repair-workflow-visualizer" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-950">
            RoadSetu AI Repair &amp; Verification Workflow
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Strict sequential enforcement: Uploading or comparing images never automatically makes a complaint resolved.
          </p>
        </div>

        {currentStatus && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
            <span>Current State: {currentStatus}</span>
          </div>
        )}
      </div>

      {/* Sequential Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
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
                  ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-200 shadow-sm'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 bg-slate-50/60 opacity-85'
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
    </div>
  );
};
