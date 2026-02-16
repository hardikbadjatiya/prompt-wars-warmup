/// <reference types="@types/google.maps" />

import React, { useEffect, useRef, useCallback } from 'react';
import type { LatLng, Zone } from '../types';
import { getZoneColor } from '../services/mapUtils';

declare global {
    interface Window {
        google?: typeof google;
    }
}

interface GameMapProps {
    playerPos: LatLng | null;
    zones: Zone[];
    playerId: string | null;
    onZoneClick: (zone: Zone) => void;
    captureProgress: number | null;
    currentZone: Zone | null;
}

export const GameMap: React.FC<GameMapProps> = ({
    playerPos,
    zones,
    playerId,
    onZoneClick,
    captureProgress,
    currentZone,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const playerMarkerRef = useRef<google.maps.Marker | null>(null);
    const zoneRectanglesRef = useRef<Map<string, google.maps.Rectangle>>(new Map());


    // Initialize map
    useEffect(() => {
        if (!mapRef.current || googleMapRef.current) return;

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API key not set');
            return;
        }

        // Check if Google Maps is already loaded
        if (window.google?.maps) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);

        function initMap() {
            if (!mapRef.current) return;
            googleMapRef.current = new google.maps.Map(mapRef.current, {
                center: playerPos || { lat: 28.6139, lng: 77.209 },
                zoom: 17,
                mapTypeId: 'roadmap',
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                    { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
                    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0e14' }] },
                    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#00F5FF' }] },
                    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
                    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6e7681' }] },
                    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1a0f' }] },
                    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
                ],
            });
        }
    }, []);

    // Update player marker
    useEffect(() => {
        if (!googleMapRef.current || !playerPos) return;

        if (!playerMarkerRef.current) {
            playerMarkerRef.current = new google.maps.Marker({
                map: googleMapRef.current,
                position: playerPos,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#00F5FF',
                    fillOpacity: 1,
                    strokeColor: '#002933',
                    strokeWeight: 3,
                },
                title: 'You',
                zIndex: 1000,
            });

            // Accuracy ring
            new google.maps.Circle({
                map: googleMapRef.current,
                center: playerPos,
                radius: 15,
                fillColor: '#00F5FF',
                fillOpacity: 0.1,
                strokeColor: '#00F5FF',
                strokeOpacity: 0.3,
                strokeWeight: 1,
            });
        } else {
            playerMarkerRef.current.setPosition(playerPos);
        }

        googleMapRef.current.panTo(playerPos);
    }, [playerPos]);

    // Render zones
    const renderZones = useCallback(() => {
        if (!googleMapRef.current) return;

        const currentIds = new Set(zones.map(z => z.id));

        // Remove old zones
        for (const [id, rect] of zoneRectanglesRef.current) {
            if (!currentIds.has(id)) {
                rect.setMap(null);
                zoneRectanglesRef.current.delete(id);
            }
        }

        // Add/update zones
        for (const zone of zones) {
            const color = getZoneColor(zone, playerId);
            const isActive = currentZone?.id === zone.id;
            const strokeWeight = isActive ? 3 : 1;
            const strokeColor = isActive ? '#FFFFFF' : zone.owner ? (zone.owner === playerId ? '#00F5FF' : '#FF00E5') : '#4a4a5a';

            const existing = zoneRectanglesRef.current.get(zone.id);
            if (existing) {
                existing.setOptions({
                    fillColor: color,
                    fillOpacity: 0.4,
                    strokeColor,
                    strokeWeight,
                });
            } else {
                const rect = new google.maps.Rectangle({
                    map: googleMapRef.current,
                    bounds: {
                        north: zone.bounds.north,
                        south: zone.bounds.south,
                        east: zone.bounds.east,
                        west: zone.bounds.west,
                    },
                    fillColor: color,
                    fillOpacity: 0.4,
                    strokeColor,
                    strokeWeight,
                    strokeOpacity: 0.8,
                    clickable: true,
                    zIndex: 10,
                });

                rect.addListener('click', () => onZoneClick(zone));
                zoneRectanglesRef.current.set(zone.id, rect);
            }
        }
    }, [zones, playerId, currentZone, onZoneClick]);

    useEffect(() => {
        renderZones();
    }, [renderZones]);

    return (
        <div className="game-map-container" role="application" aria-label="Game Map">
            <div ref={mapRef} className="game-map" id="game-map" />

            {/* Capture progress overlay */}
            {captureProgress !== null && currentZone && (
                <div className="capture-overlay" role="progressbar" aria-valuenow={captureProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Zone capture progress">
                    <div className="capture-ring">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke={currentZone.owner ? '#FF00E5' : '#00F5FF'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${captureProgress * 2.83} ${283 - captureProgress * 2.83}`}
                                transform="rotate(-90 50 50)"
                                className="capture-progress-ring"
                            />
                        </svg>
                        <span className="capture-text">{Math.round(captureProgress)}%</span>
                    </div>
                    <p className="capture-label">
                        {currentZone.owner ? 'CONTESTING ZONE' : 'CAPTURING ZONE'}
                    </p>
                </div>
            )}

            {/* No GPS message */}
            {!playerPos && (
                <div className="no-gps-overlay" role="alert">
                    <div className="no-gps-icon" aria-hidden="true">📡</div>
                    <p>Waiting for GPS signal…</p>
                    <p className="no-gps-hint">Enable location access to begin</p>
                </div>
            )}
        </div>
    );
};
