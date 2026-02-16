import { Router, type Request, type Response } from 'express';

const router = Router();

// In-memory zone store (in production, use Firestore)
const zoneStore = new Map<string, {
    id: string;
    owner: string | null;
    ownerName: string | null;
    hp: number;
    capturedAt: number | null;
    coverRating: string;
}>();

router.get('/:areaId', (req: Request, res: Response) => {
    const areaId = req.params.areaId as string;
    const zones = Array.from(zoneStore.values()).filter(z => z.id.startsWith(areaId));
    res.json({ zones });
});

router.post('/capture', (req: Request, res: Response) => {
    try {
        const { zoneId, playerId, playerName } = req.body;

        if (!zoneId || !playerId) {
            res.status(400).json({ error: 'zoneId and playerId are required' });
            return;
        }

        const zone = zoneStore.get(zoneId) || {
            id: zoneId,
            owner: null,
            ownerName: null,
            hp: 0,
            capturedAt: null,
            coverRating: 'unknown',
        };

        zone.owner = playerId;
        zone.ownerName = playerName || 'Unknown';
        zone.hp = 100;
        zone.capturedAt = Date.now();

        zoneStore.set(zoneId, zone);

        res.json({ success: true, zone });
    } catch (error) {
        console.error('Zone capture error:', error);
        res.status(500).json({ error: 'Failed to capture zone' });
    }
});

export default router;
