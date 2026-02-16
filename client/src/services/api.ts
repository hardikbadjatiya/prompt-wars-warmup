import type {
    GeminiMissionResponse,
    GeminiCommentaryResponse,
    GeminiCoverResponse,
    LatLng,
    Zone,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiCall<T>(path: string, body: Record<string, unknown>, token: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

async function apiGet<T>(path: string, token: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json() as Promise<T>;
}

export async function fetchMissions(
    token: string,
    position: LatLng,
    nearbyZones: Zone[]
): Promise<GeminiMissionResponse> {
    return apiCall<GeminiMissionResponse>('/api/gemini/mission', {
        position,
        nearbyZones: nearbyZones.map(z => ({
            id: z.id,
            center: z.center,
            owner: z.owner,
            hp: z.hp,
            coverRating: z.coverRating,
        })),
    }, token);
}

export async function fetchCommentary(
    token: string,
    position: LatLng,
    currentZone: Zone | null,
    nearbyZones: Zone[]
): Promise<GeminiCommentaryResponse> {
    return apiCall<GeminiCommentaryResponse>('/api/gemini/commentary', {
        position,
        currentZone: currentZone ? {
            id: currentZone.id,
            owner: currentZone.owner,
            hp: currentZone.hp,
            coverRating: currentZone.coverRating,
        } : null,
        nearbyZones: nearbyZones.slice(0, 8).map(z => ({
            id: z.id,
            owner: z.owner,
            coverRating: z.coverRating,
        })),
    }, token);
}

export async function fetchCoverAnalysis(
    token: string,
    position: LatLng
): Promise<GeminiCoverResponse> {
    return apiCall<GeminiCoverResponse>('/api/gemini/cover-analysis', {
        position,
    }, token);
}

/**
 * Captures a zone in the database
 */
export async function captureZoneAPI(
    token: string,
    zoneId: string,
    position: LatLng,
    coverRating: string,
    displayName: string
): Promise<{ success: boolean; zoneId: string; message: string }> {
    return apiCall('/api/zones/capture', {
        zoneId,
        position,
        coverRating,
        displayName,
    }, token);
}

/**
 * Gets all zones from the database
 */
export async function fetchAllZones(token: string): Promise<{ zones: any[] }> {
    return apiGet('/api/zones/all', token);
}

/**
 * Gets user's capture history (last 7 days)
 */
export async function fetchUserHistory(token: string): Promise<{ history: any[] }> {
    return apiGet('/api/zones/my-history', token);
}

/**
 * Gets the leaderboard
 */
export async function fetchLeaderboard(token: string): Promise<{ leaderboard: any[] }> {
    return apiGet('/api/zones/leaderboard', token);
}

/**
 * Gets AI-powered leaderboard analysis
 */
export async function fetchLeaderboardAnalysis(token: string): Promise<{
    analysis: {
        topStrategy: string;
        personalAdvice: string;
        insights: string[];
    };
    leaderboard: any[];
    yourRank: number;
    yourCaptures: number;
}> {
    return apiCall('/api/zones/leaderboard-analysis', {}, token);
}
