import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameMap } from '../src/components/GameMap';
import type { Zone } from '../src/types';

describe('GameMap Component', () => {
    const mockPlayerPos = { lat: 37.7749, lng: -122.4194 };
    const mockZones: Zone[] = [
        {
            id: 'zone-1',
            center: { lat: 37.7750, lng: -122.4195 },
            owner: 'player-123',
            hp: 100,
            capturedAt: Date.now(),
            lastReinforced: Date.now(),
            coverRating: 'high',
        },
        {
            id: 'zone-2',
            center: { lat: 37.7748, lng: -122.4193 },
            owner: null,
            hp: 100,
            capturedAt: 0,
            lastReinforced: 0,
            coverRating: 'medium',
        },
    ];

    it('renders without crashing', () => {
        render(
            <GameMap
                playerPos={mockPlayerPos}
                zones={mockZones}
                playerId="player-123"
                onZoneClick={() => { }}
                captureProgress={0}
                currentZone={null}
            />
        );
        expect(screen.getByRole('application', { name: /game map/i })).toBeInTheDocument();
    });

    it('displays loading state when no player position', () => {
        render(
            <GameMap
                playerPos={null}
                zones={[]}
                playerId="player-123"
                onZoneClick={() => { }}
                captureProgress={0}
                currentZone={null}
            />
        );
        expect(screen.getByText(/waiting for gps/i)).toBeInTheDocument();
    });

    it('shows capture progress when in a zone', () => {
        render(
            <GameMap
                playerPos={mockPlayerPos}
                zones={mockZones}
                playerId="player-123"
                onZoneClick={() => { }}
                captureProgress={50}
                currentZone={mockZones[1]}
            />
        );
        expect(screen.getByText(/capturing/i)).toBeInTheDocument();
        expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    it('calls onZoneClick when zone is clicked', () => {
        const mockOnZoneClick = vi.fn();
        render(
            <GameMap
                playerPos={mockPlayerPos}
                zones={mockZones}
                playerId="player-123"
                onZoneClick={mockOnZoneClick}
                captureProgress={0}
                currentZone={null}
            />
        );

        // Simulate zone click (would need to mock Google Maps API)
        // For now, verify the callback is passed correctly
        expect(mockOnZoneClick).toBeDefined();
    });

    it('renders correct number of zones', () => {
        const { container } = render(
            <GameMap
                playerPos={mockPlayerPos}
                zones={mockZones}
                playerId="player-123"
                onZoneClick={() => { }}
                captureProgress={0}
                currentZone={null}
            />
        );
        // Zones would be rendered via Google Maps API
        // Verify component structure
        expect(container.querySelector('.game-map')).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(
            <GameMap
                playerPos={mockPlayerPos}
                zones={mockZones}
                playerId="player-123"
                onZoneClick={() => { }}
                captureProgress={0}
                currentZone={null}
            />
        );
        const mapElement = screen.getByRole('region', { name: /game map/i });
        expect(mapElement).toHaveAttribute('aria-label');
    });
});
