import React, { useState, useEffect } from 'react';
import {
  PotholeRecord,
  ActivityEvent,
  UserRole,
  VerificationResult,
  CaptureMetadata,
  ComplaintCluster,
} from './types';
import { DEMO_POTHOLES, DEMO_EVENTS } from './data/seedData';
import { useAuth } from './context/AuthContext';
import {
  subscribeComplaints,
  assignContractorInFirestore,
  submitRepairClaimInFirestore,
  recordAiVerificationInFirestore,
  resolveComplaintInFirestore,
  submitDisputeInFirestore,
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { ComplaintClusterModal } from './components/ComplaintClusterModal';
import { LandingPage } from './views/LandingPage';
import { ReportPotholePage } from './views/ReportPotholePage';
import { TrackSearchPage } from './views/TrackSearchPage';
import { PotholeDetailPage } from './views/PotholeDetailPage';
import { AuthorityDashboard } from './views/AuthorityDashboard';
import { CitizenDashboard } from './views/CitizenDashboard';
import { ContractorDashboard } from './views/ContractorDashboard';
import { ContractorClaimPage } from './views/ContractorClaimPage';
import { VerificationPage } from './views/VerificationPage';
import { Footer } from './components/Footer';

export default function App() {
  const { currentUser, userProfile } = useAuth();

  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeView, setActiveView] = useState<string>('landing');
  const [selectedPotholeId, setSelectedPotholeId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ComplaintCluster | null>(null);

  const [potholes, setPotholes] = useState<PotholeRecord[]>(DEMO_POTHOLES);
  const [eventsMap, setEventsMap] = useState<Record<string, ActivityEvent[]>>(DEMO_EVENTS);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync role whenever user profile updates
  useEffect(() => {
    if (userProfile?.role) {
      setCurrentRole(userProfile.role);
    }
  }, [userProfile?.role]);

  // Subscribe to real-time Firestore complaints
  useEffect(() => {
    const unsubscribe = subscribeComplaints((firestoreList) => {
      if (firestoreList && firestoreList.length > 0) {
        setPotholes(firestoreList);
      }
    });

    // Also fetch from API endpoint as secondary source
    fetch('/api/potholes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.potholes && data.potholes.length > 0) {
          setPotholes((prev) => (prev.length > 0 ? prev : data.potholes));
        }
      })
      .catch((err) => console.warn('API fetch fallback note:', err));

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadEvents = async (potholeId: string) => {
    try {
      const res = await fetch(`/api/potholes/${potholeId}/events`);
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEventsMap((prev) => ({ ...prev, [potholeId]: data.events }));
        }
      }
    } catch (err) {
      console.warn('Events fallback:', err);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Find currently selected pothole
  const activePothole =
    potholes.find(
      (p) => (p.complaintId || p.potholeId) === selectedPotholeId || p.potholeId === selectedPotholeId
    ) ||
    potholes[0] ||
    DEMO_POTHOLES[0];

  const activeEvents =
    (selectedPotholeId && eventsMap[selectedPotholeId]) ||
    eventsMap[activePothole.potholeId] ||
    [];

  // Navigation helper
  const handleNavigate = (view: string, potholeId?: string) => {
    if (potholeId) {
      setSelectedPotholeId(potholeId);
      loadEvents(potholeId);
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Citizen creates complaint
  const handleReportCreated = (newPothole: PotholeRecord) => {
    setPotholes((prev) => [newPothole, ...prev.filter((p) => p.potholeId !== newPothole.potholeId)]);
    const targetId = newPothole.complaintId || newPothole.potholeId;
    setSelectedPotholeId(targetId);
    loadEvents(targetId);
    showToast(`Complaint registered permanently: ${targetId}`);
  };

  // Authority assigns contractor
  const handleAssignContractor = async (potholeId: string, name: string, company: string) => {
    const authorityName = userProfile?.name || currentUser?.displayName || 'Municipal Authority Official';
    const authorityId = currentUser?.uid;

    try {
      // 1. Update Firestore
      await assignContractorInFirestore(potholeId, name, company, authorityName, authorityId);

      // 2. Also notify backend API
      fetch(`/api/potholes/${potholeId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorName: name, company }),
      }).catch((e) => console.warn(e));

      // Local state update for instant UI feedback
      setPotholes((prev) =>
        prev.map((p) =>
          (p.complaintId || p.potholeId) === potholeId || p.potholeId === potholeId
            ? {
                ...p,
                status: 'Assigned',
                assignedContractor: {
                  contractorId: `CTR-${Date.now().toString().slice(-4)}`,
                  name,
                  company,
                  contactPhone: '+91 98200 44512',
                  allocatedAt: new Date().toISOString(),
                },
              }
            : p
        )
      );

      loadEvents(potholeId);
      showToast(`Contractor ${name} (${company}) assigned to ${potholeId}`);
    } catch (err: any) {
      console.error(err);
      showToast(`Error assigning contractor: ${err.message}`);
    }
  };

  // Contractor submits repair claim
  const handleSubmitClaim = async (
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
  ) => {
    const contractorName = userProfile?.name || currentUser?.displayName || 'Authorized Contractor';
    const contractorCompany = userProfile?.agency || 'Civil Roadworks Pvt Ltd';

    try {
      // 1. Update Firestore
      await submitRepairClaimInFirestore(potholeId, claimData, contractorName, contractorCompany);

      // 2. Notify backend API
      fetch(`/api/potholes/${potholeId}/claim-repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData),
      }).catch((e) => console.warn(e));

      // Local state update
      setPotholes((prev) =>
        prev.map((p) =>
          (p.complaintId || p.potholeId) === potholeId || p.potholeId === potholeId
            ? {
                ...p,
                status: 'Repair Claimed',
                afterImageUrl: claimData.afterImageUrl,
                afterLatitude: claimData.afterLatitude,
                afterLongitude: claimData.afterLongitude,
                afterAddress: claimData.afterAddress,
                repairDescription: claimData.repairDescription,
                materialsUsed: claimData.materialsUsed,
              }
            : p
        )
      );

      loadEvents(potholeId);
      showToast(`Repair claim submitted for ${potholeId}. Status: Repair Claimed.`);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Run AI Verification
  const handleRunVerification = async (potholeId: string): Promise<VerificationResult> => {
    const res = await fetch(`/api/potholes/${potholeId}/verify`, {
      method: 'POST',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to run AI verification');
    }

    const data = await res.json();
    const verification: VerificationResult = data.verification;

    // Record verification to Firestore
    try {
      await recordAiVerificationInFirestore(potholeId, verification);
    } catch (err) {
      console.warn('Firestore verification sync:', err);
    }

    setPotholes((prev) =>
      prev.map((p) =>
        (p.complaintId || p.potholeId) === potholeId || p.potholeId === potholeId
          ? {
              ...p,
              verification,
              status:
                verification.verificationStatus === 'VERIFIED'
                  ? 'Verified'
                  : verification.verificationStatus === 'SUSPICIOUS'
                  ? 'Suspicious'
                  : 'Failed',
            }
          : p
      )
    );

    loadEvents(potholeId);
    showToast(
      `AI Verification Result: ${verification.verificationStatus} (${verification.overallVerificationScore.toFixed(1)}%)`
    );
    return verification;
  };

  // Citizen dispute
  const handleDisputeSubmitted = async (potholeId: string, reason: string) => {
    const citizenName = userProfile?.name || currentUser?.displayName || 'Citizen Reporter';

    try {
      await submitDisputeInFirestore(potholeId, reason, citizenName);

      fetch(`/api/potholes/${potholeId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeReason: reason, reason }),
      }).catch((e) => console.warn(e));

      setPotholes((prev) =>
        prev.map((p) =>
          (p.complaintId || p.potholeId) === potholeId || p.potholeId === potholeId
            ? { ...p, status: 'Reinspection Required' }
            : p
        )
      );

      loadEvents(potholeId);
      showToast(`Dispute lodged for ${potholeId}. Status escalated for municipal reinspection.`);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Official resolution
  const handleResolvePothole = async (potholeId: string) => {
    const authorityName = userProfile?.name || currentUser?.displayName || 'Municipal Authority Official';

    try {
      await resolveComplaintInFirestore(potholeId, authorityName);

      fetch(`/api/potholes/${potholeId}/resolve`, {
        method: 'POST',
      }).catch((e) => console.warn(e));

      setPotholes((prev) =>
        prev.map((p) =>
          (p.complaintId || p.potholeId) === potholeId || p.potholeId === potholeId
            ? { ...p, status: 'Resolved' }
            : p
        )
      );

      loadEvents(potholeId);
      showToast(`Case ${potholeId} officially approved and resolved.`);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Civic Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeView={activeView}
        setActiveView={(view) => handleNavigate(view)}
      />

      {/* Floating System Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm p-4 bg-slate-900/95 text-white text-xs rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
          <span className="leading-relaxed">{notification}</span>
        </div>
      )}

      {/* Main Routed Content */}
      <main className="flex-1 pb-16">
        {activeView === 'landing' && (
          <LandingPage
            potholes={potholes}
            onNavigate={handleNavigate}
            onResolveComplaint={handleResolvePothole}
          />
        )}

        {activeView === 'report' && (
          <ReportPotholePage
            potholes={potholes}
            existingPotholes={potholes}
            onReportCreated={handleReportCreated}
            onNavigate={handleNavigate}
          />
        )}

        {activeView === 'track' && (
          <TrackSearchPage
            potholes={potholes}
            onSelectPothole={(id) => handleNavigate('detail', id)}
          />
        )}

        {activeView === 'citizen-dashboard' && (
          <CitizenDashboard
            complaints={potholes}
            potholes={potholes}
            onNavigate={handleNavigate}
            onSelectPothole={(id) => handleNavigate('detail', id)}
            onNavigateToReport={() => handleNavigate('report')}
          />
        )}

        {activeView === 'contractor-dashboard' && (
          <ContractorDashboard
            complaints={potholes}
            potholes={potholes}
            onNavigate={handleNavigate}
            onSelectPothole={(id) => handleNavigate('detail', id)}
            onNavigateToClaim={(id) => handleNavigate('contractor-claim', id)}
            onNavigateToVerify={(id) => handleNavigate('verify', id)}
          />
        )}

        {activeView === 'detail' && activePothole && (
          <PotholeDetailPage
            pothole={activePothole}
            events={activeEvents}
            currentRole={currentRole}
            onBack={() => {
              if (currentRole === 'citizen') handleNavigate('citizen-dashboard');
              else if (currentRole === 'contractor') handleNavigate('contractor-dashboard');
              else if (currentRole === 'authority') handleNavigate('authority');
              else handleNavigate('track');
            }}
            onNavigateToVerify={(id) => handleNavigate('verify', id)}
            onNavigateToClaim={(id) => handleNavigate('contractor-claim', id)}
            onDisputeSubmitted={handleDisputeSubmitted}
            onResolvePothole={handleResolvePothole}
          />
        )}

        {activeView === 'authority' && (
          <AuthorityDashboard
            potholes={potholes}
            onSelectPothole={(id) => handleNavigate('detail', id)}
            onAssignContractor={handleAssignContractor}
            onNavigateToVerify={(id) => handleNavigate('verify', id)}
            onOpenClusterModal={(cluster) => setSelectedCluster(cluster)}
            onResolvePothole={handleResolvePothole}
          />
        )}

        {activeView === 'contractor-claim' && activePothole && (
          <ContractorClaimPage
            pothole={activePothole}
            onBack={() => handleNavigate('detail', activePothole.complaintId || activePothole.potholeId)}
            onSubmitClaim={handleSubmitClaim}
            onNavigateToVerify={(id) => handleNavigate('verify', id)}
          />
        )}

        {activeView === 'verify' && activePothole && (
          <VerificationPage
            pothole={activePothole}
            onBack={() => handleNavigate('detail', activePothole.complaintId || activePothole.potholeId)}
            onRunVerification={handleRunVerification}
            onResolveComplaint={handleResolvePothole}
          />
        )}
      </main>

      {/* Global Civic Footer */}
      <Footer />

      {/* Interactive Complaint Cluster Modal */}
      {selectedCluster && (
        <ComplaintClusterModal
          cluster={selectedCluster}
          potholes={potholes}
          onClose={() => setSelectedCluster(null)}
          onViewPothole={(id) => {
            setSelectedCluster(null);
            handleNavigate('detail', id);
          }}
          onSelectPothole={(id) => {
            setSelectedCluster(null);
            handleNavigate('detail', id);
          }}
        />
      )}
    </div>
  );
}
