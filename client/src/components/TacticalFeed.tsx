import React, { useEffect, useRef } from 'react';
import type { TacticalMessage } from '../types';

interface TacticalFeedProps {
    messages: TacticalMessage[];
}

export const TacticalFeed: React.FC<TacticalFeedProps> = ({ messages }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages]);

    const typeColors: Record<string, string> = {
        info: '#00F5FF',
        warning: '#FFB800',
        alert: '#FF00E5',
        success: '#39FF14',
    };

    const typeIcons: Record<string, string> = {
        info: '🔹',
        warning: '⚠️',
        alert: '🚨',
        success: '✅',
    };

    if (messages.length === 0) return null;

    return (
        <div className="tactical-feed" role="log" aria-label="Tactical Feed" aria-live="polite">
            <div className="tactical-header">
                <span className="tactical-icon" aria-hidden="true">🤖</span>
                <span className="tactical-title">GEMINI TACTICAL</span>
                <span className="tactical-pulse" aria-hidden="true" />
            </div>

            <div className="tactical-messages" ref={feedRef}>
                {messages.slice(-5).map((msg) => (
                    <div
                        key={msg.id}
                        className="tactical-msg"
                        style={{ borderLeftColor: typeColors[msg.type] }}
                        role="status"
                    >
                        <span className="tac-icon" aria-hidden="true">{typeIcons[msg.type]}</span>
                        <span className="tac-text">{msg.text}</span>
                        <span className="tac-time" aria-label={new Date(msg.timestamp).toLocaleTimeString()}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
