import React from 'react';
import type { Mission } from '../types';

interface MissionPanelProps {
    missions: Mission[];
    isOpen: boolean;
    onToggle: () => void;
    loading: boolean;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({ missions, isOpen, onToggle, loading }) => {
    const missionTypeIcon: Record<string, string> = {
        capture: '🎯',
        strategic: '♟️',
        exploration: '🧭',
        defense: '🛡️',
    };

    const missionTypeColor: Record<string, string> = {
        capture: '#00F5FF',
        strategic: '#FF00E5',
        exploration: '#39FF14',
        defense: '#FFB800',
    };

    return (
        <div className={`mission-panel ${isOpen ? 'open' : ''}`} role="region" aria-label="Mission Panel">
            <button
                className="mission-toggle"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls="mission-list"
                aria-label={isOpen ? 'Close mission panel' : 'Open mission panel'}
            >
                <span className="mission-toggle-icon">🎯</span>
                <span className="mission-toggle-text">MISSIONS</span>
                <span className={`mission-toggle-arrow ${isOpen ? 'open' : ''}`} aria-hidden="true">▸</span>
                {missions.filter(m => !m.completed).length > 0 && (
                    <span className="mission-badge" aria-label={`${missions.filter(m => !m.completed).length} active missions`}>
                        {missions.filter(m => !m.completed).length}
                    </span>
                )}
            </button>

            <div id="mission-list" className="mission-list" aria-live="polite">
                {loading && (
                    <div className="mission-loading" aria-label="Loading missions">
                        <div className="spinner-dots">
                            <span /><span /><span />
                        </div>
                        <p>Gemini analyzing area…</p>
                    </div>
                )}

                {!loading && missions.length === 0 && (
                    <div className="mission-empty">
                        <p>No active missions</p>
                        <p className="mission-empty-hint">Move around to receive AI-generated missions</p>
                    </div>
                )}

                {missions.map((mission) => (
                    <div
                        key={mission.id}
                        className={`mission-card ${mission.completed ? 'completed' : ''}`}
                        role="article"
                        aria-label={`Mission: ${mission.title}`}
                    >
                        <div className="mission-header">
                            <span className="mission-icon" aria-hidden="true">{missionTypeIcon[mission.type] || '📋'}</span>
                            <div className="mission-info">
                                <h3 className="mission-title">{mission.title}</h3>
                                <span
                                    className="mission-type-badge"
                                    style={{ color: missionTypeColor[mission.type] || '#fff', borderColor: missionTypeColor[mission.type] || '#fff' }}
                                >
                                    {mission.type.toUpperCase()}
                                </span>
                            </div>
                            <span className="mission-reward" aria-label={`${mission.reward} points reward`}>
                                +{mission.reward} ⚡
                            </span>
                        </div>

                        <p className="mission-desc">{mission.description}</p>

                        <div className="mission-objectives" role="list" aria-label="Mission objectives">
                            {mission.objectives.map((obj, idx) => (
                                <div key={idx} className="mission-objective" role="listitem">
                                    <span
                                        className={`obj-check ${obj.completed ? 'done' : ''}`}
                                        aria-hidden="true"
                                    >
                                        {obj.completed ? '✓' : '○'}
                                    </span>
                                    <span className="obj-text">{obj.description}</span>
                                    <span className="obj-progress" aria-label={`${obj.current} of ${obj.target}`}>
                                        {obj.current}/{obj.target}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {!mission.completed && (
                            <div className="mission-progress-bar" role="progressbar" aria-valuenow={mission.objectives.filter(o => o.completed).length} aria-valuemax={mission.objectives.length}>
                                <div
                                    className="mission-progress-fill"
                                    style={{
                                        width: `${(mission.objectives.filter(o => o.completed).length / mission.objectives.length) * 100}%`,
                                        background: missionTypeColor[mission.type],
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
