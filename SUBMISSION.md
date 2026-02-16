# Area Control Loop – PromptWars Submission

## 🏷️ Title
**Area Control Loop – Reimagined Childhood Territory Game (2026)**

## 📝 Description
A full-stack GPS-based territory control game built for the real world. Players move physically to capture map zones powered by Google Maps, with Gemini AI providing tactical intelligence, adaptive missions, and real-time cover analysis. Features Firebase Auth, Firestore leaderboard, zone decay mechanics, and Cloud Run deployment.

## 🔑 Key Innovation
- **Gemini-Powered Tactical AI**: The game uses Gemini 2.0 Flash to analyze player surroundings, generate adaptive missions like "Capture 2 high-cover zones" or "Avoid open exposure routes", and deliver real-time tactical commentary ("This area has low cover, move via buildings"). All AI calls are proxied through a secure Express backend.
- **Loop-Based Control Mechanic**: Zones decay unless reinforced, creating a compelling gameplay loop that requires strategic territory management.

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, TailwindCSS v4, Vite |
| Maps | Google Maps JavaScript SDK (dark theme) |
| AI | Gemini 2.0 Flash (mission gen, cover detection, commentary) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore (zones, leaderboard, players) |
| Backend | Node.js, Express, TypeScript |
| Deploy | Cloud Run (multi-stage Docker) |
| Tests | Vitest (15+ unit tests) |

## ✅ Deliverables Checklist
- [x] Real-time Google Maps gameplay UI
- [x] Live GPS player tracking
- [x] Zone capture + decay loop system
- [x] Gemini AI cover detection + mission generation
- [x] Firestore leaderboard + player stats
- [x] Firebase Auth (Google login)
- [x] Secure backend Gemini calls (API key never exposed)
- [x] Cloud Run deployment config (Dockerfile + instructions)
- [x] Accessibility (ARIA labels, keyboard support, reduced-motion)
- [x] Testing suite (2 test files, 15+ unit tests)
- [x] Dark mode + glassmorphism UI with neon accents
- [x] Mobile-first responsive design
- [x] Complete README with setup + deployment steps
