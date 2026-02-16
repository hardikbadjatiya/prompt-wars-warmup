import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionPanel } from '../src/components/MissionPanel';
import type { Mission } from '../src/types';

describe('MissionPanel', () => {
    const mockMissions: Mission[] = [
        {
            id: 'm1',
            title: 'Capture Zone',
            description: 'Capture a nearby zone',
            type: 'capture',
            objectives: [
                { description: 'Capture 1 zone', target: 1, current: 0, completed: false }
            ],
            reward: 50,
            expiresAt: Date.now() + 10000,
            completed: false
        }
    ];

    it('renders closed initially', () => {
        render(<MissionPanel missions={mockMissions} isOpen={false} onToggle={() => { }} loading={false} />);
        const panel = screen.getByRole('region', { name: 'Mission Panel' });
        expect(panel).not.toHaveClass('open');
    });

    it('renders missions when open', () => {
        render(<MissionPanel missions={mockMissions} isOpen={true} onToggle={() => { }} loading={false} />);
        expect(screen.getByText('Capture Zone')).toBeInTheDocument();
        expect(screen.getByText('Capture a nearby zone')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<MissionPanel missions={[]} isOpen={true} onToggle={() => { }} loading={true} />);
        expect(screen.getByLabelText('Loading missions')).toBeInTheDocument();
    });

    it('calls onToggle when clicked', () => {
        const onToggle = vi.fn();
        render(<MissionPanel missions={mockMissions} isOpen={false} onToggle={onToggle} loading={false} />);
        const button = screen.getByRole('button', { name: /Open mission panel/i });
        fireEvent.click(button);
        expect(onToggle).toHaveBeenCalled();
    });

    it('shows empty state when no missions', () => {
        render(<MissionPanel missions={[]} isOpen={true} onToggle={() => { }} loading={false} />);
        expect(screen.getByText('No active missions')).toBeInTheDocument();
    });
});
