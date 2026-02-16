import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Leaderboard } from '../src/components/Leaderboard';
import type { LeaderboardEntry } from '../src/types';

describe('Leaderboard Component', () => {
    const mockEntries: LeaderboardEntry[] = [
        {
            uid: 'player-1',
            displayName: 'Alice',
            photoURL: 'https://example.com/alice.jpg',
            score: 150,
            zonesCaptured: 10,
            rank: 1,
        },
        {
            uid: 'player-2',
            displayName: 'Bob',
            photoURL: null,
            score: 120,
            zonesCaptured: 8,
            rank: 2,
        },
        {
            uid: 'player-3',
            displayName: 'Charlie',
            photoURL: 'https://example.com/charlie.jpg',
            score: 90,
            zonesCaptured: 6,
            rank: 3,
        },
    ];

    it('renders without crashing', () => {
        render(
            <Leaderboard
                entries={[]}
                currentPlayerId="player-1"
                isOpen={false}
                onToggle={() => { }}
            />
        );
        expect(screen.getByRole('button', { name: /leaderboard/i })).toBeInTheDocument();
    });

    it('shows leaderboard when open', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('hides leaderboard when closed', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={false}
                onToggle={() => { }}
            />
        );
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('calls onToggle when button clicked', () => {
        const mockToggle = vi.fn();
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={false}
                onToggle={mockToggle}
            />
        );

        const button = screen.getByRole('button', { name: /leaderboard/i });
        fireEvent.click(button);

        expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('highlights current player', () => {
        const { container } = render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-2"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        const currentPlayerRow = container.querySelector('.leaderboard-entry.current-player');
        expect(currentPlayerRow).toBeInTheDocument();
        expect(currentPlayerRow).toHaveTextContent('Bob');
    });

    it('displays correct rank badges', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        // Check for rank badges (1st, 2nd, 3rd)
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows player scores and zones captured', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        expect(screen.getByText(/150/)).toBeInTheDocument(); // Alice's score
        expect(screen.getByText(/10/)).toBeInTheDocument(); // Alice's zones
        expect(screen.getByText(/120/)).toBeInTheDocument(); // Bob's score
    });

    it('handles missing player photos gracefully', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-2"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        // Bob has no photo, should show default avatar
        const bobEntry = screen.getByText('Bob').closest('.leaderboard-entry');
        expect(bobEntry).toBeInTheDocument();
    });

    it('shows empty state when no entries', () => {
        render(
            <Leaderboard
                entries={[]}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        expect(screen.getByText(/no players yet/i)).toBeInTheDocument();
    });

    it('sorts entries by rank', () => {
        const unsortedEntries = [mockEntries[2], mockEntries[0], mockEntries[1]];

        render(
            <Leaderboard
                entries={unsortedEntries}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        const entries = screen.getAllByRole('listitem');
        expect(entries[0]).toHaveTextContent('Alice'); // Rank 1
        expect(entries[1]).toHaveTextContent('Bob');   // Rank 2
        expect(entries[2]).toHaveTextContent('Charlie'); // Rank 3
    });

    it('has proper accessibility attributes', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={true}
                onToggle={() => { }}
            />
        );

        const panel = screen.getByRole('region', { name: /leaderboard/i });
        expect(panel).toHaveAttribute('aria-label');

        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
        render(
            <Leaderboard
                entries={mockEntries}
                currentPlayerId="player-1"
                isOpen={false}
                onToggle={() => { }}
            />
        );

        const button = screen.getByRole('button', { name: /leaderboard/i });
        expect(button).toHaveAttribute('aria-label');

        // Button should be keyboard accessible
        button.focus();
        expect(document.activeElement).toBe(button);
    });
});
