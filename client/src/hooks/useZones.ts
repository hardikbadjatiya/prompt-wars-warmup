import { useState, useEffect, useCallback, useRef } from 'react';
import type { LatLng, Zone } from '../types';
import {
    generateZonesAround,
    calculateDecay,
    zoneId,
    latLngToTile,
} from '../services/mapUtils';

const CAPTURE_TIME_MS = 3000; // 3 seconds to capture a zone
const DECAY_INTERVAL_MS = 10000; // Check decay every 10 seconds
const DECAY_RATE_PER_MINUTE = 2; // HP loss per minute

export function useZones(playerPos: LatLng | null, playerId: string | null) {
    const [zones, setZones] = useState<Map<string, Zone>>(new Map());
    const [currentZone, setCurrentZone] = useState<Zone | null>(null);
    const [captureTimer, setCaptureTimer] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [zonesCapturedCount, setZonesCapturedCount] = useState(0);
    const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Generate zones around player
    useEffect(() => {
        if (!playerPos) return;

        const newZones = generateZonesAround(playerPos, 5);
        setZones(prev => {
            const merged = new Map(prev);
            for (const zone of newZones) {
                if (!merged.has(zone.id)) {
                    merged.set(zone.id, zone);
                }
            }
            return merged;
        });
    }, [playerPos?.lat, playerPos?.lng]);

    // Track current zone
    useEffect(() => {
        if (!playerPos) {
            setCurrentZone(null);
            return;
        }

        const tile = latLngToTile(playerPos.lat, playerPos.lng);
        const id = zoneId(tile.tileX, tile.tileY);
        const zone = zones.get(id) || null;
        setCurrentZone(zone);
    }, [playerPos, zones]);

    // Auto-capture when in uncaptured/enemy zone
    useEffect(() => {
        if (!currentZone || !playerId || currentZone.owner === playerId) {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
            setCaptureTimer(null);
            return;
        }

        const startTime = Date.now();
        setCaptureTimer(0);

        captureIntervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / CAPTURE_TIME_MS) * 100);
            setCaptureTimer(progress);

            if (progress >= 100) {
                // Capture the zone!
                setZones(prev => {
                    const updated = new Map(prev);
                    const zone = updated.get(currentZone.id);
                    if (zone) {
                        updated.set(currentZone.id, {
                            ...zone,
                            owner: playerId,
                            ownerName: 'You',
                            hp: 100,
                            maxHp: 100,
                            captureProgress: 100,
                            capturedAt: Date.now(),
                            lastReinforced: Date.now(),
                        });
                    }
                    return updated;
                });

                setScore(s => s + 10);
                setZonesCapturedCount(c => c + 1);
                setCaptureTimer(null);

                if (captureIntervalRef.current) {
                    clearInterval(captureIntervalRef.current);
                    captureIntervalRef.current = null;
                }
            }
        }, 100);

        return () => {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        };
    }, [currentZone?.id, playerId]);

    // Reinforce owned zone when standing in it
    useEffect(() => {
        if (!currentZone || !playerId || currentZone.owner !== playerId) return;

        const interval = setInterval(() => {
            setZones(prev => {
                const updated = new Map(prev);
                const zone = updated.get(currentZone.id);
                if (zone && zone.owner === playerId) {
                    updated.set(currentZone.id, {
                        ...zone,
                        hp: Math.min(zone.maxHp, zone.hp + 5),
                        lastReinforced: Date.now(),
                    });
                }
                return updated;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [currentZone?.id, playerId]);

    // Decay loop
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setZones(prev => {
                const updated = new Map(prev);
                let changed = false;
                for (const [id, zone] of updated) {
                    if (zone.owner) {
                        const newHp = calculateDecay(zone, now, DECAY_RATE_PER_MINUTE);
                        if (newHp !== zone.hp) {
                            changed = true;
                            if (newHp <= 0) {
                                updated.set(id, { ...zone, owner: null, ownerName: null, hp: 0, capturedAt: null });
                            } else {
                                updated.set(id, { ...zone, hp: newHp });
                            }
                        }
                    }
                }
                return changed ? updated : prev;
            });
        }, DECAY_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    const getZonesArray = useCallback((): Zone[] => {
        return Array.from(zones.values());
    }, [zones]);

    const getNearbyZones = useCallback((pos: LatLng, count = 10): Zone[] => {
        return getZonesArray()
            .sort((a, b) => {
                const da = Math.abs(a.center.lat - pos.lat) + Math.abs(a.center.lng - pos.lng);
                const db = Math.abs(b.center.lat - pos.lat) + Math.abs(b.center.lng - pos.lng);
                return da - db;
            })
            .slice(0, count);
    }, [getZonesArray]);

    return {
        zones,
        zonesArray: getZonesArray(),
        currentZone,
        captureTimer,
        score,
        zonesCapturedCount,
        getNearbyZones,
    };
}
