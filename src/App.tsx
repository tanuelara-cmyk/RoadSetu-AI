import React, { useState, useEffect } from 'react';
import { PotholeRecord, ActivityEvent, UserRole, VerificationResult, CaptureMetadata, ComplaintCluster } from './types';
import { DEMO_POTHOLES, DEMO_EVENTS, DEMO_SCENARIOS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { ComplaintClusterModal } from './components/ComplaintClusterModal';
import { LandingPage } from './views/LandingPage';
import { ReportPotholePage } from './views/ReportPotholePage';
import { TrackSearchPage } from './views/TrackSearchPage';
import { PotholeDetailPage } from './views/PotholeDetailPage';
import { AuthorityDashboard } from './views/AuthorityDashboard';
import { ContractorClaimPage } from './views/ContractorClaimPage';
import { VerificationPage } from './views/VerificationPage';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [activeView, setActiveView] = useState<string>('landing');
  const [selectedPotholeId, setSelectedPotholeId] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ComplaintCluster | null>(null);

  const [potholes, setPotholes] = useState<PotholeRecord[]>(DEMO_POTHOLES);
  const [eventsMap, setEventsMap] = useState<Record<string, ActivityEvent[]>>(DEMO_EVENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch live state from backend
  const loadPotholes = async () => {
    try {
      const res = await fetch('/api/potholes');
      if (res.ok) {
        const data = await res.json();
        if (data.potholes && data.potholes.length > 0) {
          setPotholes(data.potholes);
        }
      }
    } catch (err) {
      console.warn('Using client memory store for potholes', err);
    }
  };

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
      console.warn('Using client memory store for events', err);
    }
  };

  useEffect(() => {
    loadPotholes();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Find currently selected pothole
  const activePothole =
    potholes.find((p) => p.potholeId === selectedPotholeId) || potholes[0] || DEMO_POTHOLES[0];
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

  // Triggering the official Hackathon demonstration scenarios:
  const handleSelectScenario = (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setSelectedPotholeId(scenario.pothole.potholeId);
    loadEvents(scenario.pothole.potholeId);
    setActiveView('verify');
    showToast(`Loaded ${scenario.title}: ${scenario.summary}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to initial seed state
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPotholes(data.potholes);
      } else {
        setPotholes(DEMO_POTHOLES);
      }
      setEventsMap(DEMO_EVENTS);
      showToast('Demo data successfully reset to official initial state.');
    } catch {
      setPotholes(DEMO_POTHOLES);
      setEventsMap(DEMO_EVENTS);
      showToast('Demo data reset to local initial state.');
    }
  };

  // New report created by citizen
  const handleReportCreated = (newPothole: PotholeRecord) => {
    setPotholes((prev) => [newPothole, ...prev]);
    setSelectedPotholeId(newPothole.potholeId);
    loadEvents(newPothole.potholeId);
    showToast(`Registered Pothole ID: ${newPothole.potholeId}`);
  };

  // Authority assigns contractor
  const handleAssignContractor = async (potholeId: string, name: string, company: string) => {
    try {
      const res = await fetch(`/api/potholes/${potholeId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorName: name, company }),
      });
      if (res.ok) {
        const data = await res.json();
        setPotholes((prev) =>
          prev.map((p) => (p.potholeId === potholeId ? data.pothole : p))
        );
        loadEvents(potholeId);
        showToast(`Contractor assigned to ${potholeId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Contractor submits claim
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
    const res = await fetch(`/api/potholes/${potholeId}/claim-repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit repair claim');
    }

    const data = await res.json();
    setPotholes((prev) =>
      prev.map((p) => (p.potholeId === potholeId ? data.pothole : p))
    );
    loadEvents(potholeId);
    showToast(`Repair evidence lodged for ${potholeId}. Status: Verification In Progress.`);
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
    setPotholes((prev) =>
      prev.map((p) => (p.potholeId === potholeId ? data.pothole : p))
    );
    loadEvents(potholeId);
    showToast(
      `AI Verification Complete: ${data.verification.verificationStatus} (${data.verification.overallVerificationScore.toFixed(1)}%)`
    );
    return data.verification;
  };

  // Citizen dispute
  const handleDisputeSubmitted = async (potholeId: string, reason: string) => {
    const res = await fetch(`/api/potholes/${potholeId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to lodge dispute');
    }

    const data = await res.json();
    setPotholes((prev) =>
      prev.map((p) => (p.potholeId === potholeId ? data.pothole : p))
    );
    loadEvents(potholeId);
    showToast(`Citizen dispute recorded for ${potholeId}. Status: Reinspection Required.`);
  };

  // Official resolution
  const handleResolvePothole = async (potholeId: string) => {
    const res = await fetch(`/api/potholes/${potholeId}/resolve`, {
      method: 'POST',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to resolve complaint');
    }

    const data = await res.json();
    setPotholes((prev) =>
      prev.map((p) => (p.potholeId === potholeId ? data.pothole : p))
    );
    loadEvents(potholeId);
    showToast(`Case ${potholeId} officially resolved.`);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Civic Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeView={activeView}
        setActiveView={(view) => handleNavigate(view)}
        onSelectScenario={handleSelectScenario}
        onResetDemo={handleResetDemo}
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
            onNavigate={handleNavigate}
            scenarios={DEMO_SCENARIOS}
            onSelectScenario={handleSelectScenario}
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

        {activeView === 'detail' && activePothole && (
          <PotholeDetailPage
            pothole={activePothole}
            events={activeEvents}
            currentRole={currentRole}
            onBack={() => handleNavigate('track')}
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
            onBack={() => handleNavigate('detail', activePothole.potholeId)}
            onSubmitClaim={handleSubmitClaim}
            onNavigateToVerify={(id) => handleNavigate('verify', id)}
          />
        )}

        {activeView === 'verify' && activePothole && (
          <VerificationPage
            pothole={activePothole}
            onBack={() => handleNavigate('detail', activePothole.potholeId)}
            onRunVerification={handleRunVerification}
            onSelectScenario={handleSelectScenario}
            onResolveComplaint={handleResolvePothole}
          />
        )}
      </main>

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
