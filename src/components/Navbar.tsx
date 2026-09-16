import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, HardHat, User, Search, PlusCircle, LayoutDashboard, Check } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onSelectScenario?: (scenarioId: string) => void;
  onResetDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeView,
  setActiveView,
  onSelectScenario,
  onResetDemo,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'citizen', label: 'Citizen', icon: User, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    { role: 'authority', label: 'Municipal Authority', icon: ShieldCheck, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { role: 'contractor', label: 'Contractor', icon: HardHat, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  const currentRoleObj = roles.find((r) => r.role === currentRole) || roles[0];
  const RoleIcon = currentRoleObj.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      {/* Top Civic Banner */}
      <div className="bg-slate-900 text-slate-200 text-[11px] px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-slate-300">
            RoadSetu AI Civic Infrastructure Platform
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400 italic">
            “Report it. Track it. Prove it’s repaired.”
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Identity */}
        <button
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-800 to-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-900/10">
            <ShieldCheck className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-sky-800 transition-colors">
                RoadSetu <span className="text-sky-700">AI</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                Civic Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Anti-Fraud Pothole Evidence Tracking
            </p>
          </div>
        </button>

        {/* Primary View Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-700">
          <button
            onClick={() => setActiveView('landing')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              activeView === 'landing' ? 'text-sky-900 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveView('report')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeView === 'report' ? 'text-sky-900 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>Report Pothole</span>
          </button>
          <button
            onClick={() => setActiveView('track')}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeView === 'track' ? 'text-sky-900 bg-sky-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Track Complaint</span>
          </button>
          <button
            onClick={() => {
              onRoleChange('authority');
              setActiveView('authority');
            }}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeView === 'authority' ? 'text-indigo-900 bg-indigo-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Authority Portal</span>
          </button>
        </nav>

        {/* Right Section: Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
              }}
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${currentRoleObj.color}`}
            >
              <RoleIcon className="w-3.5 h-3.5 shrink-0" />
              <div className="text-left leading-tight hidden md:block">
                <span className="text-[9px] block text-slate-500 font-normal">Active Role</span>
                <span>{currentRoleObj.label}</span>
              </div>
              <span className="md:hidden">{currentRoleObj.label}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                  Switch User Perspective
                </div>
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.role === currentRole;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setShowRoleMenu(false);
                        if (r.role === 'authority') setActiveView('authority');
                        if (r.role === 'contractor') setActiveView('authority');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-slate-100 font-bold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span>{r.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-700" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
