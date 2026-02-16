import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMissions, fetchCommentary, fetchCoverAnalysis } from '../src/services/api';

// Mock fetch globally
global.fetch = vi.fn();

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchMissions', () => {
        it('sends correct request to missions endpoint', async () => {
            const mockResponse = {
                missions: [
                    {
                        id: 'mission-1',
                        title: 'Capture Zone',
                        description: 'Capture a nearby zone',
                        type: 'capture',
                        objectives: [],
                        reward: 20,
                        expiresAt: Date.now() + 600000,
                        completed: false,
                    },
                ],
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await fetchMissions(
                'test-token',
                { lat: 37.7749, lng: -122.4194 },
                []
            );

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/mission',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token',
                    }),
                })
            );

            expect(result).toEqual(mockResponse);
        });

        it('handles API errors gracefully', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(
                fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, [])
            ).rejects.toThrow();
        });

        it('includes nearby zones in request body', async () => {
            const nearbyZones = [
                { id: 'zone-1', owner: null, coverRating: 'high', hp: 100 },
            ];

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ missions: [] }),
            });

            await fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, nearbyZones);

            const callArgs = (global.fetch as any).mock.calls[0];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.nearbyZones).toEqual(nearbyZones);
        });
    });

    describe('fetchCommentary', () => {
        it('sends correct request to commentary endpoint', async () => {
            const mockResponse = {
                message: 'Zone HP low. Reinforce soon.',
                type: 'warning',
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await fetchCommentary(
                'test-token',
                { lat: 37.7749, lng: -122.4194 },
                null,
                []
            );

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/commentary',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token',
                    }),
                })
            );

            expect(result).toEqual(mockResponse);
        });

        it('includes current zone in request when provided', async () => {
            const currentZone = {
                id: 'zone-1',
                owner: 'player-123',
                hp: 80,
                coverRating: 'high',
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Test', type: 'info' }),
            });

            await fetchCommentary(
                'test-token',
                { lat: 37.7749, lng: -122.4194 },
                currentZone,
                []
            );

            const callArgs = (global.fetch as any).mock.calls[0];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.currentZone).toEqual(currentZone);
        });

        it('handles null current zone', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Test', type: 'info' }),
            });

            await fetchCommentary('test-token', { lat: 37.7749, lng: -122.4194 }, null, []);

            const callArgs = (global.fetch as any).mock.calls[0];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.currentZone).toBeNull();
        });
    });

    describe('fetchCoverAnalysis', () => {
        it('sends correct request to cover analysis endpoint', async () => {
            const mockResponse = {
                coverRating: 'high',
                analysis: 'Dense urban area with good cover',
                tacticalAdvice: 'Excellent defensive position',
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await fetchCoverAnalysis('test-token', {
                lat: 37.7749,
                lng: -122.4194,
            });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/gemini/cover',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer test-token',
                    }),
                })
            );

            expect(result).toEqual(mockResponse);
        });

        it('validates position coordinates', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    coverRating: 'medium',
                    analysis: 'Test',
                    tacticalAdvice: 'Test',
                }),
            });

            await fetchCoverAnalysis('test-token', { lat: 37.7749, lng: -122.4194 });

            const callArgs = (global.fetch as any).mock.calls[0];
            const requestBody = JSON.parse(callArgs[1].body);

            expect(requestBody.position.lat).toBe(37.7749);
            expect(requestBody.position.lng).toBe(-122.4194);
        });
    });

    describe('Error Handling', () => {
        it('handles network errors', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, [])
            ).rejects.toThrow('Network error');
        });

        it('handles invalid JSON responses', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            await expect(
                fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, [])
            ).rejects.toThrow();
        });

        it('handles 401 unauthorized', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
            });

            await expect(
                fetchMissions('invalid-token', { lat: 37.7749, lng: -122.4194 }, [])
            ).rejects.toThrow();
        });

        it('handles 429 rate limit', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
            });

            await expect(
                fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, [])
            ).rejects.toThrow();
        });
    });

    describe('Request Headers', () => {
        it('includes authorization header', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ missions: [] }),
            });

            await fetchMissions('my-token', { lat: 37.7749, lng: -122.4194 }, []);

            const callArgs = (global.fetch as any).mock.calls[0];
            expect(callArgs[1].headers.Authorization).toBe('Bearer my-token');
        });

        it('includes content-type header', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ missions: [] }),
            });

            await fetchMissions('test-token', { lat: 37.7749, lng: -122.4194 }, []);

            const callArgs = (global.fetch as any).mock.calls[0];
            expect(callArgs[1].headers['Content-Type']).toBe('application/json');
        });
    });
});
