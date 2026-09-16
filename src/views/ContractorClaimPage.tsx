import React, { useState } from 'react';
import { PotholeRecord, CaptureMetadata } from '../types';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { formatCoordinates, calculateDistanceMeters, formatDistance } from '../utils/geo';
import { ROAD_IMAGES } from '../data/seedData';
import {
  HardHat,
  Camera,
  MapPin,
  Lock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface ContractorClaimPageProps {
  pothole: PotholeRecord;
  onBack: () => void;
  onSubmitClaim: (
    potholeId: string,
    claimData: {
      afterImageUrl: string;
      afterLatitude: number;
      afterLongitude: number;
      afterAddress?: string;
      afterCaptureMetadata: CaptureMetadata;
      repairDescription: string;
      materialsUsed: string;
    }
  ) => Promise<void>;
  onNavigateToVerify: (potholeId: string) => void;
}

export const ContractorClaimPage: React.FC<ContractorClaimPageProps> = ({
  pothole,
  onBack,
  onSubmitClaim,
  onNavigateToVerify,
}) => {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(pothole.afterImageUrl || null);
  const [afterCoords, setAfterCoords] = useState<{ lat: number; lon: number } | null>(
    pothole.afterLatitude && pothole.afterLongitude
      ? { lat: pothole.afterLatitude, lon: pothole.afterLongitude }
      : null
  );
  const [afterAddress, setAfterAddress] = useState<string>(pothole.afterAddress || '');
  const [metadata, setMetadata] = useState<CaptureMetadata | null>(pothole.afterCaptureMetadata || null);

  const [repairDescription, setRepairDescription] = useState(
    pothole.repairDescription ||
      'Excavated damaged area to sound foundation, applied tack coat, filled with dense bituminous macadam (DBM) hot mix, and vibratory compacted flush with road level.'
  );
  const [materialsUsed, setMaterialsUsed] = useState(
    pothole.materialsUsed || 'Grade VG-30 Bitumen, 40mm aggregate base, 20mm seal coat'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute live distance delta if after coordinates exist
  const distance =
    afterCoords && pothole.latitude && pothole.longitude
      ? calculateDistanceMeters(pothole.latitude, pothole.longitude, afterCoords.lat, afterCoords.lon)
      : 0;
  const isAcceptableDistance = distance <= 15.0;

  const handleCaptureComplete = (data: {
    imageUrl: string;
    latitude: number;
    longitude: number;
    address: string;
    metadata: CaptureMetadata;
  }) => {
    setAfterPhotoUrl(data.imageUrl);
    setAfterCoords({ lat: data.latitude, lon: data.longitude });
    setAfterAddress(data.address);
    setMetadata(data.metadata);
  };

  // Hackathon Quick Demonstrators:
  const handleLoadGenuineProof = () => {
    setAfterPhotoUrl(ROAD_IMAGES.mumbaiPotholeAfterGenuine);
    setAfterCoords({ lat: pothole.latitude + 0.00003, lon: pothole.longitude + 0.00002 }); // ~3.8m away
    setAfterAddress(pothole.address);
    setRepairDescription('Excavated loose subgrade, applied RS-1 tack coat, filled with hot-mix dense bituminous macadam (DBM) and rolled with 8-ton vibratory roller to flush surface.');
    setMaterialsUsed('Grade VG-30 Bitumen, 40mm aggregate base, 20mm seal coat');
    setMetadata({
      captureSource: 'device_camera',
      accuracyMeters: 3.5,
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
    });
  };

  const handleLoadGamingAttempt = () => {
    setAfterPhotoUrl(ROAD_IMAGES.blrPotholeAfterGaming);
    // 864 meters away!
    setAfterCoords({ lat: pothole.latitude - 0.0074, lon: pothole.longitude + 0.0076 });
    setAfterAddress('Outer Ring Road, Commercial Bypass Corridor (864m from report site)');
    setRepairDescription('Completed surface patch with asphalt mix.');
    setMaterialsUsed('Standard cold asphalt');
    setMetadata({
      captureSource: 'device_camera',
      accuracyMeters: 6.8,
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!afterPhotoUrl || !afterCoords) {
      setSubmitError('After-repair photo and live GPS capture are strictly mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitClaim(pothole.potholeId, {
        afterImageUrl: afterPhotoUrl,
        afterLatitude: afterCoords.lat,
        afterLongitude: afterCoords.lon,
        afterAddress,
        afterCaptureMetadata: metadata || {
          captureSource: 'device_camera',
          deviceTimestamp: new Date().toISOString(),
        },
        repairDescription,
        materialsUsed,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit repair claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contractor-claim-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Complaint Details</span>
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-amber-700" />
                <span>Contractor Evidence Submission</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Claim Repair Completion
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Submit after-repair photo and live GPS telemetry. RoadSetu AI will verify that your repair matches the citizen's original report.
            </p>
          </div>

          {/* Quick Preset Demonstrators */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-500">Test Scenarios:</span>
            <button
              type="button"
              onClick={handleLoadGenuineProof}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              Load Genuine Repair Photo
            </button>
            <button
              type="button"
              onClick={handleLoadGamingAttempt}
              className="px-2.5 py-1 text-[11px] font-bold rounded bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition-colors"
            >
              Load Off-Site Gaming Photo
            </button>
          </div>
        </div>

        {submitError && (
          <div className="my-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Locked Immutable Citizen Evidence Display */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Original Citizen Evidence (Strictly Immutable)</span>
            </span>
            <span className="font-mono text-xs font-bold text-slate-900">
              {pothole.potholeId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-950 aspect-4/3 max-h-40">
              <img
                src={pothole.beforeImageUrl}
                alt="Original citizen evidence"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="md:col-span-2 text-xs text-slate-700 space-y-1.5">
              <p>
                <strong>Citizen Description:</strong> "{pothole.description}"
              </p>
              {pothole.landmark && (
                <p>
                  <strong>Key Landmark to Match:</strong> {pothole.landmark}
                </p>
              )}
              <p className="font-mono text-[11px] text-slate-600">
                <strong>Original Location:</strong> {formatCoordinates(pothole.latitude, pothole.longitude)}
              </p>
              <p className="text-[11px] text-slate-500">
                <strong>Reported:</strong> {new Date(pothole.beforeTimestamp).toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-800 italic pt-1">
                Notice: Contractors cannot replace, modify, or override the citizen's baseline evidence.
              </p>
            </div>
          </div>
        </div>

        {/* Submission Form or Success View */}
        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Repair Evidence Successfully Lodged</h3>
            <p className="text-xs text-slate-700 max-w-md mx-auto">
              Status advanced to <strong>Verification In Progress</strong>. As mandated by RoadSetu regulations,
              potholes cannot be automatically resolved without passing multi-factor computer vision verification.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigateToVerify(pothole.potholeId)}
                className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-sky-300" />
                <span>Launch AI Repair Verification</span>
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl"
              >
                Return to Complaint
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* After-Repair Photo Capture */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                1. Capture After-Repair Photo & Live GPS <span className="text-rose-600">*</span>
              </label>

              {afterPhotoUrl && afterCoords ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="relative aspect-4/3 max-h-72 bg-slate-950 flex items-center justify-center">
                    <img
                      src={afterPhotoUrl}
                      alt="Submitted repair evidence"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraModal(true)}
                        className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>
                    </div>
                  </div>

                  {/* Geotag & Distance Live Analysis */}
                  <div className="p-3.5 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Submitted GPS:</span>
                        <span className="font-mono text-[11px] text-slate-700">
                          {formatCoordinates(afterCoords.lat, afterCoords.lon)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{afterAddress}</p>
                    </div>

                    {/* Live Distance Delta Preview */}
                    <div
                      className={`px-3 py-1.5 rounded-lg border text-right font-medium ${
                        isAcceptableDistance
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}
                    >
                      <span className="text-[10px] block uppercase font-bold">Location Delta:</span>
                      <span className="font-bold text-sm">{formatDistance(distance)}</span>
                      <span className="block text-[10px]">
                        {isAcceptableDistance ? '✓ Within 15m threshold' : '✕ Exceeds 15m tolerance!'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowCameraModal(true)}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-amber-50/20 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Capture Completed Road Repair Photo
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Must be captured directly at the site to lock current GPS coordinates and capture matching background landmarks.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs">
                    <Camera className="w-4 h-4" />
                    Open Camera & GPS
                  </span>
                </div>
              )}
            </div>

            {/* Repair Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                2. Repair Description & Methodology
              </label>
              <textarea
                rows={3}
                value={repairDescription}
                onChange={(e) => setRepairDescription(e.target.value)}
                placeholder="Describe preparation, excavation depth, compaction equipment, and surface finish..."
                className="w-full px-3.5 py-2.5 text-xs text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Materials Used */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                3. Materials & Bitumen Specifications
              </label>
              <input
                type="text"
                value={materialsUsed}
                onChange={(e) => setMaterialsUsed(e.target.value)}
                placeholder="e.g. Grade VG-30 Bitumen, dense bituminous macadam, 20mm aggregate seal..."
                className="w-full px-3.5 py-2 text-xs text-slate-900 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Strict Anti-Fraud Warning Callout */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Anti-Fraud Spatial Evidence Verification:
                  </p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    RoadSetu AI will compare this photo against the original citizen submission. Tampered coordinates or photos from other locations will result in flagged fraud and blocked payments.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Civic rule: After submission, AI verification runs before any sign-off.
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !afterPhotoUrl}
                className="w-full sm:w-auto px-7 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Claim...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Lodge Repair Claim</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Integrated Camera Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        title="Capture Live After-Repair Evidence & GPS"
        onCaptureComplete={handleCaptureComplete}
      />
    </div>
  );
};
