import React, { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { PotholeRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface TrackSearchPageProps {
  potholes?: PotholeRecord[];
  onSelectPothole: (potholeId: string) => void;
}

export const TrackSearchPage: React.FC<TrackSearchPageProps> = ({
  potholes = [],
  onSelectPothole,
}) => {
  const safePotholes = potholes || [];
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const cleanQuery = query.trim().toUpperCase();
  const matchedPothole = safePotholes.find(
    (p) =>
      p.potholeId.toUpperCase() === cleanQuery ||
      p.potholeId.toUpperCase().includes(cleanQuery) ||
      p.address.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (matchedPothole) {
      onSelectPothole(matchedPothole.potholeId);
    }
  };

  return (
    <div id="track-search-page" className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Pothole Complaint
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2">
          Enter the permanent Pothole ID to inspect the immutable evidence trail, contractor claims, and AI verification results.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHasSearched(false);
              }}
              placeholder="e.g. PTH-MUM-2026-00142 or PTH-BLR-2026-00088..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-600 focus:outline-hidden uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search Audit Trail</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Clickable Suggestions */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mr-2">
            Quick Try Active Cases:
          </span>
          <div className="inline-flex flex-wrap gap-2 mt-1">
            {potholes.slice(0, 4).map((p) => (
              <button
                key={p.potholeId}
                type="button"
                onClick={() => {
                  setQuery(p.potholeId);
                  onSelectPothole(p.potholeId);
                }}
                className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-sky-50 hover:text-sky-900 border border-slate-200 transition-colors"
              >
                {p.potholeId} ({p.status})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Result Feedback */}
      {hasSearched && !matchedPothole && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-amber-700" />
          <p className="font-bold text-sm">No Pothole Found with ID: "{query}"</p>
          <p className="mt-1 text-slate-600">
            Please verify the Pothole ID format. You can click any of the active demo cases above.
          </p>
        </div>
      )}

      {/* Direct List of All Trackable Digital Potholes */}
      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
          All Registered Civic Potholes ({potholes.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {potholes.map((p) => (
            <div
              key={p.potholeId}
              onClick={() => onSelectPothole(p.potholeId)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {p.potholeId}
                  </span>
                  <StatusBadge status={p.status} size="sm" />
                </div>

                <p className="text-xs font-semibold text-slate-900 line-clamp-2 mt-2">
                  {p.description}
                </p>

                <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{p.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="text-sky-700 font-semibold flex items-center gap-1">
                  View Full Evidence <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
