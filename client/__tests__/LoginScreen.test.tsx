import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginScreen } from '../src/components/LoginScreen';

describe('LoginScreen Component', () => {
    it('renders without crashing', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        expect(screen.getByRole('main', { name: /login screen/i })).toBeInTheDocument();
    });

    it('displays app title correctly', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        expect(screen.getByText('AREA')).toBeInTheDocument();
        expect(screen.getByText('CONTROL')).toBeInTheDocument();
        expect(screen.getByText('LOOP')).toBeInTheDocument();
    });

    it('shows sign in button when not loading', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        const button = screen.getByRole('button', { name: /sign in with google/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    it('disables button when loading', () => {
        render(<LoginScreen onLogin={() => { }} loading={true} error={null} />);
        const button = screen.getByRole('button', { name: /signing in/i });
        expect(button).toBeDisabled();
    });

    it('shows loading spinner when loading', () => {
        render(<LoginScreen onLogin={() => { }} loading={true} error={null} />);
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
        const spinner = screen.getByLabelText(/loading/i);
        expect(spinner).toBeInTheDocument();
    });

    it('calls onLogin when button clicked', () => {
        const mockOnLogin = vi.fn();
        render(<LoginScreen onLogin={mockOnLogin} loading={false} error={null} />);

        const button = screen.getByRole('button', { name: /sign in with google/i });
        fireEvent.click(button);

        expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('displays error message when error prop is set', () => {
        const errorMessage = 'Authentication failed. Please try again.';
        render(<LoginScreen onLogin={() => { }} loading={false} error={errorMessage} />);

        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveTextContent(errorMessage);
    });

    it('does not show error when error is null', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays app description', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        expect(screen.getByText(/walk. capture. dominate/i)).toBeInTheDocument();
        expect(screen.getByText(/ai-powered territory control/i)).toBeInTheDocument();
    });

    it('shows technology badges', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        expect(screen.getByText(/google maps/i)).toBeInTheDocument();
        expect(screen.getByText(/gemini ai/i)).toBeInTheDocument();
        expect(screen.getByText(/firebase/i)).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);

        const main = screen.getByRole('main', { name: /login screen/i });
        expect(main).toHaveAttribute('aria-label');

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');

        const button = screen.getByRole('button', { name: /sign in with google/i });
        expect(button).toHaveAttribute('aria-label');
    });

    it('shows correct aria-busy state when loading', () => {
        const { rerender } = render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);

        let button = screen.getByRole('button', { name: /sign in with google/i });
        expect(button).toHaveAttribute('aria-busy', 'false');

        rerender(<LoginScreen onLogin={() => { }} loading={true} error={null} />);

        button = screen.getByRole('button', { name: /signing in/i });
        expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('renders animated background grid', () => {
        const { container } = render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        const grid = container.querySelector('.login-bg-grid');
        expect(grid).toBeInTheDocument();

        // Should have 48 grid cells
        const cells = container.querySelectorAll('.grid-cell');
        expect(cells.length).toBe(48);
    });

    it('renders logo SVG', () => {
        const { container } = render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        const logo = container.querySelector('.login-logo svg');
        expect(logo).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
        render(<LoginScreen onLogin={() => { }} loading={false} error={null} />);
        const button = screen.getByRole('button', { name: /sign in with google/i });

        button.focus();
        expect(document.activeElement).toBe(button);
    });

    it('error message has aria-live for screen readers', () => {
        const errorMessage = 'Login failed';
        render(<LoginScreen onLogin={() => { }} loading={false} error={errorMessage} />);

        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveAttribute('aria-live', 'assertive');
    });
});
