# 🎮 Area Control Loop – Reimagined Childhood Territory Game (2026)

> Walk. Capture. Dominate. AI-powered GPS territory control in the real world.

A production-ready web application where players move in the real world using GPS to capture territory zones on a Google Maps-powered game board. Gemini AI provides tactical commentary, adaptive missions, and cover analysis to create a deeply strategic experience.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue) ![Maps](https://img.shields.io/badge/Google%20Maps-Platform-green) ![AI](https://img.shields.io/badge/Gemini-AI-purple) ![Auth](https://img.shields.io/badge/Firebase-Auth-orange) ![Deploy](https://img.shields.io/badge/Cloud%20Run-Deployed-cyan)

---

##  Features

| Feature | Description |
|---|---|
| 🗺️ Real-time Map | Google Maps with dark theme, zone overlays, player marker |
| 📍 GPS Tracking | Live location via Geolocation API with accuracy ring |
| 🏴 Zone Capture | Walk into zones to capture (3s timer), own territory |
| 💀 Zone Decay | Zones lose HP over time — reinforce by standing nearby |
| 🤖 Gemini AI | Cover detection, mission generation, tactical commentary |
| 🏆 Leaderboard | Real-time Firestore leaderboard with rankings |
| 🔒 Auth | Firebase Google Sign-In |
| 🔐 Secure Backend | API keys never exposed — all Gemini calls server-side |
| ♿ Accessible | ARIA labels, keyboard navigation, reduced-motion support |
| 🧪 Tested | Unit tests for core game logic (mapUtils, zone decay) |

---

## 🏗️ Architecture

```
┌──────────────────┐       ┌──────────────────┐
│   React Client   │ ◄───► │  Express Server  │
│  (Vite + TS)     │       │  (Node.js + TS)  │
│                  │       │                  │
│  Google Maps     │       │  Gemini API      │
│  Firebase Auth   │       │  Firebase Admin   │
│  Geolocation API │       │  Zone Management  │
└──────────────────┘       └──────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────┐       ┌──────────────────┐
│    Firestore     │       │   Gemini 2.0     │
│  (Zones, Score)  │       │   Flash Model    │
└──────────────────┘       └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Google Maps API key (Maps JavaScript API enabled)
- Gemini API key
- Firebase project with Auth + Firestore enabled

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/area-control-loop.git
cd area-control-loop

# Install client
cd client && npm install

# Install server
cd ../server && npm install
```

### 2. Configure Environment

```bash
# Copy the template
cp .env.example .env

# Edit with your keys
nano .env
```

Required variables:
| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API key |
| `GEMINI_API_KEY` | Gemini API key (server-only) |

### 3. Run Locally

```bash
# Terminal 1: Start backend
cd server
cp ../.env ./.env
npm run dev

# Terminal 2: Start frontend
cd client
cp ../.env ./.env
npm run dev
```

Open **http://localhost:5173** → Sign in with Google → Grant location access → Start playing!

### 4. Run Tests

```bash
cd client
npx vitest run
```

---

## ☁️ Cloud Run Deployment

### Build & Deploy

```bash
# Set your project
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

# Build container
gcloud builds submit --tag gcr.io/$PROJECT_ID/area-control-loop

# Deploy to Cloud Run
gcloud run deploy area-control-loop \
  --image gcr.io/$PROJECT_ID/area-control-loop \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=your-key,FIREBASE_PROJECT_ID=$PROJECT_ID" \
  --port 8080
```

### Build Args for Client ENV

For Vite env vars at build time, use `--build-arg`:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/area-control-loop \
  --substitutions="_VITE_FIREBASE_API_KEY=xxx,_VITE_GOOGLE_MAPS_API_KEY=xxx"
```

---

## 📁 Project Structure

```
├── client/                 # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/     # 7 UI components
│   │   ├── hooks/          # 3 custom hooks (Geo, Zones, Auth)
│   │   ├── services/       # Firebase, API, Map utilities
│   │   └── types/          # TypeScript interfaces
│   └── __tests__/          # Unit tests (mapUtils, gameLogic)
├── server/                 # Express + TypeScript backend
│   └── src/
│       ├── routes/         # Gemini + Zone API routes
│       ├── services/       # Gemini AI service
│       └── middleware/     # Firebase Auth middleware
├── Dockerfile              # Multi-stage production build
├── firestore.rules         # Firestore security rules
└── .env.example            # Environment variable template
```

---

## 🎯 Game Mechanics

### Zone Capture
1. Player walks into an unowned zone
2. 3-second capture timer begins
3. Zone flips to player ownership at 100 HP
4. Score +10 per capture

### Zone Decay
- Zones lose **2 HP/minute** when unattended
- Standing in your zone **reinforces** it (+5 HP every 2s)
- Zone reverts to neutral when HP reaches 0

### Gemini AI
- **Missions**: AI generates strategic objectives based on surroundings
- **Commentary**: Real-time tactical narration of player situation
- **Cover Analysis**: Terrain assessment for strategic planning

---

## 🛡️ Security

- ✅ Gemini API key stored server-side only
- ✅ Firebase Auth token verification on all API routes
- ✅ Firestore security rules restrict access
- ✅ CORS configured for allowed origins
- ✅ No secrets in client bundle

---

## 📜 License

Apache 2.0 — see [LICENSE](./LICENSE)
