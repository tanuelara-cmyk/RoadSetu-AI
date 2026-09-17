import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import {
  ShieldCheck,
  HardHat,
  User,
  Search,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  Check,
  ChevronDown,
  FileText,
  Briefcase,
} from 'lucide-react';

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
}) => {
  const { currentUser, userProfile, logout, quickLoginAs } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'citizen', label: 'Citizen', icon: User, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    { role: 'authority', label: 'Municipal Authority', icon: ShieldCheck, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { role: 'contractor', label: 'Contractor', icon: HardHat, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  const currentRoleObj = roles.find((r) => r.role === currentRole) || roles[0];
  const RoleIcon = currentRoleObj.icon;

  const displayName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || '';

  const handleSwitchRole = async (newRole: UserRole) => {
    onRoleChange(newRole);
    if (currentUser) {
      await quickLoginAs(newRole);
    }
    if (newRole === 'citizen') setActiveView('citizen-dashboard');
    else if (newRole === 'contractor') setActiveView('contractor-dashboard');
    else if (newRole === 'authority') setActiveView('authority');
  };

  return (
    <>
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
            className="flex items-center gap-3 text-left group shrink-0"
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

            {/* Citizen View Links */}
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

            {/* Role-Specific Portal Links */}
            {currentRole === 'citizen' && (
              <button
                onClick={() => setActiveView('citizen-dashboard')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeView === 'citizen-dashboard'
                    ? 'text-sky-900 bg-sky-50 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>My Complaints</span>
              </button>
            )}

            {currentRole === 'contractor' && (
              <button
                onClick={() => setActiveView('contractor-dashboard')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeView === 'contractor-dashboard'
                    ? 'text-amber-900 bg-amber-50 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                <span>Work Orders</span>
              </button>
            )}

            {currentRole === 'authority' && (
              <button
                onClick={() => setActiveView('authority')}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeView === 'authority'
                    ? 'text-indigo-900 bg-indigo-50 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Authority Portal</span>
              </button>
            )}
          </nav>

          {/* Right Section: Authenticated User & Role Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Logged-In User Badge / Sign-In Button */}
            {currentUser && displayName ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors shadow-2xs"
                  title="Account settings and role switch"
                >
                  <div className="w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center font-bold text-[11px]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-slate-900 leading-none text-xs">{displayName}</p>
                    <p className="text-[10px] text-slate-500 capitalize leading-tight mt-0.5">
                      {userProfile?.role || currentRole}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-bold uppercase">
                        {userProfile?.role || currentRole}
                      </span>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                        Switch Active Role
                      </div>
                      {roles.map((r) => (
                        <button
                          key={r.role}
                          onClick={() => {
                            handleSwitchRole(r.role);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left ${
                            currentRole === r.role ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <r.icon className="w-3.5 h-3.5" />
                            <span>{r.label}</span>
                          </div>
                          {currentRole === r.role && <Check className="w-3.5 h-3.5 text-sky-700" />}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          setShowUserDropdown(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-left font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs transition-all hidden sm:flex items-center gap-1.5"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Quick 1-Click Role Switcher Pill (Always accessible for rapid review) */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {roles.map((r) => {
                const isSelected = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleSwitchRole(r.role)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <r.icon className="w-3 h-3" />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        defaultRole={currentRole}
      />
    </>
  );
};
