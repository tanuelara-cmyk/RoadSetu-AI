import React, { useState } from 'react';
import { PotholeRecord, VerificationResult } from '../types';
import { ROAD_IMAGES } from '../data/seedData';
import { verifyRepairEvidence } from '../utils/aiLogic';
import { formatCoordinates, formatDistance } from '../utils/geo';
import { VerificationScorecard } from './VerificationScorecard';
import {
  UserCheck,
  HardHat,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Camera,
  MapPin,
  ShieldCheck,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';

interface SampleVerificationFlowProps {
  onResolveComplaint?: (potholeId: string) => Promise<void> | void;
  onViewDetails?: (potholeId: string) => void;
}

export const SampleVerificationFlow: React.FC<SampleVerificationFlowProps> = ({
  onResolveComplaint,
  onViewDetails,
}) => {
  // Scenario switcher: 'genuine' (Mumbai), 'suspicious' (Delhi), or 'gaming' (Bengaluru)
  const [activeScenario, setActiveScenario] = useState<'genuine' | 'suspicious' | 'gaming'>('genuine');

  // Steps: 1: Assign Contractor, 2: Contractor Repair Upload, 3: AI Verification, 4: Verification Result
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResolved, setIsResolved] = useState<boolean>(false);

  // Form states for Step 1: Assign Contractor
  const [contractorName, setContractorName] = useState('Ramesh Patel');
  const [contractorCompany, setContractorCompany] = useState('InfraTech RoadWorks Pvt Ltd');

  // Scenario 1 data (Genuine Repair)
  const genuinePothole: PotholeRecord = {
    potholeId: 'PTH-MUM-2026-00142',
    reportedBy: {
      uid: 'user_aarav_sharma',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.in',
    },
    description: 'Dangerous 35cm deep pothole in right lane near pedestrian crossing on SV Road causing two-wheelers to skid.',
    severity: 'High',
    latitude: 19.0596,
    longitude: 72.8295,
    address: 'SV Road, near Bandra West Post Office, Mumbai, Maharashtra - 400050',
    landmark: 'Adjacent to Streetlight Pole BR-42 and yellow curb boundary',
    beforeImageUrl: ROAD_IMAGES.mumbaiPotholeBefore,
    beforeTimestamp: '2026-09-12T09:42:15.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 4.2,
      deviceTimestamp: '2026-09-12T09:42:15.000Z',
      aspectRatio: '4:3',
    },
    status: 'Reported',
    createdAt: '2026-09-12T09:42:15.000Z',
    updatedAt: '2026-09-12T09:42:15.000Z',
  };

  // Scenario 2 data (Suspicious Repair)
  const suspiciousPothole: PotholeRecord = {
    potholeId: 'PTH-DEL-2026-00031',
    reportedBy: {
      uid: 'user_kavita_singh',
      name: 'Kavita Singh',
      email: 'kavita.singh@example.in',
    },
    description: 'Deep road depression near bus shelter causing vehicular deviation and traffic deceleration.',
    severity: 'Medium',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Ring Road Corridor, Near Bus Shelter #4, New Delhi - 110001',
    landmark: 'Opposite Metro Pillar #114 and green barrier railing',
    beforeImageUrl: ROAD_IMAGES.mumbaiPotholeBefore,
    beforeTimestamp: '2026-09-11T14:20:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 6.0,
      deviceTimestamp: '2026-09-11T14:20:00.000Z',
      aspectRatio: '4:3',
    },
    status: 'Reported',
    createdAt: '2026-09-11T14:20:00.000Z',
    updatedAt: '2026-09-11T14:20:00.000Z',
  };

  // Scenario 3 data (Contractor Gaming Attempt)
  const gamingPothole: PotholeRecord = {
    potholeId: 'PTH-BLR-2026-00088',
    reportedBy: {
      uid: 'user_priya_nair',
      name: 'Priya Nair',
      email: 'priya.nair@example.in',
    },
    description: 'Sharp crater breaking vehicle rims and throwing stones at pedestrians during monsoon downpours.',
    severity: 'Critical',
    latitude: 12.9352,
    longitude: 77.6245,
    address: '5th Cross Road, Koramangala 4th Block, Bengaluru, Karnataka - 560034',
    landmark: 'In front of red brick compound wall and concrete drainage slab',
    beforeImageUrl: ROAD_IMAGES.blrPotholeBefore,
    beforeTimestamp: '2026-09-13T11:05:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 5.1,
      deviceTimestamp: '2026-09-13T11:05:00.000Z',
      aspectRatio: '4:3',
    },
    status: 'Reported',
    createdAt: '2026-09-13T11:05:00.000Z',
    updatedAt: '2026-09-13T11:05:00.000Z',
  };

  const currentPothole =
    activeScenario === 'genuine'
      ? genuinePothole
      : activeScenario === 'suspicious'
      ? suspiciousPothole
      : gamingPothole;

  // Contractor submitted after data
  const afterPhotoUrl =
    activeScenario === 'genuine'
      ? ROAD_IMAGES.mumbaiPotholeAfterGenuine
      : activeScenario === 'suspicious'
      ? ROAD_IMAGES.mumbaiPotholeAfterGenuine
      : ROAD_IMAGES.blrPotholeAfterGaming;

  // For suspicious, delta is ~28 meters (exceeds 15m threshold, causing SUSPICIOUS)
  const afterLat =
    activeScenario === 'genuine'
      ? currentPothole.latitude + 0.00003
      : activeScenario === 'suspicious'
      ? currentPothole.latitude + 0.00025
      : currentPothole.latitude - 0.0074;

  const afterLon =
    activeScenario === 'genuine'
      ? currentPothole.longitude + 0.00002
      : activeScenario === 'suspicious'
      ? currentPothole.longitude + 0.00018
      : currentPothole.longitude + 0.0076;

  const afterDesc =
    activeScenario === 'genuine'
      ? 'Excavated loose subgrade, applied RS-1 tack coat, filled with hot-mix dense bituminous macadam (DBM) and compacted flush with road level.'
      : activeScenario === 'suspicious'
      ? 'Patched road section with cold mix asphalt. Camera angle shifted due to active traffic congestion.'
      : 'Completed surface patch with asphalt mix on road.';

  // Result computation using RoadSetu AI engine
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Switch scenario handler
  const handleSelectScenario = (sc: 'genuine' | 'suspicious' | 'gaming') => {
    setActiveScenario(sc);
    setCurrentStep(1);
    setVerificationResult(null);
    setIsResolved(false);
    if (sc === 'genuine') {
      setContractorName('Ramesh Patel');
      setContractorCompany('InfraTech RoadWorks Pvt Ltd');
    } else if (sc === 'suspicious') {
      setContractorName('Sunil Varma');
      setContractorCompany('Capital City Civil Infrastructure');
    } else {
      setContractorName('Vikram Choudhury');
      setContractorCompany('Apex Urban Infrastructure Ltd');
    }
  };

  // Step 1: Assign Contractor
  const handleAssignContractor = () => {
    setCurrentStep(2);
  };

  // Step 2: Contractor Repair Upload
  const handleContractorUpload = () => {
    setCurrentStep(3);
  };

  // Step 3: AI Verification Execution
  const handleExecuteVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyRepairEvidence(currentPothole, afterPhotoUrl, afterLat, afterLon, afterDesc);
      setVerificationResult(result);
      setIsVerifying(false);
      setCurrentStep(4);
    }, 1100);
  };

  // Step 4: Resolve complaint action
  const handleMarkResolved = async () => {
    setIsResolved(true);
    if (onResolveComplaint) {
      await onResolveComplaint(currentPothole.potholeId);
    }
  };

  const handleResetWorkflow = () => {
    setCurrentStep(1);
    setVerificationResult(null);
    setIsResolved(false);
  };

  return (
    <div id="sample-verification-flow" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
      {/* Header and Scenario Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Interactive Sample Verification Walkthrough</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
            Sample Verification: Full Civic Workflow
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Follows the strict sequence: Citizen Complaint → Assign Contractor → Contractor Repair Upload → AI Verification → Result.
          </p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSelectScenario('genuine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeScenario === 'genuine'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Sample 1: Genuine Repair (🟢)
          </button>
          <button
            onClick={() => handleSelectScenario('suspicious')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeScenario === 'suspicious'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            Sample 2: Suspicious Repair (🟡)
          </button>
          <button
            onClick={() => handleSelectScenario('gaming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeScenario === 'gaming'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            Sample 3: Gaming Attempt (🔴)
          </button>
          <button
            onClick={handleResetWorkflow}
            title="Restart Workflow"
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workflow Navigation Bar */}
      <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 1
              ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-100'
              : currentStep > 1
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            Step 1
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assign Contractor</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 2
              ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold ring-2 ring-indigo-100'
              : currentStep > 2
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            Step 2
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <HardHat className="w-3.5 h-3.5" />
            <span>Contractor Repair Upload</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 3
              ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold ring-2 ring-sky-100'
              : currentStep > 3
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            Step 3
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Verification</span>
          </div>
        </div>

        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 4
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}
        >
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
            Step 4
          </div>
          <div className="text-xs font-bold mt-0.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Result</span>
          </div>
        </div>
      </div>

      {/* STEP 1: ASSIGN CONTRACTOR */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Workflow Step 1: Municipal Review &amp; Contractor Assignment</span>
              <p className="mt-0.5 text-blue-800">
                Citizen reported this pothole. Authority reviews severity and assigns an authorized contractor work order before repair can start.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Citizen Complaint Card */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="bg-slate-900 text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-between">
                <span>Citizen Complaint: {currentPothole.potholeId}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                  {currentPothole.severity} Severity
                </span>
              </div>
              <div className="aspect-16/10 bg-slate-950 relative">
                <img
                  src={currentPothole.beforeImageUrl}
                  alt="Original pothole"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-[10px] text-white font-mono">
                  {formatCoordinates(currentPothole.latitude, currentPothole.longitude)}
                </div>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-slate-900">{currentPothole.address}</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  "{currentPothole.description}"
                </p>
              </div>
            </div>

            {/* Contractor Assignment Action Form */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-700" />
                <span>Assign Contractor Work Order</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contractor Lead Engineer:
                </label>
                <input
                  type="text"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contracting Agency:
                </label>
                <input
                  type="text"
                  value={contractorCompany}
                  onChange={(e) => setContractorCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAssignContractor}
                  className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Contractor &amp; Dispatch Work Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CONTRACTOR REPAIR UPLOAD */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
            <HardHat className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Workflow Step 2: Contractor Repair Completion &amp; Evidence Upload</span>
              <p className="mt-0.5 text-indigo-800">
                Contractor has arrived on-site and completed repair work. Contractor uploads AFTER photo with live GPS coordinates and submits the repair claim.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Contractor Uploaded After Evidence Card */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="bg-slate-900 text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-between">
                <span>Contractor Submission Evidence</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500 text-white font-bold">
                  After Repair Photo
                </span>
              </div>
              <div className="aspect-16/10 bg-slate-950 relative">
                <img
                  src={afterPhotoUrl}
                  alt="Contractor after repair evidence"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-[10px] text-white font-mono">
                  {formatCoordinates(afterLat, afterLon)}
                </div>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  Assigned Contractor: {contractorCompany} ({contractorName})
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  "{afterDesc}"
                </p>
              </div>
            </div>

            {/* Submission Telemetry Form */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-700" />
                <span>Contractor Repair Claim</span>
              </h3>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                <strong>Civic Constraint:</strong> Uploading repair evidence does <strong>NOT</strong> make the complaint RESOLVED. Status is set to <em>"Repair Claimed"</em> pending AI spatial verification.
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Complaint ID:</span>
                  <span className="font-mono font-bold text-slate-900">{currentPothole.potholeId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Location GPS:</span>
                  <span className="font-mono text-slate-900">{formatCoordinates(afterLat, afterLon)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Materials Used:</span>
                  <span className="font-medium text-slate-900">Bituminous Dense Macadam, VG-30</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleContractorUpload}
                  className="w-full py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <HardHat className="w-4 h-4" />
                  <span>Submit Contractor Repair Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: AI VERIFICATION */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Workflow Step 3: RoadSetu AI Automated Spatial Verification</span>
              <p className="mt-0.5 text-sky-800">
                RoadSetu AI compares the original citizen image with the contractor&apos;s repair evidence across 7 spatial, geometric, and visual signals.
              </p>
            </div>
          </div>

          {/* Side-by-side comparison preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 text-white">
              <div className="px-3.5 py-2 text-xs font-semibold bg-slate-950 flex justify-between">
                <span className="text-sky-300">BEFORE: Citizen Original</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatCoordinates(currentPothole.latitude, currentPothole.longitude)}
                </span>
              </div>
              <div className="aspect-16/10 flex items-center justify-center">
                <img
                  src={currentPothole.beforeImageUrl}
                  alt="Original citizen evidence"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900 text-white">
              <div className="px-3.5 py-2 text-xs font-semibold bg-slate-950 flex justify-between">
                <span className="text-emerald-300">AFTER: Contractor Evidence</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatCoordinates(afterLat, afterLon)}
                </span>
              </div>
              <div className="aspect-16/10 flex items-center justify-center">
                <img
                  src={afterPhotoUrl}
                  alt="Contractor repair evidence"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* 7 AI Checks Grid */}
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <div className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Factor AI Checks to be Executed:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-[11px]">
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">1. GPS/location</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">2. Pothole/damaged region</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">3. Camera viewpoint</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">4. Background/landmarks</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">5. Road surface</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">6. Timestamp</div>
              <div className="p-2 rounded bg-slate-800 text-slate-200 font-medium">7. Visual repair evidence</div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={handleExecuteVerification}
              disabled={isVerifying}
              className="px-8 py-3.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-sky-200" />
                  <span>Analyzing 7 Spatial &amp; CV Signals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>Execute RoadSetu AI Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: VERIFICATION RESULT */}
      {currentStep === 4 && verificationResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Card: 🟢 REPAIR VERIFIED, 🟡 SUSPICIOUS REPAIR, or 🔴 VERIFICATION FAILED */}
          {verificationResult.verificationStatus === 'VERIFIED' ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-emerald-950">
                        🟢 REPAIR VERIFIED
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2.5 py-0.5 rounded-full">
                        {verificationResult.overallVerificationScore.toFixed(1)}% Confidence
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-900 mt-1">
                      → Same pothole appears repaired.
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      Coordinates delta ({formatDistance(verificationResult.distanceMeters)}) within civic tolerance (≤ 15.0m).
                      Surrounding landmarks match and fresh bituminous compaction is verified flush with road grade.
                    </p>
                    <div className="mt-2 text-xs font-extrabold text-emerald-950">
                      → Complaint can then become RESOLVED.
                    </div>
                  </div>
                </div>

                {/* Mark as Resolved button */}
                <div className="shrink-0 sm:text-right">
                  {isResolved ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Status: RESOLVED</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkResolved}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Complaint as RESOLVED</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : verificationResult.verificationStatus === 'SUSPICIOUS' ? (
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-500 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-amber-950">
                      🟡 SUSPICIOUS REPAIR
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                      Borderline Match
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-900 mt-1">
                    → Evidence does not sufficiently match.
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Coordinates or background landmarks show ambiguity. Payout is held.
                  </p>
                  <div className="mt-2 text-xs font-extrabold text-amber-950">
                    → Keep complaint open for authority review.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-rose-950">
                      🔴 VERIFICATION FAILED
                    </span>
                    <span className="text-xs font-bold text-rose-900 bg-rose-200 px-2.5 py-0.5 rounded-full">
                      Contractor Gaming Flagged
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-rose-900 mt-1">
                    → Invalid/unrelated evidence
                  </p>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    Distance delta is {formatDistance(verificationResult.distanceMeters)} (critical mismatch exceeding 15.0m threshold).
                    Background landmarks (residential wall vs commercial glass towers) fail completely.
                  </p>
                  <div className="mt-2 text-xs font-extrabold text-rose-950">
                    → Do NOT mark as resolved
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Scorecard Details */}
          <VerificationScorecard result={verificationResult} />

          {/* Actions to re-run or inspect */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleResetWorkflow}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart Sample Workflow</span>
            </button>

            {onViewDetails && (
              <button
                onClick={() => onViewDetails(currentPothole.potholeId)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Inspect Case in Civic Portal
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
