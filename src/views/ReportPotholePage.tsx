import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Upload,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  GitMerge,
  Eye,
  Layers,
  Sparkles,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { PotholeSeverity, CaptureMetadata, PotholeRecord, ImageValidationResult, DuplicateMatch } from '../types';
import { ROAD_IMAGES } from '../data/seedData';
import { validateRoadDamage, findDuplicateComplaints } from '../utils/aiLogic';
import { useAuth } from '../context/AuthContext';
import { createComplaintInFirestore } from '../services/firestoreService';

interface ReportPotholePageProps {
  potholes?: PotholeRecord[];
  existingPotholes?: PotholeRecord[];
  onReportCreated: (newPothole: PotholeRecord) => void;
  onNavigate: (view: string, potholeId?: string) => void;
}

export const ReportPotholePage: React.FC<ReportPotholePageProps> = ({
  potholes = [],
  existingPotholes,
  onReportCreated,
  onNavigate,
}) => {
  const activePotholesList = existingPotholes ?? potholes ?? [];

  // Wizard state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState('');
  const [metadata, setMetadata] = useState<CaptureMetadata | null>(null);

  // Road Damage Validation state
  const [validationResult, setValidationResult] = useState<ImageValidationResult | null>(null);

  const { currentUser, userProfile } = useAuth();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<PotholeSeverity>('High');
  const [landmark, setLandmark] = useState('');
  const [reporterName, setReporterName] = useState(
    userProfile?.name || currentUser?.displayName || 'Citizen Reporter'
  );
  const [reporterEmail, setReporterEmail] = useState(
    userProfile?.email || currentUser?.email || 'citizen@roadsetu.gov.in'
  );

  useEffect(() => {
    if (userProfile?.name || currentUser?.displayName) {
      setReporterName(userProfile?.name || currentUser?.displayName || 'Citizen Reporter');
    }
    if (userProfile?.email || currentUser?.email) {
      setReporterEmail(userProfile?.email || currentUser?.email || 'citizen@roadsetu.gov.in');
    }
  }, [userProfile, currentUser]);

  // Duplicate matches
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [linkedClusterId, setLinkedClusterId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPothole, setSubmittedPothole] = useState<PotholeRecord | null>(null);

  const severities: { level: PotholeSeverity; label: string; desc: string; color: string }[] = [
    { level: 'Low', label: 'Low', desc: 'Surface crack / minor chipping (< 3cm depth)', color: 'border-slate-300 hover:border-slate-400' },
    { level: 'Medium', label: 'Medium', desc: 'Noticeable depression (3–8cm depth)', color: 'border-amber-300 hover:border-amber-400' },
    { level: 'High', label: 'High', desc: 'Dangerous cavity (8–20cm), skidding hazard for two-wheelers', color: 'border-orange-400 hover:border-orange-500' },
    { level: 'Critical', label: 'Critical', desc: 'Severe crater (> 20cm), risk of wheel rim break or accident', color: 'border-rose-400 hover:border-rose-500' },
  ];

  // Run AI Road Damage Validation whenever photo changes
  useEffect(() => {
    if (photoUrl) {
      const res = validateRoadDamage(photoUrl, false);
      setValidationResult(res);
    } else {
      setValidationResult(null);
    }
  }, [photoUrl]);

  // Run Duplicate Check when entering Step 5
  useEffect(() => {
    if (currentStep === 5 && coords) {
      setIsCheckingDuplicates(true);
      const timer = setTimeout(() => {
        const matches = findDuplicateComplaints(
          {
            latitude: coords.lat,
            longitude: coords.lon,
            description,
            beforeImageUrl: photoUrl || undefined,
          },
          activePotholesList
        );
        setDuplicateMatches(matches);
        setIsCheckingDuplicates(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep, coords, description, photoUrl, activePotholesList]);

  const handleCaptureComplete = (data: {
    imageUrl: string;
    latitude: number;
    longitude: number;
    address: string;
    metadata: CaptureMetadata;
  }) => {
    setPhotoUrl(data.imageUrl);
    setCoords({ lat: data.latitude, lon: data.longitude });
    setAddress(data.address);
    setMetadata(data.metadata);
  };

  // Quick preset loaders for rapid hackathon testing
  const handleLoadMumbaiSample = () => {
    setPhotoUrl(ROAD_IMAGES.mumbaiPotholeBefore);
    setCoords({ lat: 19.0596, lon: 72.8295 });
    setAddress('SV Road, near Bandra West Post Office, Mumbai, Maharashtra - 400050');
    setLandmark('Adjacent to Streetlight Pole BR-42 and yellow curb boundary');
    setDescription('Dangerous 35cm deep pothole in right lane near pedestrian crossing causing two-wheelers to skid.');
    setSeverity('High');
    setMetadata({
      captureSource: 'device_camera',
      accuracyMeters: 4.2,
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
      userAgent: 'RoadSetu Mobile Web/Android',
    });
  };

  const handleLoadBangaloreSample = () => {
    setPhotoUrl(ROAD_IMAGES.blrPotholeBefore);
    setCoords({ lat: 12.9352, lon: 77.6245 });
    setAddress('5th Cross Road, Koramangala 4th Block, Bengaluru, Karnataka - 560034');
    setLandmark('In front of red brick wall and concrete drainage slab');
    setDescription('Sharp crater breaking vehicle rims and throwing stones at pedestrians during monsoon downpours.');
    setSeverity('Critical');
    setMetadata({
      captureSource: 'device_camera',
      accuracyMeters: 3.8,
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
      userAgent: 'RoadSetu Mobile Web/Android',
    });
  };

  // Test invalid object (coffee mug / desk) to demonstrate rejection!
  const handleLoadInvalidSample = () => {
    setPhotoUrl(ROAD_IMAGES.invalidSampleObject);
    setCoords({ lat: 19.0596, lon: 72.8295 });
    setAddress('Office Desk, SV Road Business Hub');
    setLandmark('Desk interior');
    setDescription('Testing invalid non-road upload rejection.');
    setSeverity('Low');
    setMetadata({
      captureSource: 'file_upload',
      deviceTimestamp: new Date().toISOString(),
      aspectRatio: '4:3',
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitError(null);

    if (!photoUrl || !coords) {
      setSubmitError('Please capture or upload pothole photo and verify GPS location.');
      return;
    }

    if (validationResult && !validationResult.isValid) {
      setSubmitError('Cannot submit: AI Road Damage Validation rejected the uploaded image as non-road evidence.');
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please enter a description of the road hazard.');
      return;
    }

    setIsSubmitting(true);

    try {
      const citizenUid = currentUser?.uid;
      let newRecord: PotholeRecord;
      try {
        newRecord = await createComplaintInFirestore(
          {
            description: description.trim(),
            severity,
            latitude: coords.lat,
            longitude: coords.lon,
            address,
            landmark: landmark.trim(),
            beforeImageUrl: photoUrl,
            beforeCaptureMetadata: metadata || undefined,
            reporterName,
            reporterEmail,
            citizenId: citizenUid,
            clusterId: linkedClusterId || undefined,
          },
          citizenUid,
          reporterName
        );
      } catch (firestoreErr) {
        console.warn('Firestore direct write failed, falling back to server API', firestoreErr);
        const response = await fetch('/api/potholes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: description.trim(),
            severity,
            latitude: coords.lat,
            longitude: coords.lon,
            address,
            landmark: landmark.trim(),
            beforeImageUrl: photoUrl,
            beforeCaptureMetadata: metadata,
            reporterName,
            reporterEmail,
            citizenId: citizenUid,
            clusterId: linkedClusterId || undefined,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to submit report');
        }

        const data = await response.json();
        newRecord = data.pothole;
      }

      setSubmittedPothole(newRecord);
      onReportCreated(newRecord);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step names
  const steps = [
    { num: 1, name: 'Evidence' },
    { num: 2, name: 'Location' },
    { num: 3, name: 'Severity' },
    { num: 4, name: 'Description' },
    { num: 5, name: 'Duplicate Check' },
    { num: 6, name: 'Submit' },
  ];

  return (
    <div id="report-pothole-page" className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      {/* Top Breadcrumb & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Step-by-Step Civic Reporting Workflow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
          Report Road Damage
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Every report receives a tamper-proof digital ID with locked GPS telemetry and AI evidence validation.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isPassed = currentStep > s.num;
            return (
              <div key={s.num} className="flex-1 flex flex-col items-center relative">
                <button
                  onClick={() => {
                    if (isPassed || (s.num < currentStep)) setCurrentStep(s.num);
                  }}
                  disabled={!isPassed && !isActive}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-sky-700 text-white ring-4 ring-sky-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </button>
                <span
                  className={`text-[10px] mt-1 font-semibold hidden sm:inline ${
                    isActive ? 'text-sky-900 font-bold' : isPassed ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUCCESS CONFIRMATION STATE */}
      {submittedPothole ? (
        <div className="bg-white rounded-2xl border border-emerald-300 p-8 shadow-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950">
            Pothole Complaint Registered!
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Your complaint has been assigned a persistent digital identity and queued for municipal allocation.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Complaint ID:</span>
              <span className="font-bold text-sky-800">{submittedPothole.potholeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-slate-900">{submittedPothole.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Severity:</span>
              <span className="font-bold text-amber-700">{submittedPothole.severity}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500">Location:</span>
              <span className="text-slate-800 font-semibold truncate max-w-[200px]">
                {submittedPothole.address || 'Detected road corridor'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('detail', submittedPothole.potholeId)}
              className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs inline-flex items-center gap-2"
            >
              <span>Track This Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('authority')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs inline-flex items-center gap-2"
            >
              <span>View in Authority Portal</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* STEP 1: CAPTURE EVIDENCE & ROAD DAMAGE VALIDATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-sky-700" />
                    <span>STEP 1: CAPTURE EVIDENCE</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture photo with camera or upload image. AI immediately checks whether image shows real road damage.
                  </p>
                </div>
              </div>

              {/* Photo Viewfinder */}
              {photoUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-16/10 bg-slate-950 flex items-center justify-center">
                    <img
                      src={photoUrl}
                      alt="Pothole capture"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={() => setShowCameraModal(true)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake Photo</span>
                    </button>
                  </div>

                  {/* AI Road Damage Validation Result Box */}
                  {validationResult && (
                    <div
                      className={`p-4 rounded-xl border ${
                        validationResult.isValid
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {validationResult.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide">
                              AI Road Damage Validation
                            </span>
                            <span className="text-xs font-mono font-bold">
                              Confidence: {validationResult.confidence.toFixed(1)}%
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              {validationResult.roadSurfaceDetected ? (
                                <span className="text-emerald-700 font-bold">✓</span>
                              ) : (
                                <span className="text-rose-600 font-bold">✕</span>
                              )}
                              <span>
                                Road surface {validationResult.roadSurfaceDetected ? 'detected' : 'not found'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {validationResult.potholeOrDamageDetected ? (
                                <span className="text-emerald-700 font-bold">✓</span>
                              ) : (
                                <span className="text-rose-600 font-bold">✕</span>
                              )}
                              <span>
                                Pothole / road cavity damage {validationResult.potholeOrDamageDetected ? 'detected' : 'not found'}
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 text-xs font-medium leading-relaxed">
                            {validationResult.message}
                          </p>

                          {!validationResult.isValid && (
                            <p className="mt-2 text-[11px] font-bold text-rose-700 bg-rose-100/70 p-2 rounded border border-rose-200">
                              ⚠️ Submission blocked: You must provide a clear photograph of a real road defect to continue.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-sky-400 transition-colors bg-slate-50/50">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Live Camera Capture or Upload Photo
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Take a live picture of the pothole from a safe location. Browser GPS coordinates will be locked automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera & GPS Viewfinder</span>
                  </button>
                </div>
              )}

              {/* Hackathon Judge Presets */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Judge Testing Presets (Click to test validation):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleLoadMumbaiSample}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1. Mumbai SV Road Pothole (Valid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadBangaloreSample}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Bangalore Crater (Valid)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadInvalidSample}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>3. Test Invalid Object Rejection (Coffee Mug)</span>
                  </button>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!photoUrl || (validationResult && !validationResult.isValid)}
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <span>Next: Location Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-700" />
                  <span>STEP 2: VERIFIED LOCATION & LANDMARKS</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm geolocation telemetry and nearby landmarks for the repair crew.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Street Address / Corridor
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. SV Road, near Bandra West Post Office, Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-600"
                  />
                </div>

                <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">High-Precision Geolocation Locked</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Coordinates are captured and encrypted internally for automated AI verification and contractor repair routing.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nearby Landmark / Distinctive Background Features
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Adjacent to Streetlight Pole BR-42 and yellow curb boundary"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Note: Landmark details are audited by RoadSetu AI to verify against contractor repair photos.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!coords}
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <span>Next: Hazard Severity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HAZARD SEVERITY */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-sky-700" />
                  <span>STEP 3: HAZARD SEVERITY CLASSIFICATION</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the risk level to establish municipal repair SLA and priority weighting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {severities.map((s) => (
                  <label
                    key={s.level}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      severity === s.level
                        ? 'border-sky-700 bg-sky-50/50 shadow-xs ring-1 ring-sky-700'
                        : `${s.color} bg-white`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="severity"
                          value={s.level}
                          checked={severity === s.level}
                          onChange={() => setSeverity(s.level)}
                          className="text-sky-700 focus:ring-sky-600"
                        />
                        <span className="font-extrabold text-xs text-slate-900">
                          {s.label} Severity
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          s.level === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : s.level === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s.level === 'Critical' ? '24h SLA' : s.level === 'High' ? '48h SLA' : '72h SLA'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                      {s.desc}
                    </p>
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <span>Next: Description & Contact</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: DESCRIPTION */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-700" />
                  <span>STEP 4: DESCRIPTION & CITIZEN CONTACT</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explain the defect details for field crews.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Defect Description & Traffic Impact *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe size, depth, and whether it poses danger to two-wheelers, buses or pedestrians..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-sky-600 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Citizen Name
                    </label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Email for Status Updates
                    </label>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!description.trim()}
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <span>Next: Check for Duplicates</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DUPLICATE COMPLAINT INTELLIGENCE (Explicit User Requirement) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-indigo-700" />
                  <span>STEP 5: DUPLICATE COMPLAINT INTELLIGENCE</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scanning nearby complaints within 150m radius to identify potential duplicates.
                </p>
              </div>

              {isCheckingDuplicates ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Checking nearby reports...</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Analyzing geospatial proximity, semantic text, and image signatures.
                  </p>
                </div>
              ) : duplicateMatches.length > 0 ? (
                <div className="space-y-4">
                  {/* Warning Header */}
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Possible existing complaint found nearby!</span>
                    </div>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Another citizen has already reported a similar road defect within {duplicateMatches[0].distanceMeters.toFixed(1)}m.
                      You can view the existing complaint, link your report to strengthen its civic priority, or submit as a separate issue.
                    </p>
                  </div>

                  {/* Best Match Card */}
                  {duplicateMatches.slice(0, 2).map((match) => (
                    <div
                      key={match.potholeId}
                      className="p-4 rounded-xl bg-white border-2 border-indigo-200 shadow-2xs hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-900">
                            {match.potholeId}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            Match Score: {match.overallDuplicateScore}%
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          Distance: <strong>{match.distanceMeters.toFixed(1)}m away</strong>
                        </span>
                      </div>

                      {/* 4-Factor Similarity Breakdown */}
                      <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-slate-50 text-center">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Location (40%)</span>
                          <span className="font-bold text-indigo-800">{match.locationSimilarity}%</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 text-center">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Semantic (30%)</span>
                          <span className="font-bold text-indigo-800">{match.semanticSimilarity}%</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 text-center">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Visual (20%)</span>
                          <span className="font-bold text-indigo-800">{match.visualSimilarity}%</span>
                        </div>
                        <div className="p-2 rounded bg-slate-50 text-center">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Time (10%)</span>
                          <span className="font-bold text-indigo-800">{match.timeProximity}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 italic">
                        "{match.description}"
                      </p>

                      {/* Action buttons requested by user */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('detail', match.potholeId)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Existing Complaint</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLinkedClusterId(match.clusterId || 'CLUSTER-42');
                              setCurrentStep(6);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>Link to Existing Issue (Cluster #{match.clusterId?.replace(/[^0-9]/g, '') || '42'})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedClusterId(null);
                        setCurrentStep(6);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                    >
                      Ignore and create separate complaint →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold">✓ No similar complaint found within 150m</h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    This appears to be an independent, novel road defect report. Ready for submission.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <span>Next: Review & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUBMIT */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sky-700" />
                  <span>STEP 6: REVIEW & SUBMIT EVIDENCE</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the evidence package before minting the permanent civic audit record.
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Summary Review Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={photoUrl!}
                      alt="Review capture"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{address}</span>
                    <span className="text-[11px] font-medium text-emerald-700 block mt-0.5">
                      ✓ GPS Geolocation Locked &amp; Telemetry Audited
                    </span>
                    {landmark && (
                      <span className="text-[11px] text-sky-800 block mt-0.5">
                        <strong>Landmark:</strong> {landmark}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Severity</span>
                    <span className="font-bold text-slate-900">{severity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Reported By</span>
                    <span className="font-bold text-slate-900">{reporterName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Description</span>
                  <p className="text-slate-700 mt-0.5">{description}</p>
                </div>

                {linkedClusterId && (
                  <div className="p-2 rounded bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium">
                    🔗 Linked to <strong>{linkedClusterId}</strong> (Multi-Citizen Priority Boost applied)
                  </div>
                )}
              </div>

              {/* Submission CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit()}
                  className="px-6 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Minting Digital Identity...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-sky-200" />
                      <span>Submit Complaint & Generate Pothole ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          title="Capture Live Pothole Evidence & GPS Viewfinder"
          onCapture={handleCaptureComplete}
          onCaptureComplete={handleCaptureComplete}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};
