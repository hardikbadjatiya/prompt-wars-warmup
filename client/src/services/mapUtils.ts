import type { LatLng, Zone } from '../types';

const TILE_SIZE_METERS = 100;
const EARTH_RADIUS = 6371000;

/** Convert degrees to radians */
function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/** Convert radians to degrees */
function toDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}

/** Convert a lat/lng to tile coordinates */
export function latLngToTile(lat: number, lng: number, tileSizeMeters = TILE_SIZE_METERS): { tileX: number; tileY: number } {
    const metersPerDegreeLat = (2 * Math.PI * EARTH_RADIUS) / 360;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(toRad(lat));

    const tileX = Math.floor((lng * metersPerDegreeLng) / tileSizeMeters);
    const tileY = Math.floor((lat * metersPerDegreeLat) / tileSizeMeters);

    return { tileX, tileY };
}

/** Convert tile coordinates back to center lat/lng */
export function tileToLatLng(tileX: number, tileY: number, refLat: number, tileSizeMeters = TILE_SIZE_METERS): LatLng {
    const metersPerDegreeLat = (2 * Math.PI * EARTH_RADIUS) / 360;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(toRad(refLat));

    const lat = ((tileY + 0.5) * tileSizeMeters) / metersPerDegreeLat;
    const lng = ((tileX + 0.5) * tileSizeMeters) / metersPerDegreeLng;

    return { lat, lng };
}

/** Get the bounding box for a tile */
export function tileBounds(tileX: number, tileY: number, refLat: number, tileSizeMeters = TILE_SIZE_METERS) {
    const metersPerDegreeLat = (2 * Math.PI * EARTH_RADIUS) / 360;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(toRad(refLat));

    const south = (tileY * tileSizeMeters) / metersPerDegreeLat;
    const north = ((tileY + 1) * tileSizeMeters) / metersPerDegreeLat;
    const west = (tileX * tileSizeMeters) / metersPerDegreeLng;
    const east = ((tileX + 1) * tileSizeMeters) / metersPerDegreeLng;

    return { north, south, east, west };
}

/** Check if player is inside a zone */
export function isPlayerInZone(playerPos: LatLng, zone: Zone): boolean {
    return (
        playerPos.lat >= zone.bounds.south &&
        playerPos.lat <= zone.bounds.north &&
        playerPos.lng >= zone.bounds.west &&
        playerPos.lng <= zone.bounds.east
    );
}

/** Calculate remaining HP after decay */
export function calculateDecay(zone: Zone, nowMs: number, decayRatePerMinute = 1): number {
    if (!zone.capturedAt || !zone.owner) return 0;
    const minutesElapsed = (nowMs - zone.lastReinforced) / 60000;
    const decayedHp = Math.max(0, zone.hp - minutesElapsed * decayRatePerMinute);
    return Math.round(decayedHp * 100) / 100;
}

/** Get color for a zone based on ownership + HP */
export function getZoneColor(zone: Zone, playerId: string | null): string {
    if (!zone.owner) return 'rgba(120, 120, 140, 0.3)'; // neutral grey

    const hpRatio = zone.hp / zone.maxHp;
    const alpha = 0.2 + hpRatio * 0.5;

    if (zone.owner === playerId) {
        return `rgba(0, 245, 255, ${alpha})`; // cyan for player
    }
    return `rgba(255, 0, 229, ${alpha})`; // magenta for enemy
}

/** Generate zone ID from tile coordinates */
export function zoneId(tileX: number, tileY: number): string {
    return `zone_${tileX}_${tileY}`;
}

/** Generate zones in a grid around a position */
export function generateZonesAround(center: LatLng, radius = 5, tileSizeMeters = TILE_SIZE_METERS): Zone[] {
    const centerTile = latLngToTile(center.lat, center.lng, tileSizeMeters);
    const zones: Zone[] = [];

    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const tx = centerTile.tileX + dx;
            const ty = centerTile.tileY + dy;
            const tCenter = tileToLatLng(tx, ty, center.lat, tileSizeMeters);
            const bounds = tileBounds(tx, ty, center.lat, tileSizeMeters);

            zones.push({
                id: zoneId(tx, ty),
                tileX: tx,
                tileY: ty,
                center: tCenter,
                bounds,
                owner: null,
                ownerName: null,
                hp: 0,
                maxHp: 100,
                captureProgress: 0,
                coverRating: 'unknown',
                lastReinforced: Date.now(),
                capturedAt: null,
            });
        }
    }

    return zones;
}

/** Calculate distance between two points in meters */
export function distanceMeters(a: LatLng, b: LatLng): number {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
    return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export { toRad, toDeg, TILE_SIZE_METERS, EARTH_RADIUS };
