import React, { useState } from 'react';
import { PotholeRecord, PotholeSeverity, PotholeStatus, ComplaintCluster } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { INITIAL_CLUSTERS } from '../data/seedData';
import {
  Search,
  Filter,
  AlertTriangle,
  HardHat,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  UserCheck,
  Layers,
  MapPin,
  GitMerge,
  FileCheck2,
} from 'lucide-react';

interface AuthorityDashboardProps {
  potholes?: PotholeRecord[];
  onSelectPothole: (potholeId: string) => void;
  onAssignContractor: (potholeId: string, contractorName: string, company: string) => Promise<void>;
  onNavigateToVerify: (potholeId: string) => void;
  onOpenClusterModal?: (cluster: ComplaintCluster) => void;
  onResolvePothole?: (potholeId: string) => Promise<void>;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  potholes = [],
  onSelectPothole,
  onAssignContractor,
  onNavigateToVerify,
  onOpenClusterModal,
  onResolvePothole,
}) => {
  const safePotholes = potholes || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Contractor assignment modal
  const [assignTargetPothole, setAssignTargetPothole] = useState<PotholeRecord | null>(null);
  const [contractorName, setContractorName] = useState('Ramesh Patel');
  const [contractorCompany, setContractorCompany] = useState('InfraTech RoadWorks Pvt Ltd');
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter complaints
  const filteredPotholes = safePotholes.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.potholeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = p.status === 'Reported';
    } else if (statusFilter === 'inprogress') {
      matchesStatus = p.status === 'Assigned' || p.status === 'Repair In Progress';
    } else if (statusFilter === 'repairclaimed') {
      matchesStatus = p.status === 'Repair Claimed';
    } else if (statusFilter === 'ai_verification') {
      matchesStatus = p.status === 'AI Verification' || p.status === 'Verification In Progress';
    } else if (statusFilter === 'resolved') {
      matchesStatus = p.status === 'Resolved';
    } else if (statusFilter === 'suspicious') {
      matchesStatus =
        p.status === 'Suspicious' ||
        p.status === 'Reinspection Required' ||
        p.status === 'Failed' ||
        p.verification?.verificationStatus === 'SUSPICIOUS' ||
        p.verification?.verificationStatus === 'FAILED';
    } else if (statusFilter !== 'all') {
      matchesStatus = p.status.toLowerCase() === statusFilter.toLowerCase();
    }

    const matchesSeverity =
      severityFilter === 'all' || p.severity.toLowerCase() === severityFilter.toLowerCase();

    const matchesCity =
      cityFilter === 'all' ||
      (cityFilter === 'Mumbai' && (p.potholeId.includes('MUM') || p.address.toLowerCase().includes('mumbai') || p.address.toLowerCase().includes('bandra'))) ||
      (cityFilter === 'Bengaluru' && (p.potholeId.includes('BLR') || p.address.toLowerCase().includes('bengaluru') || p.address.toLowerCase().includes('koramangala'))) ||
      (cityFilter === 'Delhi' && (p.potholeId.includes('DEL') || p.address.toLowerCase().includes('delhi'))) ||
      (cityFilter === 'Thane' && p.address.toLowerCase().includes('thane'));

    return matchesSearch && matchesStatus && matchesSeverity && matchesCity;
  });

  // 7 Explicit Stats Counters per User Requirement
  const countTotal = safePotholes.length;
  const countPending = safePotholes.filter((p) => p.status === 'Reported').length;
  const countInProgress = safePotholes.filter(
    (p) => p.status === 'Assigned' || p.status === 'Repair In Progress'
  ).length;
  const countRepairClaimed = safePotholes.filter((p) => p.status === 'Repair Claimed').length;
  const countAiVerification = safePotholes.filter(
    (p) => p.status === 'AI Verification' || p.status === 'Verification In Progress'
  ).length;
  const countResolved = safePotholes.filter((p) => p.status === 'Resolved').length;
  const countSuspicious = safePotholes.filter(
    (p) =>
      p.status === 'Suspicious' ||
      p.status === 'Reinspection Required' ||
      p.status === 'Failed' ||
      (p.verification && p.verification.verificationStatus === 'SUSPICIOUS') ||
      (p.verification && p.verification.verificationStatus === 'FAILED')
  ).length;

  const reinspectionCases = safePotholes.filter(
    (p) =>
      p.status === 'Reinspection Required' ||
      p.status === 'Suspicious' ||
      p.status === 'Failed' ||
      (p.verification && p.verification.verificationStatus === 'SUSPICIOUS') ||
      (p.verification && p.verification.verificationStatus === 'FAILED') ||
      !!p.disputeReason
  );

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetPothole) return;

    setIsAssigning(true);
    try {
      await onAssignContractor(assignTargetPothole.potholeId, contractorName, contractorCompany);
      setAssignTargetPothole(null);
    } catch (err) {
      console.error('Assign error', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const cluster42 = INITIAL_CLUSTERS[0];

  return (
    <div id="authority-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
              Municipal Corporation Admin Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Pothole Verification & Works Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Transparent complaint triage, contractor allocation, and automated AI spatial fraud detection.
          </p>
        </div>
      </div>

      {/* 7 Stats Overview Counters per User Specification */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Total</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{countTotal}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">All Reports</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Pending</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600">{countPending}</span>
          </div>
          <span className="text-[10px] text-amber-600/80 font-medium">Unassigned</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">In Progress</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-indigo-700">{countInProgress}</span>
          </div>
          <span className="text-[10px] text-indigo-500 font-medium">Assigned / Works</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Repair Claimed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-700">{countRepairClaimed}</span>
          </div>
          <span className="text-[10px] text-amber-600 font-medium">Evidence Uploaded</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">AI Verification</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-sky-700">{countAiVerification}</span>
          </div>
          <span className="text-[10px] text-sky-600 font-medium">In AI Analysis</span>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Resolved</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-700">{countResolved}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
        </div>

        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 shadow-2xs">
          <span className="text-rose-700 block text-[10px] uppercase font-bold">Suspicious</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-rose-800">{countSuspicious}</span>
          </div>
          <span className="text-[10px] text-rose-600 font-bold">Audit Flagged</span>
        </div>
      </div>

      {/* Urgent Reinspection Queue (High-Priority Alert Banner) */}
      {reinspectionCases.length > 0 && (
        <div className="mb-6 rounded-2xl border-2 border-rose-300 bg-rose-50/60 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Complaints Requiring Municipal Reinspection ({reinspectionCases.length})</span>
          </div>
          <p className="text-xs text-rose-900 mb-3 leading-relaxed">
            These cases failed spatial verification (e.g. GPS discrepancy, background landmark mismatch, or contractor gaming).
            Payment authorization is automatically blocked until field audit is conducted.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reinspectionCases.map((p) => (
              <div
                key={p.potholeId}
                className="bg-white rounded-xl border border-rose-200 p-3.5 shadow-2xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                      {p.potholeId}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600">
                      Contractor: {p.assignedContractor?.company || 'Unassigned'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium mt-1 line-clamp-1">
                    {p.address}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-1 line-clamp-2">
                    Reason: {p.disputeReason || p.verification?.explanation || 'Verification threshold failed.'}
                  </p>
                </div>
                <button
                  onClick={() => onSelectPothole(p.potholeId)}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Audit Evidence</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEDICATED POTHOLE CLUSTER VIEW SECTION (Section 10 Requirement) */}
      <div className="mb-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-5 text-white shadow-md border border-indigo-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {cluster42.clusterId}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {cluster42.reportCount} Citizen Reports Unified
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  {cluster42.severity} Severity (Aggregated)
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {cluster42.name} — {cluster42.area}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {cluster42.summary}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onOpenClusterModal && onOpenClusterModal(cluster42)}
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <GitMerge className="w-4 h-4" />
              <span>Inspect Cluster #42 & Convergence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, road, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* City Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>City:</span>
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Jurisdictions</option>
            <option value="Mumbai">Mumbai (BMC)</option>
            <option value="Bengaluru">Bengaluru (BBMP)</option>
            <option value="Delhi">New Delhi (NDMC)</option>
            <option value="Thane">Thane (TMC)</option>
          </select>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Statuses ({countTotal})</option>
            <option value="pending">Pending ({countPending})</option>
            <option value="inprogress">In Progress ({countInProgress})</option>
            <option value="repairclaimed">Repair Claimed ({countRepairClaimed})</option>
            <option value="ai_verification">AI Verification ({countAiVerification})</option>
            <option value="resolved">Resolved ({countResolved})</option>
            <option value="suspicious">Suspicious ({countSuspicious})</option>
          </select>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-2">
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Explicit 'All Complaints' Section per User Requirement */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
            <span>All Complaints</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
              {filteredPotholes.length} {filteredPotholes.length === 1 ? 'record' : 'records'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Municipal jurisdiction view across all citizen reports and contractor assignments.
          </p>
        </div>
      </div>

      {/* Main Useful Complaint Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Pothole ID</th>
                <th className="py-3 px-4">Location & Hazard</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-4">Assigned Contractor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPotholes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPotholes.map((p) => {
                  const hasRepairEvidence = !!p.afterImageUrl;
                  const isVerified = p.verification?.verificationStatus === 'VERIFIED';
                  const needsReinspect = p.status === 'Reinspection Required';

                  return (
                    <tr key={p.potholeId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Pothole ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <button
                          onClick={() => onSelectPothole(p.potholeId)}
                          className="hover:text-sky-700 underline underline-offset-2"
                        >
                          {p.potholeId}
                        </button>
                        {p.clusterId && (
                          <span className="block text-[10px] font-mono text-indigo-700 font-semibold mt-0.5">
                            Linked {p.clusterId}
                          </span>
                        )}
                      </td>

                      {/* Location & Hazard */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate" title={p.address}>
                          {p.address}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : p.severity === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : p.severity === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.severity}
                        </span>
                      </td>

                      {/* Assigned Contractor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.assignedContractor ? (
                          <div>
                            <span className="font-medium text-slate-900 block truncate max-w-[140px]">
                              {p.assignedContractor.company}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {p.assignedContractor.name}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAssignTargetPothole(p);
                              setContractorCompany('InfraTech RoadWorks Pvt Ltd');
                              setContractorName('Ramesh Patel');
                            }}
                            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign Contractor</span>
                          </button>
                        )}
                      </td>

                      {/* Current Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {p.verification ? (
                          <div>
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.verification.verificationStatus}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              {p.verification.overallVerificationScore.toFixed(1)}% confidence
                            </span>
                          </div>
                        ) : hasRepairEvidence ? (
                          <span className="text-[11px] text-sky-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Claimed - Pending AI</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No repair submitted</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        {hasRepairEvidence && (
                          <button
                            onClick={() => onNavigateToVerify(p.potholeId)}
                            className="px-2.5 py-1.5 rounded-md bg-sky-700 hover:bg-sky-800 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{p.verification ? 'Inspect Evidence' : 'Run AI'}</span>
                          </button>
                        )}

                        {!p.assignedContractor && (
                          <button
                            onClick={() => {
                              setAssignTargetPothole(p);
                              setContractorCompany('InfraTech RoadWorks Pvt Ltd');
                              setContractorName('Ramesh Patel');
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <HardHat className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        )}

                        {isVerified && onResolvePothole && (
                          <button
                            onClick={() => onResolvePothole(p.potholeId)}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}

                        <button
                          onClick={() => onSelectPothole(p.potholeId)}
                          className="px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contractor Assignment Modal */}
      {assignTargetPothole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1">
              <HardHat className="w-5 h-5 text-indigo-700" />
              <span>Assign Contractor Work Order</span>
            </div>
            <p className="text-xs text-slate-600 mb-4 font-mono">
              Pothole ID: {assignTargetPothole.potholeId} ({assignTargetPothole.severity} Severity)
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Contractor Company</label>
                <select
                  value={contractorCompany}
                  onChange={(e) => {
                    setContractorCompany(e.target.value);
                    if (e.target.value === 'InfraTech RoadWorks Pvt Ltd') setContractorName('Ramesh Patel');
                    else if (e.target.value === 'Apex Urban Roads Corp') setContractorName('Vikram Choudhury');
                    else setContractorName('Sunil Deshmukh');
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                >
                  <option value="InfraTech RoadWorks Pvt Ltd">InfraTech RoadWorks Pvt Ltd</option>
                  <option value="Apex Urban Roads Corp">Apex Urban Roads Corp</option>
                  <option value="Western Infra Concessions">Western Infra Concessions</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Site Supervisor / Engineer</label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignTargetPothole(null)}
                  className="px-3 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-xs"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
