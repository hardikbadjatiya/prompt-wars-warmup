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
