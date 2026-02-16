import express from 'express';
import {
    captureZone,
    getAllZones,
    getUserZonesLast7Days,
    getLeaderboard,
    reinforceZone,
    updateUserProfile,
} from '../services/firestoreService.js';
import { analyzeLeaderboard } from '../services/geminiService.js';

const router = express.Router();

/**
 * POST /api/zones/capture
 * Captures a zone for the authenticated user
 */
router.post('/capture', async (req, res) => {
    try {
        const { zoneId, position, coverRating, displayName } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Comprehensive input validation
        if (!zoneId || !position || !displayName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate zone ID format (alphanumeric + underscore only)
        if (!/^[a-zA-Z0-9_-]{1,100}$/.test(zoneId)) {
            return res.status(400).json({ error: 'Invalid zone ID format' });
        }

        // Validate displayName (max 50 chars, no special chars)
        if (typeof displayName !== 'string' || displayName.length > 50 || displayName.length < 1) {
            return res.status(400).json({ error: 'Invalid display name' });
        }

        // Sanitize displayName (remove HTML/script tags)
        const sanitizedName = displayName.replace(/<[^>]*>/g, '').trim();

        // Validate position coordinates
        if (typeof position.lat !== 'number' || typeof position.lng !== 'number') {
            return res.status(400).json({ error: 'Invalid position coordinates' });
        }

        // Validate GPS bounds (latitude: -90 to 90, longitude: -180 to 180)
        if (position.lat < -90 || position.lat > 90 || position.lng < -180 || position.lng > 180) {
            return res.status(400).json({ error: 'Position coordinates out of bounds' });
        }

        // Validate coverRating
        const validRatings = ['high', 'medium', 'low'];
        const rating = coverRating || 'medium';
        if (!validRatings.includes(rating)) {
            return res.status(400).json({ error: 'Invalid cover rating' });
        }

        // Capture the zone in Firestore
        await captureZone(zoneId, userId, {
            displayName: sanitizedName,
            position,
            coverRating: rating,
        });

        // Update user profile
        await updateUserProfile(userId, {
            displayName: sanitizedName,
            photoURL: null,
            lastActive: Date.now(),
        });

        // Update user profile
        await updateUserProfile(userId, {
            displayName,
            photoURL: null,
            lastActive: Date.now(),
        });

        res.json({
            success: true,
            zoneId,
            message: 'Zone captured successfully',
        });
    } catch (error) {
        console.error('Zone capture error:', error);
        res.status(500).json({ error: 'Failed to capture zone' });
    }
});

/**
 * POST /api/zones/reinforce
 * Reinforces a zone (restores HP to 100)
 */
router.post('/reinforce', async (req, res) => {
    try {
        const { zoneId } = req.body;
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!zoneId) {
            return res.status(400).json({ error: 'Missing zone ID' });
        }

        await reinforceZone(zoneId, userId);

        res.json({
            success: true,
            zoneId,
            message: 'Zone reinforced successfully',
        });
    } catch (error: any) {
        console.error('Zone reinforce error:', error);
        res.status(error.message === 'You can only reinforce your own zones' ? 403 : 500)
            .json({ error: error.message || 'Failed to reinforce zone' });
    }
});

/**
 * GET /api/zones/all
 * Gets all zones with their current owners
 */
router.get('/all', async (req, res) => {
    try {
        const zones = await getAllZones();
        res.json({ zones });
    } catch (error) {
        console.error('Get zones error:', error);
        res.status(500).json({ error: 'Failed to fetch zones' });
    }
});

/**
 * GET /api/zones/my-history
 * Gets user's zone captures from the last 7 days
 */
router.get('/my-history', async (req, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const history = await getUserZonesLast7Days(userId);
        res.json({ history });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

/**
 * GET /api/zones/leaderboard
 * Gets the top players leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const leaderboard = await getLeaderboard(limit);
        res.json({ leaderboard });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

/**
 * POST /api/zones/leaderboard-analysis
 * Uses Gemini AI to analyze leaderboard and provide strategic insights
 */
router.post('/leaderboard-analysis', async (req, res) => {
    try {
        const userId = req.user?.uid;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get leaderboard data
        const leaderboard = await getLeaderboard(20);

        // Find current user's stats
        const currentUserIndex = leaderboard.findIndex(p => p.uid === userId);
        const currentUser = currentUserIndex >= 0
            ? leaderboard[currentUserIndex]
            : { uid: userId, totalCaptures: 0, rank: leaderboard.length + 1 };

        // Use Gemini AI to analyze patterns
        const analysis = await analyzeLeaderboard(leaderboard, {
            uid: currentUser.uid,
            totalCaptures: currentUser.totalCaptures,
            rank: currentUser.rank,
        });

        res.json({
            analysis,
            leaderboard: leaderboard.slice(0, 10), // Top 10
            yourRank: currentUser.rank,
            yourCaptures: currentUser.totalCaptures,
        });
    } catch (error) {
        console.error('Leaderboard analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze leaderboard',
            fallback: {
                topStrategy: "Capture zones consistently",
                personalAdvice: "Focus on maintaining active zones",
                insights: ["Consistency is key", "Reinforce regularly", "Choose strategic locations"]
            }
        });
    }
});

export default router;
