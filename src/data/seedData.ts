import { PotholeRecord, ActivityEvent, DemoScenario, ComplaintCluster } from '../types';

// Authentic high-resolution photographs for real road evidence testing
export const ROAD_IMAGES = {
  // Invalid Test Sample: Real photo of ceramic coffee cup on office desk (for testing AI Road Damage Validation rejection)
  invalidSampleObject: '/assets/images/desk_coffee_cup_real.jpg',
  // Scenario 1: Real photo of SV Road Mumbai Pothole Before Repair
  mumbaiPotholeBefore: '/assets/images/mumbai_pothole_real.jpg',
  // Scenario 1: Real photo of SV Road Mumbai After Genuine Bituminous Road Repair
  mumbaiPotholeAfterGenuine: '/assets/images/repaired_road_real.jpg',
  // Scenario 2: Real photo of Koramangala Bengaluru Road Pothole Crater Before Repair
  blrPotholeBefore: '/assets/images/blr_pothole_real.jpg',
  // Scenario 2: Real photo of Ring Road Expressway with glass tower (mismatched contractor gaming submission)
  blrPotholeAfterGaming: '/assets/images/highway_mismatch_real.jpg',
  // Real photo of urban road pothole
  delhiPotholeBefore: '/assets/images/mumbai_pothole_real.jpg',
};

export const INITIAL_POTHOLES: PotholeRecord[] = [
  {
    potholeId: 'PTH-MUM-2026-00142',
    reportedBy: {
      uid: 'user_aarav_sharma',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.in',
    },
    description: 'Dangerous 35cm deep pothole in right lane near pedestrian crossing causing two-wheelers to skid.',
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
      userAgent: 'RoadSetu Mobile Web/Android',
    },
    status: 'Verified',
    assignedAuthority: {
      uid: 'auth_mcgm_01',
      name: 'Sunil Kulkarni (Executive Engineer)',
      department: 'MCGM Roads & Traffic Division H/West',
    },
    assignedContractor: {
      uid: 'cont_infratech',
      name: 'Ramesh Patel',
      company: 'InfraTech RoadWorks Pvt Ltd',
    },
    afterImageUrl: ROAD_IMAGES.mumbaiPotholeAfterGenuine,
    afterTimestamp: '2026-09-14T14:15:30.000Z',
    afterLatitude: 19.05963,
    afterLongitude: 72.82952,
    afterAddress: 'SV Road, near Bandra West Post Office, Mumbai, Maharashtra - 400050',
    afterCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 3.5,
      deviceTimestamp: '2026-09-14T14:15:30.000Z',
      aspectRatio: '4:3',
    },
    repairDescription: 'Excavated loose subgrade, applied RS-1 tack coat, filled with hot-mix dense bituminous macadam (DBM) and rolled with 8-ton vibratory roller to flush surface.',
    materialsUsed: 'Grade VG-30 Bitumen, 40mm aggregate base, 20mm seal coat',
    verification: {
      verificationId: 'VER-MUM-88219',
      potholeId: 'PTH-MUM-2026-00142',
      potholeRegionScore: 94,
      gpsScore: 98,
      viewpointScore: 92,
      backgroundMatchScore: 96,
      repairEvidenceScore: 95,
      evidenceQualityScore: 93,
      overallVerificationScore: 94.8,
      verificationStatus: 'VERIFIED',
      explanation: 'Verified with high confidence. The repair photo aligns precisely with original pothole coordinates (distance delta 3.8m, well within 15m threshold). Background landmarks including streetlight pole #BR-42 stenciled marker, pavement yellow curb geometry, and tree foliage match with high structural correlation. Fresh bituminous asphalt patch is visible in the exact damaged footprint and compacted flush with existing road grade.',
      distanceMeters: 3.8,
      distanceAcceptable: true,
      analyzedAt: '2026-09-14T14:22:10.000Z',
      modelUsed: 'gemini-3.8-flash (Multi-Factor Spatial CV)',
      factorDetails: [
        { factor: 'Pothole Region Match', score: 94, passed: true, notes: 'Excavated region dimensions match the 35cm cavity reported by citizen.' },
        { factor: 'GPS Consistency', score: 98, passed: true, notes: 'Coordinates within 3.8m; acceptable tolerance is 15.0m.' },
        { factor: 'Viewpoint & Perspective', score: 92, passed: true, notes: 'Camera facing northbound at ~35° down-angle matching original photo.' },
        { factor: 'Background Landmark Match', score: 96, passed: true, notes: 'Streetlight pole BR-42, yellow curb segments, and banyan foliage match.' },
        { factor: 'Visible Repair Evidence', score: 95, passed: true, notes: 'Fresh hot-mix bitumen compacted flush with no visible fissures.' },
        { factor: 'Evidence Quality', score: 93, passed: true, notes: 'High daylight illumination, crisp focus, uncompressed metadata.' }
      ]
    },
    clusterId: 'CLUSTER-42',
    linkedReportsCount: 3,
    linkedReportIds: ['PTH-MUM-2026-00142', 'PTH-MUM-2026-00158', 'PTH-MUM-2026-00163'],
    createdAt: '2026-09-12T09:42:15.000Z',
    updatedAt: '2026-09-14T14:22:10.000Z',
  },
  {
    potholeId: 'PTH-MUM-2026-00158',
    reportedBy: {
      uid: 'user_meera_deshmukh',
      name: 'Meera Deshmukh',
      email: 'meera.d@example.in',
    },
    description: 'Deep road cavity beside traffic signal and yellow curb on SV Road. Two-wheelers skidding frequently.',
    severity: 'High',
    latitude: 19.05972,
    longitude: 72.82961,
    address: 'SV Road, near Bandra West Post Office, Mumbai, Maharashtra - 400050',
    landmark: 'Opposite post office boundary, near yellow curb line',
    beforeImageUrl: ROAD_IMAGES.mumbaiPotholeBefore,
    beforeTimestamp: '2026-09-13T10:15:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 4.8,
      deviceTimestamp: '2026-09-13T10:15:00.000Z',
      aspectRatio: '4:3',
      userAgent: 'RoadSetu Mobile Web/Android',
    },
    status: 'Repair Claimed',
    assignedAuthority: {
      uid: 'auth_mcgm_01',
      name: 'Sunil Kulkarni (Executive Engineer)',
      department: 'MCGM Roads & Traffic Division H/West',
    },
    assignedContractor: {
      uid: 'cont_infratech',
      name: 'Ramesh Patel',
      company: 'InfraTech RoadWorks Pvt Ltd',
    },
    afterImageUrl: ROAD_IMAGES.mumbaiPotholeAfterGenuine,
    afterTimestamp: '2026-09-14T14:15:30.000Z',
    afterLatitude: 19.05963,
    afterLongitude: 72.82952,
    afterAddress: 'SV Road, Bandra West, Mumbai',
    clusterId: 'CLUSTER-42',
    linkedReportsCount: 3,
    linkedReportIds: ['PTH-MUM-2026-00142', 'PTH-MUM-2026-00158', 'PTH-MUM-2026-00163'],
    createdAt: '2026-09-13T10:15:00.000Z',
    updatedAt: '2026-09-14T14:15:30.000Z',
  },
  {
    potholeId: 'PTH-MUM-2026-00163',
    reportedBy: {
      uid: 'user_kunal_patil',
      name: 'Kunal Patil',
      email: 'kunal.patil@example.in',
    },
    description: 'Large asphalt hole right lane near streetlight pole 42. Risk of tire puncture and severe accidents.',
    severity: 'Medium',
    latitude: 19.05955,
    longitude: 72.82942,
    address: 'SV Road Corridor, Bandra West, Mumbai, Maharashtra - 400050',
    landmark: 'Adjacent to pole #BR-42 and yellow curb boundary',
    beforeImageUrl: ROAD_IMAGES.mumbaiPotholeBefore,
    beforeTimestamp: '2026-09-13T16:40:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 5.1,
      deviceTimestamp: '2026-09-13T16:40:00.000Z',
      aspectRatio: '4:3',
      userAgent: 'RoadSetu Mobile Web/Android',
    },
    status: 'Reported',
    clusterId: 'CLUSTER-42',
    linkedReportsCount: 3,
    linkedReportIds: ['PTH-MUM-2026-00142', 'PTH-MUM-2026-00158', 'PTH-MUM-2026-00163'],
    createdAt: '2026-09-13T16:40:00.000Z',
    updatedAt: '2026-09-13T16:40:00.000Z',
  },
  {
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
    landmark: 'In front of red brick wall and concrete drainage slab',
    beforeImageUrl: ROAD_IMAGES.blrPotholeBefore,
    beforeTimestamp: '2026-09-13T11:05:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 5.1,
      deviceTimestamp: '2026-09-13T11:05:00.000Z',
      aspectRatio: '4:3',
      userAgent: 'RoadSetu Mobile Web/iOS',
    },
    status: 'Reinspection Required',
    assignedAuthority: {
      uid: 'auth_bbmp_04',
      name: 'Venkatesh Murthy (Assistant Executive Engineer)',
      department: 'BBMP South Zone Infrastructure Division',
    },
    assignedContractor: {
      uid: 'cont_apex_urban',
      name: 'Vikram Choudhury',
      company: 'Apex Urban Roads Corp',
    },
    afterImageUrl: ROAD_IMAGES.blrPotholeAfterGaming,
    afterTimestamp: '2026-09-15T16:10:00.000Z',
    afterLatitude: 12.9278,
    afterLongitude: 77.6321,
    afterAddress: 'Outer Ring Road, Near Tech Park Flyover, Bengaluru, Karnataka - 560103',
    afterCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 6.8,
      deviceTimestamp: '2026-09-15T16:10:00.000Z',
      aspectRatio: '4:3',
    },
    repairDescription: 'Completed cold patch repair on reported spot.',
    materialsUsed: 'Cold mix emulsified asphalt',
    verification: {
      verificationId: 'VER-BLR-90412',
      potholeId: 'PTH-BLR-2026-00088',
      potholeRegionScore: 12,
      gpsScore: 8,
      viewpointScore: 24,
      backgroundMatchScore: 10,
      repairEvidenceScore: 78,
      evidenceQualityScore: 88,
      overallVerificationScore: 29.2,
      verificationStatus: 'REINSPECTION REQUIRED',
      explanation: 'Reinspection required. Contractor gaming attempt detected. While the after-photo exhibits a patched road surface, the submission location is 864.5 meters away from the citizen report. Furthermore, background surroundings do not match: the original photo features a residential red brick compound wall and a concrete drainage lid, whereas the submitted contractor photo depicts a multi-lane highway divider and commercial glass high-rise buildings. The original pothole remains unverified.',
      distanceMeters: 864.5,
      distanceAcceptable: false,
      analyzedAt: '2026-09-15T16:15:22.000Z',
      modelUsed: 'gemini-3.8-flash (Multi-Factor Spatial CV)',
      factorDetails: [
        { factor: 'Pothole Region Match', score: 12, passed: false, notes: 'Original cavity footprint cannot be identified in submitted after-photo.' },
        { factor: 'GPS Consistency', score: 8, passed: false, notes: 'Location delta is 864.5m (threshold is ≤ 15.0m). Critical spatial mismatch.' },
        { factor: 'Viewpoint & Perspective', score: 24, passed: false, notes: 'Camera is facing an express highway corridor instead of residential lane.' },
        { factor: 'Background Landmark Match', score: 10, passed: false, notes: 'Red brick wall and storm drain slab completely absent; glass towers visible.' },
        { factor: 'Visible Repair Evidence', score: 78, passed: true, notes: 'Surface is patched, but corresponds to an entirely different road location.' },
        { factor: 'Evidence Quality', score: 88, passed: true, notes: 'Clear image resolution, but telemetry confirms external site capture.' }
      ]
    },
    createdAt: '2026-09-13T11:05:00.000Z',
    updatedAt: '2026-09-15T16:15:22.000Z',
  },
  {
    potholeId: 'PTH-DEL-2026-00305',
    reportedBy: {
      uid: 'user_rohit_verma',
      name: 'Rohit Verma',
      email: 'rohit.v@example.in',
    },
    description: 'Waterlogged depression creating dangerous blind spot near bus stop shelter.',
    severity: 'Medium',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Rajpath Outer Ring, Janpath Junction, New Delhi - 110001',
    landmark: '50m from Janpath Metro Station Gate 2',
    beforeImageUrl: ROAD_IMAGES.delhiPotholeBefore,
    beforeTimestamp: '2026-09-15T08:30:00.000Z',
    beforeCaptureMetadata: {
      captureSource: 'device_camera',
      accuracyMeters: 3.9,
      deviceTimestamp: '2026-09-15T08:30:00.000Z',
      aspectRatio: '4:3',
    },
    status: 'Reported',
    createdAt: '2026-09-15T08:30:00.000Z',
    updatedAt: '2026-09-15T08:30:00.000Z',
  }
];

export const INITIAL_EVENTS: ActivityEvent[] = [
  {
    eventId: 'EVT-101',
    potholeId: 'PTH-MUM-2026-00142',
    eventType: 'REPORTED',
    performedBy: { uid: 'user_aarav_sharma', name: 'Aarav Sharma', role: 'citizen' },
    description: 'Citizen filed pothole complaint with camera capture and verified GPS coordinates (19.05960° N, 72.82950° E).',
    timestamp: '2026-09-12T09:42:15.000Z',
  },
  {
    eventId: 'EVT-102',
    potholeId: 'PTH-MUM-2026-00142',
    eventType: 'ASSIGNED',
    performedBy: { uid: 'auth_mcgm_01', name: 'Sunil Kulkarni (MCGM)', role: 'authority' },
    description: 'Assigned repair work order to contractor: InfraTech RoadWorks Pvt Ltd.',
    timestamp: '2026-09-12T14:20:00.000Z',
  },
  {
    eventId: 'EVT-103',
    potholeId: 'PTH-MUM-2026-00142',
    eventType: 'REPAIR_CLAIMED',
    performedBy: { uid: 'cont_infratech', name: 'Ramesh Patel', role: 'contractor' },
    description: 'Contractor uploaded after-repair evidence photo with timestamp and GPS coordinates.',
    timestamp: '2026-09-14T14:15:30.000Z',
  },
  {
    eventId: 'EVT-104',
    potholeId: 'PTH-MUM-2026-00142',
    eventType: 'VERIFIED',
    performedBy: { uid: 'system_ai', name: 'RoadSetu AI Verification Engine', role: 'authority' },
    description: 'Multi-factor verification completed: VERIFIED (Overall Confidence: 94.8%). Location distance delta 3.8m, pole BR-42 & yellow curb matched.',
    timestamp: '2026-09-14T14:22:10.000Z',
  },
  // Bengaluru events
  {
    eventId: 'EVT-201',
    potholeId: 'PTH-BLR-2026-00088',
    eventType: 'REPORTED',
    performedBy: { uid: 'user_priya_nair', name: 'Priya Nair', role: 'citizen' },
    description: 'Citizen filed critical pothole report at 5th Cross Road, Koramangala 4th Block.',
    timestamp: '2026-09-13T11:05:00.000Z',
  },
  {
    eventId: 'EVT-202',
    potholeId: 'PTH-BLR-2026-00088',
    eventType: 'ASSIGNED',
    performedBy: { uid: 'auth_bbmp_04', name: 'Venkatesh Murthy (BBMP)', role: 'authority' },
    description: 'Assigned contractor: Apex Urban Roads Corp.',
    timestamp: '2026-09-13T15:00:00.000Z',
  },
  {
    eventId: 'EVT-203',
    potholeId: 'PTH-BLR-2026-00088',
    eventType: 'REPAIR_CLAIMED',
    performedBy: { uid: 'cont_apex_urban', name: 'Vikram Choudhury', role: 'contractor' },
    description: 'Contractor submitted repair completion claim.',
    timestamp: '2026-09-15T16:10:00.000Z',
  },
  {
    eventId: 'EVT-204',
    potholeId: 'PTH-BLR-2026-00088',
    eventType: 'REINSPECTION_REQUESTED',
    performedBy: { uid: 'system_ai', name: 'RoadSetu AI Verification Engine', role: 'authority' },
    description: 'Verification flagged REINSPECTION REQUIRED (Score 29.2%). GPS distance delta is 864.5m (exceeds 15m threshold). Background landmarks fail to match.',
    timestamp: '2026-09-15T16:15:22.000Z',
  },
  // Delhi events
  {
    eventId: 'EVT-301',
    potholeId: 'PTH-DEL-2026-00305',
    eventType: 'REPORTED',
    performedBy: { uid: 'user_rohit_verma', name: 'Rohit Verma', role: 'citizen' },
    description: 'Citizen filed pothole report on Rajpath Outer Ring, New Delhi.',
    timestamp: '2026-09-15T08:30:00.000Z',
  }
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-genuine',
    title: 'Scenario 1: Genuine Repair (Bandra SV Road)',
    scenarioType: 'genuine',
    expectedResult: 'VERIFIED',
    summary: 'Contractor repaired the exact pothole reported by citizen. Distance delta is only 3.8m. Streetlight pole #BR-42 and yellow curb boundary align perfectly. AI confirms surface repair and grants VERIFIED status.',
    pothole: INITIAL_POTHOLES[0],
  },
  {
    id: 'demo-gaming',
    title: 'Scenario 2: Contractor Gaming Attempt (Koramangala vs Ring Road)',
    scenarioType: 'gaming',
    expectedResult: 'REINSPECTION REQUIRED',
    summary: 'Contractor attempted to cheat municipal authorities by uploading a photo of a different repaired road 864m away. The road looks patched, but RoadSetu AI flags GPS mismatch (864m away) and missing background brick wall/storm drain. Flagged as REINSPECTION REQUIRED.',
    pothole: INITIAL_POTHOLES[1],
  },
];

export const DEMO_POTHOLES = INITIAL_POTHOLES;
export const DEMO_EVENTS = INITIAL_EVENTS;

export const INITIAL_CLUSTERS: ComplaintCluster[] = [
  {
    clusterId: 'CLUSTER-42',
    name: 'Pothole Cluster #42',
    area: 'Thane West / Bandra SV Road Corridor',
    severity: 'High',
    primaryPotholeId: 'PTH-MUM-2026-00142',
    linkedPotholeIds: ['PTH-MUM-2026-00142', 'PTH-MUM-2026-00158', 'PTH-MUM-2026-00163'],
    reportCount: 3,
    latitude: 19.0596,
    longitude: 72.8295,
    summary: '3 independent citizens reported the same road defect within 15 meters on SV Road. Clustering aggregates civic priority while preventing redundant contractor payments.',
    status: 'Verified',
    createdAt: '2026-09-12T09:42:15.000Z',
  },
];

export const DEMO_CLUSTERS = INITIAL_CLUSTERS;


