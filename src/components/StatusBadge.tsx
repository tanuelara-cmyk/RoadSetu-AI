import React from 'react';
import { PotholeStatus } from '../types';
import { CheckCircle2, AlertTriangle, Clock, HardHat, FileSearch, ShieldCheck } from 'lucide-react';

interface StatusBadgeProps {
  status: PotholeStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = Clock;

  switch (status) {
    case 'Reported':
      bg = 'bg-amber-50 text-amber-800 border-amber-300';
      Icon = Clock;
      break;
    case 'Assigned':
      bg = 'bg-blue-50 text-blue-800 border-blue-300';
      Icon = HardHat;
      break;
    case 'Repair In Progress':
      bg = 'bg-indigo-50 text-indigo-800 border-indigo-300';
      Icon = HardHat;
      break;
    case 'Repair Claimed':
      bg = 'bg-purple-50 text-purple-800 border-purple-300';
      Icon = FileSearch;
      break;
    case 'Verification In Progress':
      bg = 'bg-sky-50 text-sky-800 border-sky-300 animate-pulse';
      Icon = FileSearch;
      break;
    case 'Verified':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-semibold';
      Icon = ShieldCheck;
      break;
    case 'Resolved':
      bg = 'bg-emerald-100 text-emerald-900 border-emerald-500 font-bold';
      Icon = CheckCircle2;
      break;
    case 'Suspicious':
      bg = 'bg-amber-100 text-amber-900 border-amber-400 font-semibold';
      Icon = AlertTriangle;
      break;
    case 'Failed':
      bg = 'bg-rose-100 text-rose-900 border-rose-500 font-bold';
      Icon = AlertTriangle;
      break;
    case 'Reinspection Required':
      bg = 'bg-rose-50 text-rose-800 border-rose-400 font-semibold';
      Icon = AlertTriangle;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} whitespace-nowrap`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
