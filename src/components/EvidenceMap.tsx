import React from 'react';
import { formatCoordinates, formatDistance, calculateDistanceMeters } from '../utils/geo';
import { MapPin, Navigation, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

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

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${originalLon - 0.003}%2C${
    originalLat - 0.003
  }%2C${originalLon + 0.003}%2C${originalLat + 0.003}&layer=mapnik&marker=${originalLat}%2C${originalLon}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${originalLat},${originalLon}`;

  return (
    <div id="evidence-map-container" className="rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
      {/* Map Header */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-700" />
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
            Civic Spatial Evidence Verification
          </span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-medium"
        >
          <span>Open External GPS</span>
          <ExternalLink className="w-3 h-3" />
        </a>
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
          <div className="absolute top-3 left-3 right-3 sm:right-auto max-w-sm bg-white/95 backdrop-blur-xs rounded-md p-3 border border-slate-200 shadow-md">
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
                    ? 'Within acceptable tolerance threshold (≤ 15.0m)'
                    : 'Discrepancy detected! Exceeds acceptable tolerance (15.0m)'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coordinate & Address Footer */}
      <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-100">
        <div className="p-2 rounded bg-sky-50/60 border border-sky-100">
          <div className="flex items-center gap-1.5 text-sky-900 font-semibold mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-sky-700" />
            <span>Citizen Original GPS</span>
          </div>
          <p className="font-mono text-slate-800 text-[11px]">{formatCoordinates(originalLat, originalLon)}</p>
          {originalAddress && (
            <p className="text-slate-600 text-[11px] mt-1 line-clamp-1" title={originalAddress}>
              {originalAddress}
            </p>
          )}
        </div>

        {hasAfter ? (
          <div
            className={`p-2 rounded border ${
              distanceAcceptable ? 'bg-emerald-50/60 border-emerald-100' : 'bg-rose-50/60 border-rose-100'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 font-semibold mb-0.5 ${
                distanceAcceptable ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${distanceAcceptable ? 'text-emerald-700' : 'text-rose-700'}`} />
              <span>Contractor Claim GPS</span>
            </div>
            <p className="font-mono text-slate-800 text-[11px]">{formatCoordinates(afterLat!, afterLon!)}</p>
            {afterAddress && (
              <p className="text-slate-600 text-[11px] mt-1 line-clamp-1" title={afterAddress}>
                {afterAddress}
              </p>
            )}
          </div>
        ) : (
          <div className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 italic text-[11px]">
            Contractor repair location pending submission
          </div>
        )}
      </div>
    </div>
  );
};
