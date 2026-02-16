import { Router, type Request, type Response } from 'express';
import { generateMissions, generateCommentary, analyzeCover } from '../services/geminiService.js';

const router = Router();

router.post('/mission', async (req: Request, res: Response) => {
    try {
        const { position, nearbyZones } = req.body;

        if (!position?.lat || !position?.lng) {
            res.status(400).json({ error: 'Position with lat/lng is required' });
            return;
        }

        const result = await generateMissions(position, nearbyZones || []);
        res.json(result);
    } catch (error) {
        console.error('Mission generation error:', error);
        res.status(500).json({
            error: 'Failed to generate missions',
            missions: [
                {
                    id: 'fallback-1',
                    title: 'Zone Patrol',
                    description: 'Capture nearby neutral zones to establish control.',
                    type: 'capture',
                    objectives: [{ description: 'Capture 2 zones', target: 2, current: 0, completed: false }],
                    reward: 15,
                    expiresAt: Date.now() + 300000,
                    completed: false,
                },
            ],
        });
    }
});

router.post('/commentary', async (req: Request, res: Response) => {
    try {
        const { position, currentZone, nearbyZones } = req.body;

        if (!position?.lat || !position?.lng) {
            res.status(400).json({ error: 'Position is required' });
            return;
        }

        const result = await generateCommentary(position, currentZone, nearbyZones || []);
        res.json(result);
    } catch (error) {
        console.error('Commentary error:', error);
        res.json({ message: 'Tactical scan in progress...', type: 'info' });
    }
});

router.post('/cover-analysis', async (req: Request, res: Response) => {
    try {
        const { position } = req.body;

        if (!position?.lat || !position?.lng) {
            res.status(400).json({ error: 'Position is required' });
            return;
        }

        const result = await analyzeCover(position);
        res.json(result);
    } catch (error) {
        console.error('Cover analysis error:', error);
        res.json({ coverRating: 'unknown', analysis: 'Scan failed', tacticalAdvice: 'Proceed with caution' });
    }
});

export default router;
