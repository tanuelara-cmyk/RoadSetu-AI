import React from 'react';
import { ActivityEvent } from '../types';
import { Clock, CheckCircle, AlertTriangle, ShieldCheck, HardHat, FileText, HelpCircle } from 'lucide-react';

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventMeta = (type: ActivityEvent['eventType']) => {
    switch (type) {
      case 'REPORTED':
        return {
          icon: FileText,
          color: 'text-sky-700 bg-sky-100 border-sky-300',
          title: 'Citizen Report Filed',
        };
      case 'ASSIGNED':
        return {
          icon: HardHat,
          color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
          title: 'Contractor Assigned',
        };
      case 'REPAIR_STARTED':
        return {
          icon: Clock,
          color: 'text-amber-700 bg-amber-100 border-amber-300',
          title: 'Repair In Progress',
        };
      case 'REPAIR_CLAIMED':
        return {
          icon: CheckCircle,
          color: 'text-purple-700 bg-purple-100 border-purple-300',
          title: 'Repair Evidence Claimed',
        };
      case 'VERIFICATION_STARTED':
        return {
          icon: Clock,
          color: 'text-blue-700 bg-blue-100 border-blue-300',
          title: 'AI Verification Initiated',
        };
      case 'VERIFIED':
        return {
          icon: ShieldCheck,
          color: 'text-emerald-700 bg-emerald-100 border-emerald-400',
          title: 'AI Multi-Factor Verified',
        };
      case 'REINSPECTION_REQUESTED':
        return {
          icon: AlertTriangle,
          color: 'text-rose-700 bg-rose-100 border-rose-400',
          title: 'Reinspection Required',
        };
      case 'DISPUTE_RAISED':
        return {
          icon: AlertTriangle,
          color: 'text-orange-700 bg-orange-100 border-orange-400',
          title: 'Citizen Dispute Raised',
        };
      case 'RESOLVED':
        return {
          icon: ShieldCheck,
          color: 'text-teal-700 bg-teal-100 border-teal-400',
          title: 'Case Officially Closed',
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-slate-700 bg-slate-100 border-slate-300',
          title: 'Status Update',
        };
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div id="activity-timeline" className="flow-root">
      <ul className="-mb-8">
        {sortedEvents.map((evt, idx) => {
          const meta = getEventMeta(evt.eventType);
          const Icon = meta.icon;
          const isLast = idx === sortedEvents.length - 1;

          return (
            <li key={evt.eventId || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className={`relative px-1 py-1 flex items-center justify-center rounded-full border ${meta.color} p-1.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-slate-900">{meta.title}</p>
                      <time className="text-[11px] text-slate-500 font-mono">
                        {formatTime(evt.timestamp)}
                      </time>
                    </div>
                    <p className="mt-1 text-xs text-slate-700 leading-relaxed">{evt.description}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">By:</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {evt.performedBy.name} ({evt.performedBy.role})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
