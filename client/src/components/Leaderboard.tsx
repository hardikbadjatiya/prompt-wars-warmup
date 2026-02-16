import React from 'react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentPlayerId: string | null;
    isOpen: boolean;
    onToggle: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentPlayerId, isOpen, onToggle }) => {
    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return { color: '#FFD700', icon: '👑' };
            case 2: return { color: '#C0C0C0', icon: '🥈' };
            case 3: return { color: '#CD7F32', icon: '🥉' };
            default: return { color: '#8b949e', icon: `#${rank}` };
        }
    };

    return (
        <div className={`leaderboard ${isOpen ? 'open' : ''}`} role="region" aria-label="Leaderboard">
            <button
                className="leaderboard-toggle"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls="leaderboard-list"
                aria-label={isOpen ? 'Close leaderboard' : 'Open leaderboard'}
            >
                <span className="lb-toggle-icon">🏆</span>
                <span className="lb-toggle-text">LEADERBOARD</span>
                <span className={`lb-toggle-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">▸</span>
            </button>

            <div id="leaderboard-list" className="leaderboard-list">
                {entries.length === 0 && (
                    <div className="lb-empty">
                        <p>No players yet</p>
                        <p className="lb-empty-hint">Capture zones to climb the ranks!</p>
                    </div>
                )}

                {entries.map((entry) => {
                    const rankStyle = getRankStyle(entry.rank);
                    const isCurrentPlayer = entry.uid === currentPlayerId;

                    return (
                        <div
                            key={entry.uid}
                            className={`lb-entry ${isCurrentPlayer ? 'current-player' : ''}`}
                            role="listitem"
                            aria-label={`Rank ${entry.rank}: ${entry.displayName}, ${entry.score} points`}
                        >
                            <span className="lb-rank" style={{ color: rankStyle.color }} aria-hidden="true">
                                {typeof rankStyle.icon === 'string' && rankStyle.icon.startsWith('#')
                                    ? rankStyle.icon
                                    : rankStyle.icon
                                }
                            </span>

                            <div className="lb-player">
                                {entry.photoURL ? (
                                    <img
                                        src={entry.photoURL}
                                        alt=""
                                        className="lb-avatar"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <div className="lb-avatar-placeholder" aria-hidden="true">
                                        {entry.displayName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="lb-name">{entry.displayName}</span>
                                {isCurrentPlayer && <span className="lb-you-badge">YOU</span>}
                            </div>

                            <div className="lb-stats">
                                <span className="lb-score">{entry.score.toLocaleString()} ⚡</span>
                                <span className="lb-zones">{entry.zonesCaptured} zones</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
