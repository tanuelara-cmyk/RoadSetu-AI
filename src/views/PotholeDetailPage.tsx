import React, { useState } from 'react';
import { PotholeRecord, ActivityEvent, UserRole } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { EvidenceMap } from '../components/EvidenceMap';
import { VerificationScorecard } from '../components/VerificationScorecard';
import { WorkflowVisualizer } from '../components/WorkflowVisualizer';
import { formatCoordinates, formatDistance } from '../utils/geo';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  HardHat,
  Sparkles,
  Camera,
  ExternalLink,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface PotholeDetailPageProps {
  pothole: PotholeRecord;
  events: ActivityEvent[];
  currentRole: UserRole;
  onBack: () => void;
  onNavigateToVerify: (potholeId: string) => void;
  onNavigateToClaim: (potholeId: string) => void;
  onDisputeSubmitted: (potholeId: string, reason: string) => Promise<void>;
  onResolvePothole: (potholeId: string) => Promise<void>;
}

export const PotholeDetailPage: React.FC<PotholeDetailPageProps> = ({
  pothole,
  events,
  currentRole,
  onBack,
  onNavigateToVerify,
  onNavigateToClaim,
  onDisputeSubmitted,
  onResolvePothole,
}) => {
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const hasAfter = !!pothole.afterImageUrl;
  const hasVerification = !!pothole.verification;

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      await onDisputeSubmitted(pothole.potholeId, disputeReason.trim());
      setDisputeSuccess(true);
      setShowDisputeModal(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleResolve = async () => {
    setResolveError(null);
    setIsResolving(true);
    try {
      await onResolvePothole(pothole.potholeId);
    } catch (err: any) {
      setResolveError(err.message || 'Resolution failed');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div id="pothole-detail-page" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* If contractor: button to submit repair claim */}
          {pothole.status !== 'Verified' && (
            <button
              onClick={() => onNavigateToClaim(pothole.potholeId)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>{hasAfter ? 'Update Repair Evidence' : 'Submit Repair Evidence'}</span>
            </button>
          )}

          {/* AI Verification Button */}
          {hasAfter && (
            <button
              onClick={() => onNavigateToVerify(pothole.potholeId)}
              className="px-4 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>{hasVerification ? 'View Full AI Verification' : 'Run AI Verification'}</span>
            </button>
          )}

          {/* Authority Resolve Button (Only enabled if verified!) */}
          {currentRole === 'authority' && pothole.status === 'Verified' && (
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Complaint as RESOLVED</span>
            </button>
          )}

          {pothole.status === 'Resolved' && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Status: RESOLVED</span>
            </div>
          )}

          {/* Citizen Dispute Button */}
          {hasAfter && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              <span>Raise Repair Dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Workflow Pipeline */}
      <div className="mb-6">
        <WorkflowVisualizer currentStatus={pothole.status} />
      </div>

      {resolveError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{resolveError}</span>
        </div>
      )}

      {disputeSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            Citizen dispute successfully logged into the public audit trail and escalated for municipal reinspection.
          </span>
        </div>
      )}

      {/* Main Header Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Civic Digital Identity
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Severity: <strong>{pothole.severity}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono mt-1">
              {pothole.potholeId}
            </h1>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span>{pothole.address}</span>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <span className="text-[11px] text-slate-500 mb-1 font-medium">Lifecycle Status</span>
            <StatusBadge status={pothole.status} size="lg" />
          </div>
        </div>

        {/* Workflow Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Reported By:</span>
            <p className="font-semibold text-slate-900 mt-0.5">{pothole.reportedBy.name}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {new Date(pothole.beforeTimestamp).toLocaleDateString()}
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Assigned Authority:</span>
            <p className="font-semibold text-slate-900 mt-0.5">
              {pothole.assignedAuthority?.name || 'Pending Municipal Assignment'}
            </p>
            <p className="text-[11px] text-slate-500">
              {pothole.assignedAuthority?.department || 'Roads Infrastructure Dept'}
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-medium">Assigned Contractor:</span>
            <p className="font-semibold text-slate-900 mt-0.5">
              {pothole.assignedContractor?.company || 'Contractor Pending'}
            </p>
            <p className="text-[11px] text-slate-500">
              {pothole.assignedContractor?.name || '—'}
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-medium">AI Verification Status:</span>
            <p className="font-semibold text-slate-900 mt-0.5">
              {pothole.verification?.verificationStatus || 'Awaiting Repair Submission'}
            </p>
            {pothole.verification && (
              <p className="text-[11px] text-emerald-700 font-bold">
                Confidence: {pothole.verification.overallVerificationScore}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Photographic Evidence (The Heart of RoadSetu) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-700" />
            <span>Photographic Evidence Trail</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Immutable Citizen Evidence vs. Contractor Claim
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before Photo (Citizen - Immutable) */}
          <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <div className="bg-slate-900 text-white px-3 py-2 text-xs flex items-center justify-between font-semibold">
              <span className="text-sky-300">BEFORE: Original Citizen Evidence</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                IMMUTABLE
              </span>
            </div>
            <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center">
              <img
                src={pothole.beforeImageUrl}
                alt="Before pothole evidence"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-3 bg-white text-xs border-t border-slate-200 space-y-1">
              <p className="text-slate-900 font-medium">"{pothole.description}"</p>
              {pothole.landmark && (
                <p className="text-[11px] text-slate-600">
                  <strong>Key Landmark:</strong> {pothole.landmark}
                </p>
              )}
              <div className="pt-1 text-[11px] font-semibold text-emerald-700">
                ✓ Citizen Geolocation Locked &amp; Telemetry Audited
              </div>
            </div>
          </div>

          {/* After Photo (Contractor Claim) */}
          <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <div className="bg-slate-900 text-white px-3 py-2 text-xs flex items-center justify-between font-semibold">
              <span className="text-emerald-300">AFTER: Contractor Repair Claim</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {hasAfter ? 'SUBMITTED' : 'PENDING'}
              </span>
            </div>
            <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center">
              {hasAfter ? (
                <img
                  src={pothole.afterImageUrl}
                  alt="After repair evidence"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs flex flex-col items-center">
                  <Clock className="w-8 h-8 mb-2 text-slate-500" />
                  <p className="font-semibold text-slate-300">No Repair Photo Submitted Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Contractor must capture live after-repair photo with locked GPS coordinates.
                  </p>
                  <button
                    onClick={() => onNavigateToClaim(pothole.potholeId)}
                    className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold"
                  >
                    Submit as Contractor
                  </button>
                </div>
              )}
            </div>
            {hasAfter && (
              <div className="p-3 bg-white text-xs border-t border-slate-200 space-y-1">
                <p className="text-slate-900 font-medium">
                  "{pothole.repairDescription || 'Repair claim submitted.'}"
                </p>
                {pothole.materialsUsed && (
                  <p className="text-[11px] text-slate-600">
                    <strong>Materials:</strong> {pothole.materialsUsed}
                  </p>
                )}
                <div className="pt-1 text-[11px] font-semibold text-emerald-700">
                  ✓ Contractor Geotag Audited &amp; Spatial Delta Verified
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Verification Scorecard Section (If verification run) */}
      {pothole.verification && (
        <div className="mb-6">
          <VerificationScorecard result={pothole.verification} />
        </div>
      )}

      {/* Geospatial Map & Civic Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spatial Evidence Map */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-700" />
            <span>Geospatial Evidence Verification</span>
          </h3>
          <EvidenceMap
            originalLat={pothole.latitude}
            originalLon={pothole.longitude}
            afterLat={pothole.afterLatitude}
            afterLon={pothole.afterLongitude}
            originalAddress={pothole.address}
            afterAddress={pothole.afterAddress}
            height="h-72"
          />
        </div>

        {/* Immutable Activity Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-700" />
            <span>Immutable Civic Activity Audit Trail</span>
          </h3>
          <ActivityTimeline events={events} />
        </div>
      </div>

      {/* Citizen Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base mb-2">
              <MessageSquareWarning className="w-5 h-5" />
              <span>Raise Citizen Repair Dispute</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              If the pothole was not properly repaired, or if work was substandard, describe the issue below.
              This will add an immutable event to the public audit trail and flag the case for municipal reinspection.
            </p>

            <form onSubmit={handleDisputeSubmit}>
              <textarea
                required
                rows={4}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe why you are disputing this repair (e.g., asphalt patch has cracked open after rain, or wrong section repaired)..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute || !disputeReason.trim()}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  {isSubmittingDispute ? 'Submitting Dispute...' : 'Escalate to Authority'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
