export type UserRole = 'citizen' | 'authority' | 'contractor';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  agencyOrCompany?: string;
  createdAt: string;
  updatedAt: string;
}

export type PotholeSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type PotholeStatus =
  | 'Reported'
  | 'Assigned'
  | 'Repair In Progress'
  | 'Repair Claimed'
  | 'AI Verification'
  | 'Verification In Progress'
  | 'Verified'
  | 'Resolved'
  | 'Suspicious'
  | 'Failed'
  | 'Reinspection Required';

export interface CaptureMetadata {
  captureSource: 'device_camera' | 'file_upload';
  accuracyMeters?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  deviceTimestamp: string;
  userAgent?: string;
  aspectRatio?: string;
}

// Engine 1: Road Damage Validation Result
export interface ImageValidationResult {
  isValid: boolean;
  confidence: number; // 0 - 100
  roadSurfaceDetected: boolean;
  potholeOrDamageDetected: boolean;
  repairSceneDetected?: boolean;
  detectedDamageType?: 'Pothole' | 'Surface Cavity' | 'Bituminous Patch' | 'Unrelated Object' | 'Unknown';
  message: string;
  evaluatedAt: string;
}

// Engine 2: Duplicate Complaint Intelligence
export interface DuplicateMatch {
  potholeId: string;
  overallDuplicateScore: number; // 0 - 100 (40% loc, 30% semantic, 20% visual, 10% time)
  locationSimilarity: number;    // 0 - 100 (40% weight)
  semanticSimilarity: number;    // 0 - 100 (30% weight)
  visualSimilarity: number;      // 0 - 100 (20% weight)
  timeProximity: number;         // 0 - 100 (10% weight)
  distanceMeters: number;
  address: string;
  description: string;
  severity: PotholeSeverity;
  beforeImageUrl: string;
  status: PotholeStatus;
  clusterId?: string;
}

// Complaint Cluster (Multi-citizen grouping)
export interface ComplaintCluster {
  clusterId: string; // e.g. "CLUSTER-42"
  name: string;      // e.g. "Pothole Cluster #42"
  area: string;      // e.g. "Thane West, SV Road Corridor"
  severity: PotholeSeverity;
  primaryPotholeId: string;
  linkedPotholeIds: string[];
  reportCount: number;
  latitude: number;
  longitude: number;
  summary: string;
  status: PotholeStatus;
  createdAt: string;
}

export interface VerificationScores {
  potholeRegionScore: number;       // 0 - 100
  gpsScore: number;                 // 0 - 100
  viewpointScore: number;           // 0 - 100
  backgroundMatchScore: number;     // 0 - 100
  repairEvidenceScore: number;      // 0 - 100
  evidenceQualityScore: number;     // 0 - 100
  overallVerificationScore: number; // 0 - 100
}

export interface VerificationFactorDetail {
  factor: string;
  score: number;
  passed: boolean;
  notes: string;
}

export interface VerificationResult extends VerificationScores {
  verificationId: string;
  potholeId: string;
  verificationStatus: 'VERIFIED' | 'SUSPICIOUS' | 'FAILED' | 'REINSPECTION REQUIRED';
  explanation: string;
  factorDetails: VerificationFactorDetail[];
  distanceMeters: number;
  distanceAcceptable: boolean;
  analyzedAt: string;
  modelUsed: string;
  isDemonstrationMode?: boolean;
  beforeValidation?: ImageValidationResult;
  afterValidation?: ImageValidationResult;
}

export interface ActivityEvent {
  eventId: string;
  potholeId: string;
  eventType:
    | 'REPORTED'
    | 'ASSIGNED'
    | 'REPAIR_STARTED'
    | 'REPAIR_CLAIMED'
    | 'AI_VERIFICATION'
    | 'VERIFICATION_STARTED'
    | 'VERIFIED'
    | 'SUSPICIOUS'
    | 'FAILED'
    | 'REINSPECTION_REQUESTED'
    | 'DISPUTE_RAISED'
    | 'RESOLVED';
  performedBy: {
    uid: string;
    name: string;
    role: UserRole;
  };
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PotholeRecord {
  potholeId: string; // e.g. PTH-MUM-2026-00142
  complaintId?: string; // requested alias for potholeId
  citizenId?: string; // requested citizenId
  citizenName?: string; // requested citizenName
  reportedBy: {
    uid: string;
    name: string;
    email?: string;
  };
  description: string;
  severity: PotholeSeverity;
  latitude: number;
  longitude: number;
  address: string;
  location?: string; // requested location/address alias
  landmark?: string;
  
  // Original immutable evidence
  beforeImageUrl: string;
  originalImage?: string; // requested alias for beforeImageUrl
  beforeTimestamp: string;
  beforeCaptureMetadata: CaptureMetadata;

  // Workflow state
  status: PotholeStatus;
  assignedAuthority?: {
    uid: string;
    name: string;
    department: string;
  };
  assignedContractor?: {
    uid: string;
    name: string;
    company: string;
  };
  contractorId?: string; // requested contractorId
  contractorName?: string; // requested contractorName

  // Contractor submitted repair evidence
  afterImageUrl?: string;
  repairImage?: string; // requested alias for afterImageUrl
  afterTimestamp?: string;
  afterLatitude?: number;
  afterLongitude?: number;
  afterAddress?: string;
  afterCaptureMetadata?: CaptureMetadata;
  repairDescription?: string;
  materialsUsed?: string;

  // Verification
  verification?: VerificationResult;
  verificationResult?: VerificationResult; // requested alias for verification

  // Road Damage Validation
  beforeValidation?: ImageValidationResult;
  afterValidation?: ImageValidationResult;

  // Duplicate Clustering Intelligence
  clusterId?: string;
  linkedReportsCount?: number;
  linkedReportIds?: string[];

  // Citizen disputes
  disputeReason?: string;
  disputeDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  scenarioType: 'genuine' | 'gaming';
  expectedResult: 'VERIFIED' | 'REINSPECTION REQUIRED';
  summary: string;
  pothole: PotholeRecord;
}
