import React from 'react';
import type { Zone } from '../types';

interface ZoneInfoProps {
    zone: Zone | null;
    playerId: string | null;
    onClose: () => void;
}

export const ZoneInfo: React.FC<ZoneInfoProps> = ({ zone, playerId, onClose }) => {
    if (!zone) return null;

    const isOwned = zone.owner === playerId;
    const coverColors: Record<string, string> = {
        high: '#39FF14',
        medium: '#FFB800',
        low: '#FF4444',
        unknown: '#8b949e',
    };

    return (
        <div className="zone-info-overlay" role="dialog" aria-label="Zone Information" aria-modal="false">
            <div className="zone-info-card">
                <button className="zone-info-close" onClick={onClose} aria-label="Close zone info">✕</button>

                <h2 className="zone-info-title">
                    <span className="zone-info-marker" style={{ background: isOwned ? '#00F5FF' : zone.owner ? '#FF00E5' : '#4a4a5a' }} aria-hidden="true" />
                    Zone {zone.id.replace('zone_', '')}
                </h2>

                <div className="zone-info-grid" role="group" aria-label="Zone details">
                    <div className="zone-detail">
                        <span className="zone-label">Status</span>
                        <span className={`zone-value ${isOwned ? 'owned' : zone.owner ? 'enemy' : 'neutral'}`}>
                            {isOwned ? '🏴 YOUR TERRITORY' : zone.owner ? '⚔️ ENEMY HELD' : '⬜ NEUTRAL'}
                        </span>
                    </div>

                    {zone.owner && (
                        <>
                            <div className="zone-detail">
                                <span className="zone-label">HP</span>
                                <div className="zone-hp-bar" role="progressbar" aria-valuenow={zone.hp} aria-valuemin={0} aria-valuemax={zone.maxHp}>
                                    <div
                                        className="zone-hp-fill"
                                        style={{
                                            width: `${(zone.hp / zone.maxHp) * 100}%`,
                                            background: isOwned
                                                ? `linear-gradient(90deg, #00F5FF, #0088FF)`
                                                : `linear-gradient(90deg, #FF00E5, #FF4444)`,
                                        }}
                                    />
                                    <span className="zone-hp-text">{Math.round(zone.hp)}/{zone.maxHp}</span>
                                </div>
                            </div>

                            <div className="zone-detail">
                                <span className="zone-label">Owner</span>
                                <span className="zone-value">{zone.ownerName || 'Unknown'}</span>
                            </div>
                        </>
                    )}

                    <div className="zone-detail">
                        <span className="zone-label">Cover Rating</span>
                        <span className="zone-cover" style={{ color: coverColors[zone.coverRating] }}>
                            {zone.coverRating === 'unknown' ? '❓ UNSCANNED' : `${zone.coverRating.toUpperCase()} COVER`}
                        </span>
                    </div>

                    <div className="zone-detail">
                        <span className="zone-label">Coordinates</span>
                        <span className="zone-value zone-coords">
                            {zone.center.lat.toFixed(5)}, {zone.center.lng.toFixed(5)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
