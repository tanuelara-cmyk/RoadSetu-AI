import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="main-footer"
      className="w-full bg-[#080E21] border-t border-slate-800/80 text-slate-300 py-6 px-4 text-center mt-auto"
    >
      <div className="max-w-3xl mx-auto space-y-1.5">
        <h2 className="text-base font-extrabold text-white tracking-tight">
          RoadSetu <span className="text-cyan-400">AI</span>
        </h2>
        <p className="text-xs font-semibold text-cyan-200">
          Report it. Track it. Prove it&apos;s repaired.
        </p>
        <p className="text-xs text-slate-400 pt-2">
          © 2026 RoadSetu AI • Built for Smart Cities &amp; Urban Development
        </p>
        <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-400 pt-1">
          <span className="hover:text-cyan-300 transition-colors cursor-pointer">Privacy</span>
          <span className="text-slate-600">•</span>
          <span className="hover:text-cyan-300 transition-colors cursor-pointer">Terms</span>
          <span className="text-slate-600">•</span>
          <span className="hover:text-cyan-300 transition-colors cursor-pointer">Contact</span>
        </div>
      </div>
    </footer>
  );
};
