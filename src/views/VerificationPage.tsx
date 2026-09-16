import React, { useState } from 'react';
import { PotholeRecord, VerificationResult } from '../types';
import { VerificationScorecard } from '../components/VerificationScorecard';
import { EvidenceMap } from '../components/EvidenceMap';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { SampleVerificationFlow } from '../components/SampleVerificationFlow';
import { formatCoordinates, formatDistance, calculateDistanceMeters } from '../utils/geo';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  HardHat,
  UserCheck,
  PlayCircle,
} from 'lucide-react';

interface VerificationPageProps {
  pothole: PotholeRecord;
  onBack: () => void;
  onRunVerification: (potholeId: string) => Promise<VerificationResult>;
  onSelectScenario: (scenarioId: string) => void;
  onResolveComplaint?: (potholeId: string) => Promise<void> | void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  pothole,
  onBack,
  onRunVerification,
  onSelectScenario,
  onResolveComplaint,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(pothole.status === 'Resolved');
  const [showStepByStepWalkthrough, setShowStepByStepWalkthrough] = useState(false);
  const [verification, setVerification] = useState<VerificationResult | null>(
    pothole.verification || null
  );

  const hasAfter = !!pothole.afterImageUrl;

  const distance =
    hasAfter && pothole.afterLatitude && pothole.afterLongitude
      ? calculateDistanceMeters(
          pothole.latitude,
          pothole.longitude,
          pothole.afterLatitude,
          pothole.afterLongitude
        )
      : 0;

  const handleVerify = async () => {
    setError(null);
    setIsRunning(true);
    try {
      const result = await onRunVerification(pothole.potholeId);
      setVerification(result);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResolve = async () => {
    if (!onResolveComplaint) return;
    try {
      await onResolveComplaint(pothole.potholeId);
      setIsResolved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resolve complaint.');
    }
  };

  return (
    <div id="ai-verification-page" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaint Details</span>
        </button>

        {/* Quick Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sample Scenarios:
          </span>
          <button
            onClick={() => {
              setShowStepByStepWalkthrough(true);
              onSelectScenario('demo-genuine');
            }}
            className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
              pothole.potholeId === 'PTH-MUM-2026-00142' && showStepByStepWalkthrough
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            1. Genuine Repair
          </button>
          <button
            onClick={() => {
              setShowStepByStepWalkthrough(true);
              onSelectScenario('demo-gaming');
            }}
            className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
              pothole.potholeId === 'PTH-BLR-2026-00088' && showStepByStepWalkthrough
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            2. Gaming Attempt
          </button>

          <button
            onClick={() => setShowStepByStepWalkthrough(!showStepByStepWalkthrough)}
            className={`text-xs px-3 py-1 rounded-md font-bold border transition-all flex items-center gap-1.5 ${
              showStepByStepWalkthrough
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{showStepByStepWalkthrough ? 'Hide 4-Step Walkthrough' : 'Show 4-Step Walkthrough'}</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL WORKFLOW PIPELINE */}
      <WorkflowVisualizer currentStatus={pothole.status} />

      {/* 2. INTERACTIVE SAMPLE VERIFICATION WALKTHROUGH (Assign Contractor -> Contractor Upload -> AI Verification -> Result) */}
      {showStepByStepWalkthrough && (
        <SampleVerificationFlow
          onResolveComplaint={onResolveComplaint}
          onViewDetails={onBack}
        />
      )}

      {/* 3. CASE AUDIT HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Multi-Factor AI Spatial Verification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Audit Comparison &amp; Fraud Detection
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Case <span className="font-mono font-bold text-slate-900">{pothole.potholeId}</span>:
              Evaluating whether the submitted after-repair photo represents the exact same pothole and location reported by the citizen.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {hasAfter && (
              <button
                onClick={handleVerify}
                disabled={isRunning}
                className="px-5 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Spatial Vectors...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-300" />
                    <span>{verification ? 'Re-Run AI Verification' : 'Execute AI Verification'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 4. VERIFICATION RESULT BANNER (EXACT THREE OUTCOMES) */}
      {verification && (
        <div className="space-y-4">
          {verification.verificationStatus === 'VERIFIED' ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-emerald-950">
                      🟢 REPAIR VERIFIED
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                      {verification.overallVerificationScore.toFixed(1)}% Match
                    </span>
                  </div>
                  <p className="text-xs font-bold text-emerald-900 mt-1">
                    → Same pothole appears repaired.
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {verification.explanation}
                  </p>
                  <p className="text-xs font-extrabold text-emerald-950 mt-1.5">
                    → Complaint can then become RESOLVED.
                  </p>
                </div>
              </div>

              {/* Action to officially mark as RESOLVED */}
              <div className="shrink-0 sm:text-right">
                {isResolved || pothole.status === 'Resolved' ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Status: RESOLVED</span>
                  </div>
                ) : (
                  <button
                    onClick={handleResolve}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Complaint as RESOLVED</span>
                  </button>
                )}
              </div>
            </div>
          ) : verification.verificationStatus === 'SUSPICIOUS' ? (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-500 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-amber-950">
                    🟡 SUSPICIOUS REPAIR
                  </span>
                  <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                    Low / Borderline Match
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-950 mt-1">
                  → Evidence does not sufficiently match.
                </p>
                <p className="text-xs text-amber-900 mt-0.5">
                  {verification.explanation}
                </p>
                <p className="text-xs font-extrabold text-amber-950 mt-1.5">
                  → Keep complaint open for authority review.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-rose-950">
                    🔴 VERIFICATION FAILED
                  </span>
                  <span className="text-xs font-bold text-rose-900 bg-rose-200 px-2.5 py-0.5 rounded-full">
                    Invalid Evidence
                  </span>
                </div>
                <p className="text-xs font-bold text-rose-950 mt-1">
                  → Invalid / unrelated evidence detected.
                </p>
                <p className="text-xs text-rose-900 mt-0.5">
                  {verification.explanation}
                </p>
                <p className="text-xs font-extrabold text-rose-950 mt-1.5">
                  → Do NOT mark as resolved. Payout blocked.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SIDE-BY-SIDE PHOTOGRAPHIC COMPARISON */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-700" />
            <span>Side-by-Side Visual Comparison</span>
          </h3>
          <span className="text-xs text-slate-500">
            Spatial delta: <strong>{formatDistance(distance)}</strong> (Tolerance threshold: ≤ 15.0m)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo Card */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
            <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
              <span className="text-sky-300">BEFORE: Citizen Original Report</span>
              <span className="text-[10px] bg-sky-950 text-sky-200 px-2 py-0.5 rounded border border-sky-800">
                Baseline Evidence
              </span>
            </div>

            <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center">
              <img
                src={pothole.beforeImageUrl}
                alt="Before evidence"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-[10px] text-white font-mono backdrop-blur-xs">
                {formatCoordinates(pothole.latitude, pothole.longitude)}
              </div>
            </div>

            <div className="p-3.5 bg-white text-xs border-t border-slate-200 space-y-1">
              <p className="font-semibold text-slate-900">
                Reported by: {pothole.reportedBy.name} ({pothole.severity} Severity)
              </p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                "{pothole.description}"
              </p>
              {pothole.landmark && (
                <div className="mt-1 p-1.5 bg-sky-50 rounded border border-sky-100 text-[11px] text-sky-900">
                  <strong>Landmark:</strong> {pothole.landmark}
                </div>
              )}
            </div>
          </div>

          {/* After Photo Card */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between">
            <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
              <span className="text-emerald-300">AFTER: Contractor Submitted Evidence</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Verification Subject
              </span>
            </div>

            <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center">
              {hasAfter ? (
                <>
                  <img
                    src={pothole.afterImageUrl}
                    alt="After repair evidence"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-[10px] text-white font-mono backdrop-blur-xs">
                    {formatCoordinates(pothole.afterLatitude!, pothole.afterLongitude!)}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No repair evidence submitted yet.
                </div>
              )}
            </div>

            {hasAfter ? (
              <div className="p-3.5 bg-white text-xs border-t border-slate-200 space-y-1">
                <p className="font-semibold text-slate-900">
                  Contractor: {pothole.assignedContractor?.company || 'Contractor'}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  "{pothole.repairDescription || 'Repair claim submitted.'}"
                </p>
                {pothole.materialsUsed && (
                  <div className="mt-1 p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                    <strong>Materials:</strong> {pothole.materialsUsed}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-white text-xs text-slate-500 italic">
                Awaiting contractor repair submission
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. VERIFICATION SCORECARD */}
      {verification && (
        <VerificationScorecard result={verification} />
      )}

      {/* 7. GEOSPATIAL PROXIMITY AUDIT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-700" />
          <span>Geospatial Proximity Audit</span>
        </h3>
        <EvidenceMap
          originalLat={pothole.latitude}
          originalLon={pothole.longitude}
          afterLat={pothole.afterLatitude}
          afterLon={pothole.afterLongitude}
          originalAddress={pothole.address}
          afterAddress={pothole.afterAddress}
          height="h-80"
        />
      </div>
    </div>
  );
};
