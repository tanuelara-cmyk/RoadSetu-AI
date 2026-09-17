import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  PotholeRecord,
  ActivityEvent,
  UserProfile,
  VerificationResult,
  PotholeStatus,
  PotholeSeverity,
} from '../types';

/**
 * Normalizes Firestore raw doc to full PotholeRecord
 */
export function normalizeComplaint(docData: any, id: string): PotholeRecord {
  const potholeId = docData.complaintId || docData.potholeId || id;
  const citizenId = docData.citizenId || docData.reportedBy?.uid || '';
  const citizenName = docData.citizenName || docData.reportedBy?.name || 'Citizen';
  const address = docData.address || docData.location || 'Reported Civic Location';
  const originalImage = docData.originalImage || docData.beforeImageUrl || '';
  const repairImage = docData.repairImage || docData.afterImageUrl || '';

  return {
    potholeId,
    complaintId: potholeId,
    citizenId,
    citizenName,
    reportedBy: docData.reportedBy || {
      uid: citizenId,
      name: citizenName,
      email: docData.reportedBy?.email || '',
    },
    description: docData.description || '',
    severity: (docData.severity as PotholeSeverity) || 'Medium',
    latitude: typeof docData.latitude === 'number' ? docData.latitude : 19.0596,
    longitude: typeof docData.longitude === 'number' ? docData.longitude : 72.8295,
    address,
    location: address,
    landmark: docData.landmark || '',
    beforeImageUrl: originalImage,
    originalImage,
    beforeTimestamp: docData.beforeTimestamp || docData.createdAt || new Date().toISOString(),
    beforeCaptureMetadata: docData.beforeCaptureMetadata || {
      captureSource: 'device_camera',
      deviceTimestamp: docData.createdAt || new Date().toISOString(),
    },
    status: (docData.status as PotholeStatus) || 'Reported',
    assignedAuthority: docData.assignedAuthority,
    assignedContractor: docData.assignedContractor,
    contractorId: docData.contractorId || docData.assignedContractor?.uid || '',
    contractorName: docData.contractorName || docData.assignedContractor?.name || '',
    afterImageUrl: repairImage,
    repairImage,
    afterLatitude: docData.afterLatitude,
    afterLongitude: docData.afterLongitude,
    afterTimestamp: docData.afterTimestamp,
    afterAddress: docData.afterAddress || address,
    afterCaptureMetadata: docData.afterCaptureMetadata,
    repairDescription: docData.repairDescription,
    materialsUsed: docData.materialsUsed,
    verification: docData.verification || docData.verificationResult,
    verificationResult: docData.verificationResult || docData.verification,
    createdAt: docData.createdAt || new Date().toISOString(),
    updatedAt: docData.updatedAt || new Date().toISOString(),
  };
}

/**
 * Subscribe to all complaints in real-time
 */
export function subscribeComplaints(
  onData: (complaints: PotholeRecord[]) => void,
  onError?: (error: Error) => void
) {
  const complaintsRef = collection(db, 'potholes');
  return onSnapshot(
    complaintsRef,
    (snapshot) => {
      const list: PotholeRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(normalizeComplaint(docSnap.data(), docSnap.id));
      });
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(list);
    },
    (err) => {
      console.warn('Firestore subscribeComplaints fallback note:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribe to complaints based on role
 */
export function subscribeToComplaints(
  userProfile: UserProfile | null,
  onData: (complaints: PotholeRecord[]) => void,
  onError?: (error: Error) => void
) {
  if (!userProfile) {
    onData([]);
    return () => {};
  }

  const complaintsRef = collection(db, 'potholes');
  let q;

  if (userProfile.role === 'citizen') {
    // Citizens must only see their own complaints
    q = query(complaintsRef, where('citizenId', '==', userProfile.uid));
  } else if (userProfile.role === 'contractor') {
    // Contractors only see complaints assigned to them
    q = query(complaintsRef, where('contractorId', '==', userProfile.uid));
  } else {
    // Authority sees all
    q = query(complaintsRef);
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const list: PotholeRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push(normalizeComplaint(data, docSnap.id));
      });

      // Sort newest first
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onData(list);
    },
    (err) => {
      console.error('Firestore subscribeToComplaints error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Record immutable Civic Audit Trail event
 */
export async function recordAuditEvent(
  potholeId: string,
  eventType: ActivityEvent['eventType'],
  performedBy: { uid: string; name: string; role: any },
  description: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const eventDocRef = doc(db, 'events', eventId);
    const eventData: ActivityEvent = {
      eventId,
      potholeId,
      eventType,
      performedBy,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    };
    await setDoc(eventDocRef, eventData);
  } catch (err) {
    console.error('Failed to record audit event in Firestore:', err);
  }
}

/**
 * Subscribe to immutable civic audit events for a complaint
 */
export function subscribeToComplaintEvents(
  potholeId: string,
  onData: (events: ActivityEvent[]) => void
) {
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('potholeId', '==', potholeId));

  return onSnapshot(
    q,
    (snapshot) => {
      const eventsList: ActivityEvent[] = [];
      snapshot.forEach((docSnap) => {
        eventsList.push(docSnap.data() as ActivityEvent);
      });
      eventsList.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      onData(eventsList);
    },
    (err) => {
      console.warn('Events subscription issue:', err);
      onData([]);
    }
  );
}

/**
 * Create a new complaint by Citizen
 */
export async function createComplaintInFirestore(
  complaintData: {
    citizenId?: string;
    citizenName?: string;
    citizenEmail?: string;
    description: string;
    severity: PotholeSeverity;
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
    originalImage?: string;
    beforeImageUrl?: string;
    beforeCaptureMetadata?: any;
    reporterName?: string;
    reporterEmail?: string;
    clusterId?: string;
  },
  citizenUidParam?: string,
  citizenNameParam?: string
): Promise<PotholeRecord> {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const complaintId = `PTH-2026-${randomSuffix}`;

  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  const citizenId = complaintData.citizenId || citizenUidParam || 'citizen_anon';
  const citizenName = complaintData.citizenName || citizenNameParam || complaintData.reporterName || 'Citizen Reporter';
  const citizenEmail = complaintData.citizenEmail || complaintData.reporterEmail || '';
  const image = complaintData.originalImage || complaintData.beforeImageUrl || '';

  const record: PotholeRecord = {
    complaintId,
    potholeId: complaintId,
    citizenId,
    citizenName,
    reportedBy: {
      uid: citizenId,
      name: citizenName,
      email: citizenEmail,
    },
    description: complaintData.description,
    severity: complaintData.severity,
    latitude: complaintData.latitude,
    longitude: complaintData.longitude,
    address: complaintData.address,
    location: complaintData.address,
    landmark: complaintData.landmark || '',
    beforeImageUrl: image,
    originalImage: image,
    beforeTimestamp: now,
    beforeCaptureMetadata: complaintData.beforeCaptureMetadata || {
      captureSource: 'device_camera',
      deviceTimestamp: now,
      accuracyMeters: 4.5,
      aspectRatio: '4:3',
    },
    status: 'Reported',
    contractorId: '',
    contractorName: '',
    repairImage: '',
    afterImageUrl: '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, record);

  // Record audit event
  await recordAuditEvent(
    complaintId,
    'REPORTED',
    {
      uid: citizenId,
      name: citizenName,
      role: 'citizen',
    },
    `Citizen filed complaint ${complaintId} at ${complaintData.address}`
  );

  return record;
}

/**
 * Authority assigns complaint to Contractor
 */
export async function assignContractorInFirestore(
  complaintId: string,
  contractorOrName: { uid?: string; name: string; company: string } | string,
  authorityUserOrCompany?: any,
  authorityNameParam?: string,
  authorityIdParam?: string
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  let contractorUid = `CTR-${Date.now().toString().slice(-4)}`;
  let contractorName = 'Authorized Contractor';
  let contractorCompany = 'Civil Infrastructure Partner';
  let authorityName = 'Municipal Authority Official';
  let authorityUid = 'AUTH-CIVIC-DIRECT';

  if (typeof contractorOrName === 'string') {
    contractorName = contractorOrName;
    if (typeof authorityUserOrCompany === 'string') {
      contractorCompany = authorityUserOrCompany;
    }
    if (authorityNameParam) authorityName = authorityNameParam;
    if (authorityIdParam) authorityUid = authorityIdParam;
  } else if (contractorOrName && typeof contractorOrName === 'object') {
    contractorUid = contractorOrName.uid || contractorUid;
    contractorName = contractorOrName.name;
    contractorCompany = contractorOrName.company;
    if (authorityUserOrCompany) {
      authorityName = authorityUserOrCompany.name || authorityName;
      authorityUid = authorityUserOrCompany.uid || authorityUid;
    }
  }

  const assignedContractorObj = {
    contractorId: contractorUid,
    uid: contractorUid,
    name: contractorName,
    company: contractorCompany,
    contactPhone: '+91 98200 44512',
    allocatedAt: now,
  };

  await updateDoc(docRef, {
    status: 'Assigned',
    contractorId: contractorUid,
    contractorName: contractorName,
    assignedContractor: assignedContractorObj,
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'ASSIGNED',
    {
      uid: authorityUid,
      name: authorityName,
      role: 'authority',
    },
    `Municipal Authority assigned work order to contractor: ${contractorName} (${contractorCompany})`
  );
}

/**
 * Contractor marks repair in progress
 */
export async function startRepairInFirestore(
  complaintId: string,
  contractorUser: UserProfile
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status: 'Repair In Progress',
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'REPAIR_STARTED',
    {
      uid: contractorUser.uid,
      name: contractorUser.name,
      role: 'contractor',
    },
    `Contractor initiated physical road repair operations`
  );
}

/**
 * Contractor uploads AFTER repair image and submits claim
 */
export async function submitContractorRepairInFirestore(
  complaintId: string,
  repairData: {
    repairImage: string;
    afterLatitude: number;
    afterLongitude: number;
    afterAddress: string;
    repairDescription: string;
    materialsUsed: string;
  },
  contractorUser: UserProfile
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status: 'Repair Claimed',
    repairImage: repairData.repairImage,
    afterImageUrl: repairData.repairImage,
    afterLatitude: repairData.afterLatitude,
    afterLongitude: repairData.afterLongitude,
    afterAddress: repairData.afterAddress,
    afterTimestamp: now,
    repairDescription: repairData.repairDescription,
    materialsUsed: repairData.materialsUsed,
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'REPAIR_CLAIMED',
    {
      uid: contractorUser.uid,
      name: contractorUser.name,
      role: 'contractor',
    },
    `Contractor uploaded repair photographic evidence and submitted completion claim`
  );
}

/**
 * Save AI Verification Result to Firestore
 */
export async function saveVerificationResultInFirestore(
  complaintId: string,
  result: VerificationResult,
  performingUser: UserProfile
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  // Determine complaint status according to workflow:
  // Verified -> Resolved (or Verified if awaiting authority closeout)
  // Suspicious -> Suspicious (Authority Review)
  // Failed -> Failed (Verification Failed)
  let nextStatus: PotholeStatus = 'Verified';
  if (result.verificationStatus === 'SUSPICIOUS') {
    nextStatus = 'Suspicious';
  } else if (result.verificationStatus === 'FAILED') {
    nextStatus = 'Failed';
  } else if (result.verificationStatus === 'VERIFIED') {
    nextStatus = 'Verified';
  }

  await updateDoc(docRef, {
    status: nextStatus,
    verification: result,
    verificationResult: result,
    updatedAt: now,
  });

  // Save in verification collection
  try {
    const vDocRef = doc(db, 'verification', result.verificationId || `VR-${Date.now()}`);
    await setDoc(vDocRef, {
      ...result,
      potholeId: complaintId,
      createdAt: now,
    });
  } catch (err) {
    console.warn('Verification collection write skipped:', err);
  }

  // Record audit trail event
  const eventType: ActivityEvent['eventType'] =
    result.verificationStatus === 'VERIFIED'
      ? 'VERIFIED'
      : result.verificationStatus === 'SUSPICIOUS'
      ? 'SUSPICIOUS'
      : 'FAILED';

  await recordAuditEvent(
    complaintId,
    eventType,
    {
      uid: performingUser.uid,
      name: `RoadSetu AI Engine (${performingUser.name})`,
      role: performingUser.role,
    },
    `AI Verification Completed: [${result.verificationStatus}] - Score ${result.overallVerificationScore.toFixed(
      1
    )}%. ${result.explanation}`
  );
}

/**
 * Authority resolves complaint after verified repair
 */
export async function resolveComplaintInFirestore(
  complaintId: string,
  authorityUserOrName: UserProfile | string
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  let authorityName = 'Municipal Authority Official';
  let authorityUid = 'AUTH-CIVIC-DIRECT';
  let authorityRole = 'authority';

  if (typeof authorityUserOrName === 'string') {
    authorityName = authorityUserOrName;
  } else if (authorityUserOrName) {
    authorityName = authorityUserOrName.name || authorityName;
    authorityUid = authorityUserOrName.uid || authorityUid;
    authorityRole = authorityUserOrName.role || authorityRole;
  }

  await updateDoc(docRef, {
    status: 'Resolved',
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'RESOLVED',
    {
      uid: authorityUid,
      name: authorityName,
      role: authorityRole,
    },
    `Complaint officially marked as RESOLVED by ${authorityName}`
  );
}

/**
 * Submit repair claim from contractor
 */
export async function submitRepairClaimInFirestore(
  complaintId: string,
  claimData: {
    afterImageUrl: string;
    afterLatitude: number;
    afterLongitude: number;
    afterAddress?: string;
    repairDescription: string;
    materialsUsed: string;
  },
  contractorName: string = 'Contractor Partner',
  contractorCompany: string = 'Civil Roadworks Pvt Ltd'
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status: 'Repair Claimed',
    repairImage: claimData.afterImageUrl,
    afterImageUrl: claimData.afterImageUrl,
    afterLatitude: claimData.afterLatitude,
    afterLongitude: claimData.afterLongitude,
    afterAddress: claimData.afterAddress || '',
    afterTimestamp: now,
    repairDescription: claimData.repairDescription,
    materialsUsed: claimData.materialsUsed,
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'REPAIR_CLAIMED',
    {
      uid: `CTR-${Date.now().toString().slice(-4)}`,
      name: contractorName,
      role: 'contractor',
    },
    `Contractor (${contractorCompany}) uploaded repair photographic evidence and lodged claim`
  );
}

/**
 * Record AI verification scorecard in Firestore
 */
export async function recordAiVerificationInFirestore(
  complaintId: string,
  result: VerificationResult
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  let nextStatus: PotholeStatus = 'Verified';
  if (result.verificationStatus === 'SUSPICIOUS') {
    nextStatus = 'Suspicious';
  } else if (result.verificationStatus === 'FAILED') {
    nextStatus = 'Failed';
  } else if (result.verificationStatus === 'VERIFIED') {
    nextStatus = 'Verified';
  }

  await updateDoc(docRef, {
    status: nextStatus,
    verification: result,
    verificationResult: result,
    updatedAt: now,
  });

  const eventType: ActivityEvent['eventType'] =
    result.verificationStatus === 'VERIFIED'
      ? 'VERIFIED'
      : result.verificationStatus === 'SUSPICIOUS'
      ? 'SUSPICIOUS'
      : 'FAILED';

  await recordAuditEvent(
    complaintId,
    eventType,
    {
      uid: 'AI-ENGINE-GEMINI',
      name: 'RoadSetu AI Verification Engine',
      role: 'authority',
    },
    `AI Verification Completed: [${result.verificationStatus}] - Score ${result.overallVerificationScore.toFixed(
      1
    )}%. ${result.explanation}`
  );
}

/**
 * Submit citizen dispute
 */
export async function submitDisputeInFirestore(
  complaintId: string,
  reason: string,
  citizenName: string = 'Citizen Reporter'
): Promise<void> {
  const docRef = doc(db, 'potholes', complaintId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status: 'Reinspection Required',
    disputeReason: reason,
    updatedAt: now,
  });

  await recordAuditEvent(
    complaintId,
    'REINSPECTION_REQUESTED',
    {
      uid: 'CITIZEN-DISPUTE',
      name: citizenName,
      role: 'citizen',
    },
    `Citizen lodged dispute: "${reason}". Escalated for authority reinspection.`
  );
}

/**
 * Fetch list of registered contractors from Firestore
 */
export async function fetchContractorsFromFirestore(): Promise<
  { uid: string; name: string; company: string; email: string }[]
> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'contractor'));
    const snapshot = await getDocs(q);

    const contractors: { uid: string; name: string; company: string; email: string }[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      contractors.push({
        uid: docSnap.id,
        name: data.name || 'Contractor',
        company: data.agencyOrCompany || data.company || 'Urban Road Works Co.',
        email: data.email || '',
      });
    });

    if (contractors.length > 0) {
      return contractors;
    }
  } catch (err) {
    console.warn('Failed to fetch contractors query:', err);
  }

  // Default known registered contractor partners if none registered yet
  return [
    {
      uid: 'contractor_ramesh_patel',
      name: 'Ramesh Patel',
      company: 'InfraTech RoadWorks Pvt Ltd',
      email: 'ramesh.patel@infratech.in',
    },
    {
      uid: 'contractor_sunil_varma',
      name: 'Sunil Varma',
      company: 'Capital City Civil Infrastructure',
      email: 'sunil.varma@capitalcivil.in',
    },
    {
      uid: 'contractor_vikram_c',
      name: 'Vikram Choudhury',
      company: 'Apex Urban Infrastructure Ltd',
      email: 'vikram.c@apexinfra.in',
    },
  ];
}
