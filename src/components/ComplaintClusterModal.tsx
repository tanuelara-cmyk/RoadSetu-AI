import React from 'react';
import { ComplaintCluster, PotholeRecord } from '../types';
import { Layers, X, Users, MapPin, AlertTriangle, ShieldCheck, ArrowRight, CheckCircle2, GitMerge } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface ComplaintClusterModalProps {
  cluster: ComplaintCluster | null;
  potholes?: PotholeRecord[];
  onClose: () => void;
  onSelectPothole?: (potholeId: string) => void;
  onViewPothole?: (potholeId: string) => void;
}

export const ComplaintClusterModal: React.FC<ComplaintClusterModalProps> = ({
  cluster,
  potholes = [],
  onClose,
  onSelectPothole,
  onViewPothole,
}) => {
  if (!cluster) return null;

  const handleSelect = (id: string) => {
    if (onSelectPothole) onSelectPothole(id);
    if (onViewPothole) onViewPothole(id);
  };

  // Safe linked records resolution
  const safePotholes = potholes || [];
  const linkedIds = cluster.linkedPotholeIds || [];
  const linkedRecords = safePotholes.filter((p) =>
    linkedIds.includes(p.potholeId)
  );

  return (
    <div
      id="complaint-cluster-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 my-8 text-slate-900 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {cluster.clusterId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{cluster.severity} Severity (Aggregated)</span>
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-950 mt-1">
                {cluster.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{cluster.area}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Civic Intelligence Context Banner */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-start gap-3">
            <GitMerge className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Multi-Citizen Deduplication & Priority Boosting
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {cluster.summary}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-700 font-medium">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Prevents duplicate contractor payouts</span>
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  <Users className="w-3.5 h-3.5" />
                  <span>{cluster.reportCount} Independent Citizens Unified</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Graph / Architecture Representation */}
        <div className="mb-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 mb-3 flex items-center gap-2">
            <span>Evidence Convergence Diagram</span>
            <span className="text-[10px] font-normal text-slate-500 font-mono">(3 Reports → 1 Unified Defect)</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {linkedRecords.map((p, idx) => (
              <div
                key={p.potholeId}
                className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs relative group hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span className="font-mono text-indigo-700">{p.potholeId}</span>
                  <span className="text-slate-400">Citizen #{idx + 1}</span>
                </div>
                <p className="text-xs font-semibold text-slate-900">{p.reportedBy.name}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  "{p.description}"
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <StatusBadge status={p.status} />
                  <button
                    onClick={() => {
                      onClose();
                      handleSelect(p.potholeId);
                    }}
                    className="font-bold text-indigo-700 hover:text-indigo-950 inline-flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Convergence arrow */}
          <div className="mt-4 pt-3 border-t border-indigo-200/60 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-700 text-white text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
              <span>Single Municipal Work Order Dispatched & Verified</span>
            </div>
          </div>
        </div>

        {/* Linked Reports Table */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Linked Citizen Reports ({linkedRecords.length})
          </h4>
          <div className="space-y-2">
            {linkedRecords.map((p) => (
              <div
                key={p.potholeId}
                className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={p.beforeImageUrl}
                      alt={p.potholeId}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {p.potholeId}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        by {p.reportedBy.name}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      handleSelect(p.potholeId);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <span>Inspect Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Close Cluster View
          </button>
        </div>
      </div>
    </div>
  );
};
