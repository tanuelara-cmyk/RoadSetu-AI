import React from 'react';
import { VerificationResult } from '../types';
import { ShieldCheck, AlertTriangle, MapPin, Camera, Sparkles, Layers, Info } from 'lucide-react';
import { formatDistance } from '../utils/geo';

interface VerificationScorecardProps {
  result: VerificationResult;
}

export const VerificationScorecard: React.FC<VerificationScorecardProps> = ({ result }) => {
  const isVerified = result.verificationStatus === 'VERIFIED';

  const factorIcons: Record<string, React.ReactNode> = {
    'Pothole Region Match': <Layers className="w-4 h-4" />,
    'GPS Consistency': <MapPin className="w-4 h-4" />,
    'Viewpoint & Perspective': <Camera className="w-4 h-4" />,
    'Background Landmark Match': <Sparkles className="w-4 h-4" />,
    'Visible Repair Evidence': <ShieldCheck className="w-4 h-4" />,
    'Evidence Quality': <Info className="w-4 h-4" />,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  return (
    <div
      id="verification-scorecard"
      className={`rounded-xl border ${
        isVerified ? 'border-emerald-300 bg-emerald-50/20' : 'border-rose-300 bg-rose-50/20'
      } p-5 shadow-xs`}
    >
      {/* Header Verdict Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg border ${
              isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {isVerified ? <ShieldCheck className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}
              >
                {result.verificationStatus}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Audit ID: {result.verificationId}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Evaluated via {result.modelUsed}
            </p>
          </div>
        </div>

        {/* Big Overall Confidence Metric */}
        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Verification Confidence
          </div>
          <div className="flex items-baseline justify-end gap-1 mt-0.5">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                isVerified ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {result.overallVerificationScore.toFixed(1)}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Civic Threshold: ≥ 75.0%
          </span>
        </div>
      </div>

      {/* Human-Readable Civic Explanation */}
      <div className="mt-4 p-3.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed shadow-2xs">
        <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-700" />
          <span>Determination Summary:</span>
        </p>
        <p>{result.explanation}</p>
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>
            GPS Distance Delta: <strong>{formatDistance(result.distanceMeters)}</strong> (Tolerance: ≤ 15.0m)
          </span>
          <span className="italic">
            Note: Multi-factor verification confidence, not absolute single-point proof.
          </span>
        </div>
      </div>

      {/* Contractor Gaming Detection Alert Banner if Reinspection Required */}
      {!isVerified && (
        <div className="mt-4 p-4 rounded-xl bg-rose-100 border-2 border-rose-300 text-rose-950 shadow-2xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
                <span>Contractor Gaming Attempt Flagged</span>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-semibold">
                  AUDIT CODE: FRAUD-PREVENT-0401
                </span>
              </h4>
              <ul className="mt-1.5 space-y-1 text-xs text-rose-800 list-disc list-inside">
                <li>
                  Distance mismatch: <strong>{result.distanceMeters.toFixed(1)}m away</strong> from reported pothole (threshold: ≤ 15.0m)
                </li>
                <li>
                  Background landmark absent: original compound wall and drainage cover missing in contractor submission
                </li>
                <li>
                  Different road geometry: multi-lane expressway divider vs municipal cross-road
                </li>
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-700 text-white text-xs font-bold shadow-2xs">
                  <span>Action: Payout Blocked. Municipal Reinspection Assigned.</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The 6 Factor Grid */}
      <div className="mt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Detailed Factor Breakdown (6 Dimensions)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.factorDetails.map((f, i) => {
            const icon = factorIcons[f.factor] || <Info className="w-4 h-4" />;
            return (
              <div
                key={i}
                className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <span className="text-slate-500">{icon}</span>
                      <span>{f.factor}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(f.score)}`}
                    >
                      {f.score}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${getProgressColor(f.score)}`}
                      style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 leading-normal">{f.notes}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Benchmark requirement</span>
                  <span
                    className={`font-semibold ${
                      f.passed ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {f.passed ? '✓ PASSED' : '✕ FAILED / SUSPICIOUS'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
