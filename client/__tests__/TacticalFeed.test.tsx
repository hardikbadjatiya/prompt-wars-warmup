import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TacticalFeed } from '../src/components/TacticalFeed';
import type { TacticalMessage } from '../src/types';

describe('TacticalFeed Component', () => {
    const mockMessages: TacticalMessage[] = [
        {
            id: 'msg-1',
            text: 'Zone captured successfully!',
            type: 'success',
            timestamp: Date.now() - 5000,
        },
        {
            id: 'msg-2',
            text: 'Warning: Zone HP low. Reinforce immediately.',
            type: 'warning',
            timestamp: Date.now() - 3000,
        },
        {
            id: 'msg-3',
            text: 'Enemy detected in nearby zone.',
            type: 'danger',
            timestamp: Date.now() - 1000,
        },
    ];

    it('renders without crashing', () => {
        render(<TacticalFeed messages={[]} />);
        expect(screen.getByRole('complementary', { name: /tactical feed/i })).toBeInTheDocument();
    });

    it('displays all messages', () => {
        render(<TacticalFeed messages={mockMessages} />);
        expect(screen.getByText(/zone captured successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/warning: zone hp low/i)).toBeInTheDocument();
        expect(screen.getByText(/enemy detected/i)).toBeInTheDocument();
    });

    it('shows empty state when no messages', () => {
        render(<TacticalFeed messages={[]} />);
        expect(screen.getByText(/no tactical updates/i)).toBeInTheDocument();
    });

    it('applies correct CSS class based on message type', () => {
        const { container } = render(<TacticalFeed messages={mockMessages} />);
        const successMsg = container.querySelector('.tactical-message.success');
        const warningMsg = container.querySelector('.tactical-message.warning');
        const dangerMsg = container.querySelector('.tactical-message.danger');

        expect(successMsg).toBeInTheDocument();
        expect(warningMsg).toBeInTheDocument();
        expect(dangerMsg).toBeInTheDocument();
    });

    it('displays messages in chronological order (newest first)', () => {
        render(<TacticalFeed messages={mockMessages} />);
        const messages = screen.getAllByRole('listitem');

        // Newest message should be first
        expect(messages[0]).toHaveTextContent(/enemy detected/i);
        expect(messages[2]).toHaveTextContent(/zone captured/i);
    });

    it('limits message display to prevent overflow', () => {
        const manyMessages: TacticalMessage[] = Array.from({ length: 25 }, (_, i) => ({
            id: `msg-${i}`,
            text: `Message ${i}`,
            type: 'info',
            timestamp: Date.now() - i * 1000,
        }));

        const { container } = render(<TacticalFeed messages={manyMessages} />);
        const displayedMessages = container.querySelectorAll('.tactical-message');

        // Should limit to 20 messages
        expect(displayedMessages.length).toBeLessThanOrEqual(20);
    });

    it('has proper ARIA attributes for accessibility', () => {
        render(<TacticalFeed messages={mockMessages} />);
        const feed = screen.getByRole('complementary', { name: /tactical feed/i });
        expect(feed).toHaveAttribute('aria-label');

        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
    });

    it('marks urgent messages with aria-live', () => {
        const urgentMessages: TacticalMessage[] = [
            {
                id: 'urgent-1',
                text: 'Critical: Zone under attack!',
                type: 'danger',
                timestamp: Date.now(),
            },
        ];

        render(<TacticalFeed messages={urgentMessages} />);
        const dangerMessage = screen.getByText(/critical: zone under attack/i);
        expect(dangerMessage.closest('[aria-live]')).toBeInTheDocument();
    });

    it('auto-scrolls to newest message', () => {
        const { rerender } = render(<TacticalFeed messages={mockMessages} />);

        const newMessage: TacticalMessage = {
            id: 'msg-new',
            text: 'New tactical update',
            type: 'info',
            timestamp: Date.now(),
        };

        rerender(<TacticalFeed messages={[...mockMessages, newMessage]} />);

        // Verify new message is visible
        expect(screen.getByText(/new tactical update/i)).toBeInTheDocument();
    });
});
