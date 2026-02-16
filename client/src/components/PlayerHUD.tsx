import React from 'react';
import type { Zone } from '../types';

interface PlayerHUDProps {
    displayName: string;
    photoURL: string | null;
    score: number;
    zonesCaptured: number;
    currentZone: Zone | null;
    isTracking: boolean;
    accuracy: number | null;
    onLogout: () => void;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({
    displayName,
    photoURL,
    score,
    zonesCaptured,
    currentZone,
    isTracking,
    accuracy,
    onLogout,
}) => {
    return (
        <header className="player-hud" role="banner" aria-label="Player Status">
            <div className="hud-left">
                <div className="hud-avatar">
                    {photoURL ? (
                        <img src={photoURL} alt={displayName} className="hud-avatar-img" />
                    ) : (
                        <div className="hud-avatar-placeholder" aria-hidden="true">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className={`hud-status-dot ${isTracking ? 'active' : 'inactive'}`}
                        aria-label={isTracking ? 'GPS active' : 'GPS inactive'} />
                </div>

                <div className="hud-info">
                    <span className="hud-name">{displayName}</span>
                    <div className="hud-meta">
                        {isTracking && accuracy && (
                            <span className="hud-accuracy" aria-label={`GPS accuracy: ${Math.round(accuracy)} meters`}>
                                📡 {Math.round(accuracy)}m
                            </span>
                        )}
                        {currentZone && (
                            <span className="hud-zone-id" aria-label={`Current zone: ${currentZone.id}`}>
                                📍 {currentZone.id.replace('zone_', '')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="hud-stats" role="group" aria-label="Player Statistics">
                <div className="hud-stat" aria-label={`Score: ${score}`}>
                    <span className="hud-stat-value">{score.toLocaleString()}</span>
                    <span className="hud-stat-label">⚡ SCORE</span>
                </div>
                <div className="hud-stat" aria-label={`Zones captured: ${zonesCaptured}`}>
                    <span className="hud-stat-value">{zonesCaptured}</span>
                    <span className="hud-stat-label">🏴 ZONES</span>
                </div>
                {currentZone && currentZone.owner && (
                    <div className="hud-stat" aria-label={`Current zone HP: ${Math.round(currentZone.hp)}`}>
                        <span className="hud-stat-value">{Math.round(currentZone.hp)}</span>
                        <span className="hud-stat-label">❤️ ZONE HP</span>
                    </div>
                )}
            </div>

            <button
                className="hud-logout"
                onClick={onLogout}
                aria-label="Sign out"
                title="Sign out"
            >
                ⎋
            </button>
        </header>
    );
};
