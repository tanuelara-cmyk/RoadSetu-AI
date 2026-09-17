import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  X,
  User,
  Shield,
  HardHat,
  Lock,
  Mail,
  Building,
  ArrowRight,
  Sparkles,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  defaultRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  defaultRole = 'citizen',
}) => {
  const { signIn, signUp, signInWithGoogle, quickLoginAs } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(defaultRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agency, setAgency] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await signUp(name.trim(), email.trim(), password, role, agency.trim());
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickLoginAs(demoRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick sign-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Firebase Authentication</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {mode === 'signup' ? 'Create RoadSetu AI Account' : 'Sign in to RoadSetu AI'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {mode === 'signup'
              ? 'Register as Citizen, Municipal Authority, or Contractor'
              : 'Access your role-specific dashboard and complaints'}
          </p>
        </div>

        {/* Role Quick Sign-in Shortcuts */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
            Instant 1-Click Role Testing:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('citizen')}
              disabled={isSubmitting}
              className="py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('authority')}
              disabled={isSubmitting}
              className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Authority</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('contractor')}
              disabled={isSubmitting}
              className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex flex-col items-center gap-1 transition-all"
            >
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Contractor</span>
            </button>
          </div>
        </div>

        {/* Google Sign-in Option */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center mb-3">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or with email</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
            <p>{error}</p>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className="inline-flex items-center gap-1 font-bold text-sky-800 hover:underline text-[11px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Switch to Sign Up with this email</span>
              </button>
            )}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'citizen'
                      ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('authority')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'authority'
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Authority</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('contractor')}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'contractor'
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Contractor</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          {mode === 'signup' && (role === 'authority' || role === 'contractor') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'authority' ? 'Municipal Department' : 'Company / Contracting Firm'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={
                    role === 'authority'
                      ? 'e.g. Roads & Traffic Division, BMC'
                      : 'e.g. InfraTech RoadWorks Pvt Ltd'
                  }
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs text-slate-600">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-sky-700 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-sky-700 hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
