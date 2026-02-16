import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDecay, isPlayerInZone, generateZonesAround, latLngToTile, zoneId } from '../src/services/mapUtils';
import type { Zone, LatLng } from '../src/types';

// Tests focused on zone capture and decay game logic

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

describe('Zone Decay System', () => {
    it('should decay a zone proportional to elapsed time', () => {
        const now = Date.now();
        const zone = makeZone({
            owner: 'p1',
            capturedAt: now - 600000,       // captured 10 min ago
            hp: 100,
            lastReinforced: now - 600000,   // reinforced 10 min ago
        });

        const result = calculateDecay(zone, now, 2); // 2 HP/min
        expect(result).toBeCloseTo(80, 0); // 100 - (10 * 2) = 80
    });

    it('should fully decay to 0 after enough time', () => {
        const now = Date.now();
        const zone = makeZone({
            owner: 'p1',
            capturedAt: now - 7200000,     // 2 hours ago
            hp: 50,
            lastReinforced: now - 7200000,
        });

        expect(calculateDecay(zone, now, 1)).toBe(0); // 50 - 120 = clamped to 0
    });

    it('should preserve HP if reinforced recently', () => {
        const now = Date.now();
        const zone = makeZone({
            owner: 'p1',
            capturedAt: now - 600000,
            hp: 80,
            lastReinforced: now - 10000, // reinforced 10 seconds ago
        });

        const result = calculateDecay(zone, now, 2);
        // ~0.33 HP lost in 10 seconds at 2/min rate
        expect(result).toBeGreaterThan(79);
    });
});

describe('Zone Capture Logic', () => {
    it('should detect player entering a zone', () => {
        const zone = makeZone({
            bounds: { north: 28.615, south: 28.613, east: 77.210, west: 77.208 },
        });

        // Player walks into zone
        const outsidePos: LatLng = { lat: 28.612, lng: 77.209 };
        const insidePos: LatLng = { lat: 28.614, lng: 77.209 };

        expect(isPlayerInZone(outsidePos, zone)).toBe(false);
        expect(isPlayerInZone(insidePos, zone)).toBe(true);
    });

    it('should correctly identify the zone for a given position', () => {
        const pos: LatLng = { lat: 28.6139, lng: 77.209 };
        const tile = latLngToTile(pos.lat, pos.lng);
        const id = zoneId(tile.tileX, tile.tileY);

        // Generate zones and find the one containing the player
        const zones = generateZonesAround(pos, 3);
        const matchingZone = zones.find(z => z.id === id);

        expect(matchingZone).toBeDefined();
        if (matchingZone) {
            expect(isPlayerInZone(pos, matchingZone)).toBe(true);
        }
    });

    it('should create non-overlapping zones in a grid', () => {
        const center: LatLng = { lat: 28.6139, lng: 77.209 };
        const zones = generateZonesAround(center, 2);

        // Check no two zones share an ID
        const idSet = new Set(zones.map(z => z.id));
        expect(idSet.size).toBe(zones.length);

        // Check all zones have valid bounds
        zones.forEach(zone => {
            expect(zone.bounds.north).toBeGreaterThan(zone.bounds.south);
            expect(zone.bounds.east).toBeGreaterThan(zone.bounds.west);
        });
    });
});
