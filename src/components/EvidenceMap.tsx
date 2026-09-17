import React from 'react';
import { formatDistance, calculateDistanceMeters } from '../utils/geo';
import { MapPin, Navigation, ShieldCheck, AlertTriangle } from 'lucide-react';

interface EvidenceMapProps {
  originalLat: number;
  originalLon: number;
  afterLat?: number;
  afterLon?: number;
  originalAddress?: string;
  afterAddress?: string;
  zoom?: number;
  height?: string;
}

export const EvidenceMap: React.FC<EvidenceMapProps> = ({
  originalLat,
  originalLon,
  afterLat,
  afterLon,
  originalAddress,
  afterAddress,
  height = 'h-64',
}) => {
  const hasAfter = afterLat !== undefined && afterLon !== undefined;
  const distance = hasAfter ? calculateDistanceMeters(originalLat, originalLon, afterLat!, afterLon!) : 0;
  const distanceAcceptable = distance <= 15.0;

  // OpenStreetMap embedded viewport
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${originalLon - 0.003}%2C${
    originalLat - 0.003
  }%2C${originalLon + 0.003}%2C${originalLat + 0.003}&layer=mapnik&marker=${originalLat}%2C${originalLon}`;

  return (
    <div id="evidence-map-container" className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      {/* Map Header - Clean Civic Title & Location, No External GPS link */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-700" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Civic Spatial Evidence Verification
          </span>
        </div>
        {originalAddress && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="line-clamp-1 max-w-xs">{originalAddress}</span>
          </div>
        )}
      </div>

      {/* Map display */}
      <div className={`relative ${height} bg-slate-100 overflow-hidden`}>
        {/* OpenStreetMap embedded layer */}
        <iframe
          title="Evidence Location Map"
          src={osmUrl}
          className="w-full h-full border-0 filter saturate-90"
          loading="lazy"
        />

        {/* Distance Overlay Banner if comparing before and after */}
        {hasAfter && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto max-w-sm bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-slate-200 shadow-md">
            <div className="flex items-center gap-2">
              {distanceAcceptable ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Location Delta: {formatDistance(distance)}
                </p>
                <p className={`text-[11px] font-medium ${distanceAcceptable ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {distanceAcceptable
                    ? 'Same physical road section confirmed (within 15m tolerance)'
                    : 'Location mismatch detected! Distance exceeds tolerance limit'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Human-Readable Address Footer (Coordinates stored internally, NOT shown to users) */}
      <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100">
        <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100">
          <div className="flex items-center gap-1.5 text-sky-900 font-bold mb-1">
            <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span>Citizen Verified Location</span>
          </div>
          <p className="text-slate-800 text-xs font-medium leading-snug">
            {originalAddress || 'Reported civic road section'}
          </p>
        </div>

        {hasAfter ? (
          <div
            className={`p-2.5 rounded-lg border ${
              distanceAcceptable ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-bold mb-1 ${
                distanceAcceptable ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${distanceAcceptable ? 'text-emerald-700' : 'text-rose-700'} shrink-0`} />
              <span>Contractor Claim Location</span>
            </div>
            <p className="text-slate-800 text-xs font-medium leading-snug">
              {afterAddress || 'Repair submission site'}
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 italic text-[11px]">
            Contractor repair location pending submission
          </div>
        )}
      </div>
    </div>
  );
};
