import { describe, it, expect } from 'vitest';
import {
    latLngToTile,
    tileToLatLng,
    isPlayerInZone,
    calculateDecay,
    getZoneColor,
    zoneId,
    distanceMeters,
    generateZonesAround,
} from '../src/services/mapUtils';
import type { Zone } from '../src/types';

function makeZone(overrides: Partial<Zone> = {}): Zone {
    return {
        id: 'zone_0_0',
        tileX: 0,
        tileY: 0,
        center: { lat: 28.6139, lng: 77.209 },
        bounds: { north: 28.6145, south: 28.6133, east: 77.2096, west: 77.2084 },
        owner: null,
        ownerName: null,
        hp: 100,
        maxHp: 100,
        captureProgress: 0,
        coverRating: 'unknown',
        lastReinforced: Date.now(),
        capturedAt: null,
        ...overrides,
    };
}

describe('mapUtils', () => {
    describe('latLngToTile', () => {
        it('should convert lat/lng to consistent tile coordinates', () => {
            const result = latLngToTile(28.6139, 77.209);
            expect(result).toHaveProperty('tileX');
            expect(result).toHaveProperty('tileY');
            expect(typeof result.tileX).toBe('number');
            expect(typeof result.tileY).toBe('number');
        });

        it('should return same tile for same position', () => {
            const a = latLngToTile(28.6139, 77.209);
            const b = latLngToTile(28.6139, 77.209);
            expect(a.tileX).toBe(b.tileX);
            expect(a.tileY).toBe(b.tileY);
        });

        it('should return different tiles for distant positions', () => {
            const a = latLngToTile(28.6139, 77.209);
            const b = latLngToTile(28.6200, 77.215);
            expect(a.tileX === b.tileX && a.tileY === b.tileY).toBe(false);
        });
    });

    describe('isPlayerInZone', () => {
        it('should return true when player is inside zone bounds', () => {
            const zone = makeZone({
                bounds: { north: 28.615, south: 28.613, east: 77.210, west: 77.208 },
            });
            expect(isPlayerInZone({ lat: 28.614, lng: 77.209 }, zone)).toBe(true);
        });

        it('should return false when player is outside zone bounds', () => {
            const zone = makeZone({
                bounds: { north: 28.615, south: 28.613, east: 77.210, west: 77.208 },
            });
            expect(isPlayerInZone({ lat: 28.620, lng: 77.215 }, zone)).toBe(false);
        });

        it('should return true when player is on zone boundary', () => {
            const zone = makeZone({
                bounds: { north: 28.615, south: 28.613, east: 77.210, west: 77.208 },
            });
            expect(isPlayerInZone({ lat: 28.615, lng: 77.210 }, zone)).toBe(true);
        });
    });

    describe('calculateDecay', () => {
        it('should return 0 for uncaptured zones', () => {
            const zone = makeZone({ owner: null, capturedAt: null });
            expect(calculateDecay(zone, Date.now())).toBe(0);
        });

        it('should return full HP if just reinforced', () => {
            const now = Date.now();
            const zone = makeZone({
                owner: 'player1',
                capturedAt: now,
                hp: 100,
                lastReinforced: now,
            });
            expect(calculateDecay(zone, now)).toBe(100);
        });

        it('should decay HP over time', () => {
            const now = Date.now();
            const fiveMinutesAgo = now - 5 * 60 * 1000;
            const zone = makeZone({
                owner: 'player1',
                capturedAt: fiveMinutesAgo,
                hp: 100,
                lastReinforced: fiveMinutesAgo,
            });
            // Default decay = 1 HP per minute, 5 minutes = 5 HP lost
            const result = calculateDecay(zone, now, 1);
            expect(result).toBeLessThan(100);
            expect(result).toBeCloseTo(95, 0);
        });

        it('should not decay below 0', () => {
            const now = Date.now();
            const twoHoursAgo = now - 120 * 60 * 1000;
            const zone = makeZone({
                owner: 'player1',
                capturedAt: twoHoursAgo,
                hp: 50,
                lastReinforced: twoHoursAgo,
            });
            expect(calculateDecay(zone, now, 1)).toBe(0);
        });
    });

    describe('getZoneColor', () => {
        it('should return grey for neutral zones', () => {
            const zone = makeZone({ owner: null });
            const color = getZoneColor(zone, 'player1');
            expect(color).toContain('120, 120, 140');
        });

        it('should return cyan for player-owned zones', () => {
            const zone = makeZone({ owner: 'player1', hp: 100, maxHp: 100 });
            const color = getZoneColor(zone, 'player1');
            expect(color).toContain('0, 245, 255');
        });

        it('should return magenta for enemy zones', () => {
            const zone = makeZone({ owner: 'enemy1', hp: 100, maxHp: 100 });
            const color = getZoneColor(zone, 'player1');
            expect(color).toContain('255, 0, 229');
        });
    });

    describe('zoneId', () => {
        it('should generate consistent zone IDs', () => {
            expect(zoneId(10, 20)).toBe('zone_10_20');
            expect(zoneId(-5, 3)).toBe('zone_-5_3');
        });
    });

    describe('distanceMeters', () => {
        it('should return 0 for same point', () => {
            const p = { lat: 28.6139, lng: 77.209 };
            expect(distanceMeters(p, p)).toBeCloseTo(0, 0);
        });

        it('should calculate reasonable distance between nearby points', () => {
            const a = { lat: 28.6139, lng: 77.209 };
            const b = { lat: 28.6149, lng: 77.209 }; // ~111m north
            const dist = distanceMeters(a, b);
            expect(dist).toBeGreaterThan(50);
            expect(dist).toBeLessThan(200);
        });
    });

    describe('generateZonesAround', () => {
        it('should generate correct number of zones', () => {
            const zones = generateZonesAround({ lat: 28.6139, lng: 77.209 }, 2);
            // radius 2 = 5x5 grid = 25 zones
            expect(zones).toHaveLength(25);
        });

        it('should generate zones with unique IDs', () => {
            const zones = generateZonesAround({ lat: 28.6139, lng: 77.209 }, 1);
            const ids = new Set(zones.map(z => z.id));
            expect(ids.size).toBe(zones.length);
        });

        it('should generate zones as neutral by default', () => {
            const zones = generateZonesAround({ lat: 28.6139, lng: 77.209 }, 1);
            zones.forEach(z => {
                expect(z.owner).toBeNull();
                expect(z.hp).toBe(0);
            });
        });
    });
});
