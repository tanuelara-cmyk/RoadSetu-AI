import React from 'react';
import { PotholeRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  HardHat,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Play,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ContractorDashboardProps {
  complaints?: PotholeRecord[];
  potholes?: PotholeRecord[];
  onNavigate?: (view: string, potholeId?: string) => void;
  onSelectPothole?: (potholeId: string) => void;
  onStartRepair?: (potholeId: string) => Promise<void> | void;
  onNavigateToClaim?: (potholeId: string) => void;
  onNavigateToVerify?: (potholeId: string) => void;
}

export const ContractorDashboard: React.FC<ContractorDashboardProps> = ({
  complaints,
  potholes,
  onNavigate,
  onSelectPothole,
  onStartRepair,
  onNavigateToClaim,
  onNavigateToVerify,
}) => {
  const { userProfile, currentUser } = useAuth();
  const contractorName = userProfile?.name || currentUser?.displayName || 'Contractor';
  const companyName = userProfile?.agencyOrCompany || 'Civil Infrastructure Works';

  const safeComplaints = Array.isArray(complaints)
    ? complaints
    : Array.isArray(potholes)
    ? potholes
    : [];

  const handleSelect = (id: string) => {
    if (onSelectPothole) onSelectPothole(id);
    else if (onNavigate) onNavigate('detail', id);
  };

  const handleClaim = (id: string) => {
    if (onNavigateToClaim) onNavigateToClaim(id);
    else if (onNavigate) onNavigate('contractor-claim', id);
  };

  const handleVerify = (id: string) => {
    if (onNavigateToVerify) onNavigateToVerify(id);
    else if (onNavigate) onNavigate('verify', id);
  };

  const totalAssigned = safeComplaints.length;
  const newAssignments = safeComplaints.filter((c) => c.status === 'Assigned').length;
  const inProgress = safeComplaints.filter((c) => c.status === 'Repair In Progress').length;
  const claimedOrVerifying = safeComplaints.filter(
    (c) => ['Repair Claimed', 'AI Verification', 'Verification In Progress'].includes(c.status)
  ).length;
  const verifiedOrResolved = safeComplaints.filter(
    (c) => ['Verified', 'Resolved'].includes(c.status)
  ).length;

  return (
    <div id="contractor-dashboard" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Contractor Work Orders
            </span>
            <span className="text-xs text-slate-500 font-medium">
              <strong className="text-slate-800">{contractorName}</strong> ({companyName})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Assigned Road Work Orders
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Access work orders assigned to your firm, update repair progress, and lodge photographic completion claims.
          </p>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Work Orders</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{totalAssigned}</span>
            <HardHat className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">New Assigned (Action Needed)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-700">{newAssignments}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Repairs In Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-sky-700">{inProgress}</span>
            <span className="text-[10px] text-sky-600 font-semibold">Active Crews</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">AI Verified / Resolved</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-700">{verifiedOrResolved}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Complaints Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Assigned Complaints ({totalAssigned})</h2>
          </div>
        </div>

        {totalAssigned === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <HardHat className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Assigned Work Orders</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
              No pothole complaints are currently assigned to your contractor account. When the Municipal Authority allocates work orders, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {safeComplaints.map((c) => {
              const potholeId = c.complaintId || c.potholeId;
              return (
                <div
                  key={potholeId}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Before & After Thumbnails */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                        {c.beforeImageUrl || c.originalImage ? (
                          <img
                            src={c.beforeImageUrl || c.originalImage}
                            alt="Original pothole"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[9px] font-bold text-white text-center py-0.5">
                          BEFORE
                        </span>
                      </div>

                      {c.afterImageUrl || c.repairImage ? (
                        <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-emerald-300 relative">
                          <img
                            src={c.afterImageUrl || c.repairImage}
                            alt="Repair evidence"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-800/90 text-[9px] font-bold text-white text-center py-0.5">
                            AFTER
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xs text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {potholeId}
                        </span>
                        <StatusBadge status={c.status} />
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            c.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : c.severity === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.severity} Severity
                        </span>
                      </div>

                      <p className="text-xs text-slate-900 font-semibold line-clamp-1">
                        {c.address || c.location || 'Reported civic road section'}
                      </p>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {c.description}
                      </p>

                      {c.landmark && (
                        <p className="text-[11px] text-sky-800 font-medium mt-1">
                          Landmark: {c.landmark}
                        </p>
                      )}

                      {c.verification?.verificationStatus && (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              c.verification.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.verification.verificationStatus === 'SUSPICIOUS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            AI Result: {c.verification.verificationStatus} (
                            {c.verification.overallVerificationScore.toFixed(0)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contractor Workflow Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {c.status === 'Assigned' && onStartRepair && (
                      <button
                        onClick={() => onStartRepair(potholeId)}
                        className="px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Repair</span>
                      </button>
                    )}

                    {(c.status === 'Assigned' || c.status === 'Repair In Progress') && (
                      <button
                        onClick={() => handleClaim(potholeId)}
                        className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload After Photo</span>
                      </button>
                    )}

                    {['Repair Claimed', 'AI Verification', 'Verification In Progress'].includes(
                      c.status
                    ) && (
                      <button
                        onClick={() => handleVerify(potholeId)}
                        className="px-3.5 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Verification</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleSelect(potholeId)}
                      className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
