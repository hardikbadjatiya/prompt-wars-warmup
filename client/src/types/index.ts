// ─── Core Game Types ───

export interface LatLng {
    lat: number;
    lng: number;
}

export interface Zone {
    id: string;
    tileX: number;
    tileY: number;
    center: LatLng;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    owner: string | null;
    ownerName: string | null;
    hp: number;          // 0–100, decays over time
    maxHp: number;
    captureProgress: number; // 0–100, progress toward capture
    coverRating: 'high' | 'medium' | 'low' | 'unknown';
    lastReinforced: number;  // timestamp
    capturedAt: number | null;
}

export interface Player {
    uid: string;
    displayName: string;
    photoURL: string | null;
    position: LatLng | null;
    score: number;
    zonesCaptured: number;
    activeMissions: Mission[];
    lastActive: number;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'capture' | 'strategic' | 'exploration' | 'defense';
    objectives: MissionObjective[];
    reward: number;
    expiresAt: number;
    completed: boolean;
}

export interface MissionObjective {
    description: string;
    target: number;
    current: number;
    completed: boolean;
}

export interface TacticalMessage {
    id: string;
    text: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    timestamp: number;
}

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    photoURL: string | null;
    score: number;
    zonesCaptured: number;
    rank: number;
}

export interface CoverAnalysis {
    overall: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
}

export interface GeminiMissionResponse {
    missions: Mission[];
}

export interface GeminiCommentaryResponse {
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
}

export interface GeminiCoverResponse {
    coverRating: 'high' | 'medium' | 'low';
    analysis: string;
    tacticalAdvice: string;
}
