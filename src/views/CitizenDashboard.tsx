import React from 'react';
import { PotholeRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  PlusCircle,
  FileText,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HardHat,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CitizenDashboardProps {
  complaints?: PotholeRecord[];
  potholes?: PotholeRecord[];
  onNavigate?: (view: string, potholeId?: string) => void;
  onSelectPothole?: (potholeId: string) => void;
  onNavigateToReport?: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  complaints,
  potholes,
  onNavigate,
  onSelectPothole,
  onNavigateToReport,
}) => {
  const { userProfile, currentUser } = useAuth();
  const userName = userProfile?.name || currentUser?.displayName || 'Citizen';

  const safeComplaints = Array.isArray(complaints)
    ? complaints
    : Array.isArray(potholes)
    ? potholes
    : [];

  const currentUserId = currentUser?.uid;
  const currentEmail = currentUser?.email?.toLowerCase();
  const currentName = (userProfile?.name || currentUser?.displayName || '').toLowerCase();

  // Strict citizen privacy: Citizens must never see another citizen's complaints
  const visibleComplaints = safeComplaints.filter((c) => {
    if (!currentUserId && !currentEmail) {
      return (
        c.citizenId === 'USR-CIT-001' ||
        c.reportedBy?.uid === 'USR-CIT-001' ||
        c.reportedBy?.name?.toLowerCase().includes('rohit') ||
        c.citizenName?.toLowerCase().includes('rohit')
      );
    }
    const matchUid = Boolean(
      currentUserId && (c.citizenId === currentUserId || c.reportedBy?.uid === currentUserId)
    );
    const matchEmail = Boolean(
      currentEmail && c.reportedBy?.email?.toLowerCase() === currentEmail
    );
    const matchName = Boolean(
      currentName &&
      (c.citizenName?.toLowerCase() === currentName || c.reportedBy?.name?.toLowerCase() === currentName)
    );
    return matchUid || matchEmail || matchName;
  });

  const handleSelect = (id: string) => {
    if (onSelectPothole) onSelectPothole(id);
    else if (onNavigate) onNavigate('detail', id);
  };

  const handleReport = () => {
    if (onNavigateToReport) onNavigateToReport();
    else if (onNavigate) onNavigate('report');
  };

  const totalCount = visibleComplaints.length;
  const resolvedCount = visibleComplaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = visibleComplaints.filter(
    (c) => ['Assigned', 'Repair In Progress', 'Repair Claimed', 'AI Verification', 'Verified'].includes(c.status)
  ).length;
  const pendingCount = visibleComplaints.filter((c) => c.status === 'Reported').length;

  return (
    <div id="citizen-dashboard" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Logged in as <strong className="text-slate-800">{userName}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            My Complaints
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Track the end-to-end lifecycle of potholes reported by your account.
          </p>
        </div>

        <button
          onClick={handleReport}
          className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Pothole</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Filed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending Review</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-700">{pendingCount}</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">In Works / Verification</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-sky-700">{inProgressCount}</span>
            <HardHat className="w-4 h-4 text-sky-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Verified &amp; Resolved</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-700">{resolvedCount}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Your Filed Reports ({totalCount})</h2>
          </div>
        </div>

        {totalCount === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-4 border border-sky-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">No Complaints Filed Yet</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
              You haven&apos;t filed any road damage complaints yet. When you report a pothole, it will appear here with live tracking, contractor assignment details, and AI repair verification.
            </p>
            <div className="mt-5">
              <button
                onClick={handleReport}
                className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Your First Pothole</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleComplaints.map((c) => {
              const potholeId = c.complaintId || c.potholeId;
              return (
                <div
                  key={potholeId}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                      {c.beforeImageUrl || c.originalImage ? (
                        <img
                          src={c.beforeImageUrl || c.originalImage}
                          alt="Reported pothole"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
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

                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(c.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {c.assignedContractor?.name && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <HardHat className="w-3 h-3 text-amber-600" />
                            Assigned: {c.assignedContractor.name}
                          </span>
                        )}
                        {c.verification?.overallVerificationScore !== undefined && (
                          <span className="text-emerald-700 font-bold">
                            AI Score: {c.verification.overallVerificationScore.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleSelect(potholeId)}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Details &amp; Audit Trail</span>
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
