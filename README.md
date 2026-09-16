# 🚧 RoadSetu AI

## AI-Powered Road Repair Verification & Civic Accountability

> **Report it. Track it. Verify it.**

RoadSetu AI is an AI-powered civic technology platform that makes pothole reporting, complaint tracking, and road-repair verification more transparent.

The platform connects citizens, authorities, and contractors through a single workflow and uses computer vision, semantic similarity, and geospatial intelligence to verify whether a claimed repair actually belongs to the **same reported pothole**.

---
🌐 Live Demo
RoadSetu AI

Live Prototype:

https://road-setu-ai.vercel.app/

Try the live prototype to explore the complaint tracking and repair-verification workflow.

---

📸 Screenshots

![RoadSetu AI Dashboard] <img width="1917" height="738" alt="Screenshot 2026-09-16 164504" src="https://github.com/user-attachments/assets/a1882be4-3301-4689-8f88-623329398460" />


![Complaint Reporting]<img width="1618" height="886" alt="Screenshot 2026-09-16 164526" src="https://github.com/user-attachments/assets/5ed8f2aa-0cca-48ff-9d82-dd849fcf7c12" />

![Track complaint]<img width="1640" height="891" alt="Screenshot 2026-09-16 164542" src="https://github.com/user-attachments/assets/b7c9344c-0ee7-4966-b3cb-2c8e43e139ba" />


---

## 🎯 Problem Statement

### "The Pothole Nobody Reported"

Citizens often stop using municipal complaint systems when complaints disappear without visible follow-through.

Even when a complaint is marked as repaired, there is another important question:

> **Was the reported pothole actually repaired?**

A contractor could potentially submit a photograph of a different pothole that has already been repaired.

A simple before/after image comparison may not detect this.

RoadSetu AI addresses this problem by combining:

- 📍 Geospatial verification
- 🖼️ Computer vision
- 📐 Keypoint matching
- 🔍 Structural Similarity (SSIM)
- 🧠 Semantic similarity
- 🗺️ Geographic context

---

# 💡 Our Solution

RoadSetu AI creates a transparent complaint-to-repair workflow:

```text
Citizen Reports Pothole
          ↓
AI Pothole Analysis
          ↓
GPS & Location Capture
          ↓
Complaint Clustering
          ↓
Complaint Tracking
          ↓
Contractor Repairs Road
          ↓
Before + After Evidence
          ↓
AI Repair Verification
          ↓
┌─────────┼──────────┐
↓         ↓          ↓
VERIFIED  SUSPICIOUS FAILED
          ↓
Public Accountability

```
---

👤 Citizen Reporting

Citizens can:

Report potholes
Upload images
Provide complaint information
Capture location
Track complaint status
🤖 AI / Computer Vision

The platform uses computer-vision techniques to compare repair evidence.

Verification signals include:
OpenCV-based image processing
Keypoint matching
SSIM (Structural Similarity Index)
Visual similarity analysis

These signals help determine whether the before and after images represent the same physical location.

---

🧠 Semantic AI

RoadSetu AI also uses semantic information to understand complaints.

Technologies:
Embeddings
Semantic Similarity

This helps identify complaints that describe similar problems even when citizens use different words.

---

🗺️ Geospatial Complaint Clustering

Multiple citizens may report the same pothole.

Instead of treating every report as a completely separate issue, RoadSetu AI combines:

Geographical Location
        +
Semantic Similarity
        ↓
Complaint Clustering
        ↓
Potential Duplicate Reports

This can help authorities identify repeated complaints about the same road issue.

---
## 🔍 Repair Verification

The main innovation of RoadSetu AI is verifying the **same pothole**, not just a repaired-looking road.

### Example: Suspicious Repair

**Before Photo**

📍 Location A  
🕳️ Reported Pothole

↓

**Contractor After Photo**

📍 Location B  
🛣️ Repaired Road

↓

**GPS / Visual / Landmark Mismatch**

↓

⚠️ **SUSPICIOUS REPAIR**

---

### Example: Verified Repair

**Before Photo**

📍 Location A  
🕳️ Reported Pothole

↓

**Contractor After Photo**

📍 Location A  
🛣️ Repaired Road

↓

**GPS + Visual Context Match**

↓

✅ **REPAIR VERIFIED**

---
## 🛠️ Technology Stack

### 🎨 Frontend

- React 18
- Tailwind CSS
- Leaflet.js

### ⚙️ Backend

- Node.js
- Express
- REST API

### 🤖 AI / Computer Vision

- OpenCV
- Keypoint Matching
- SSIM (Structural Similarity Index)

### 🧠 Semantic AI

- Embeddings
- Semantic Similarity

### 📍 Clustering

- Geospatial Complaint Clustering
- Semantic Complaint Clustering

### 🗺️ GIS

- OpenStreetMap

### 🗄️ Database

- MongoDB

### 💻 Hardware

- Zero Proprietary Hardware

---
## 📊 Expected Impact

### 👥 Citizens

- Transparent complaint tracking
- Better visibility of repair progress
- Increased confidence in civic reporting

### 🏛️ Municipal Authorities

- Centralized complaint management
- Duplicate complaint identification
- Evidence-based repair monitoring
- Identification of suspicious repair claims

### 👷 Contractors

- Clear repair evidence requirements
- Transparent verification process
- Traceable repair submissions

### 🏙️ Smart Cities

- Data-driven road maintenance
- Better civic accountability
- Scalable digital infrastructure monitoring

---


🔮 Future Scope

The RoadSetu AI verification framework can be extended beyond potholes.

Possible applications include:

🚦 Broken traffic signals
💡 Damaged streetlights
🚰 Water leakage
🕳️ Open manholes
🗑️ Garbage hotspots
🛣️ Damaged roads
🏗️ Damaged public infrastructure

REPORT
   ↓
TRACK
   ↓
REPAIR
   ↓
VERIFY
   ↓
ACCOUNTABILITY

---

👥 Team Synora
| Member                  | Role        |
| ----------------------- | ----------- |
| **Yashaswi Singh**      | Team Lead   |
| **Tanu Yadav**          | Team Member |
| **Swarangi Vishwasrao** | Team Member |

---

Selected Theme

Smart Cities & Urban Development

---

🌉 Our Vision

Making every road repair traceable, verifiable, and accountable.

RoadSetu AI
Report it. Track it. Verify it.

