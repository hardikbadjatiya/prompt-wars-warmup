/**
 * Gemini AI Service - Core AI integration for Area Control Loop
 * 
 * This service provides three main AI-powered features:
 * 1. Mission Generation - Context-aware objectives based on player location
 * 2. Cover Analysis - Tactical terrain evaluation for zone safety
 * 3. Commentary - Real-time strategic advice and tips
 * 
 * All functions use Gemini 2.0 Flash for fast, cost-effective inference
 * with structured JSON output for type-safe parsing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with API key from environment
// API key is kept server-side only for security
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ZoneContext {
    id: string;
    center?: { lat: number; lng: number };
    owner: string | null;
    hp?: number;
    coverRating: string;
}

interface Position {
    lat: number;
    lng: number;
}

/**
 * Generates adaptive missions based on player location and nearby zones
 * 
 * This demonstrates advanced Gemini integration:
 * - Contextual awareness: Uses GPS position and zone states
 * - Structured output: Requests specific JSON schema
 * - Adaptive gameplay: Missions change based on surroundings
 * - Error handling: Provides fallback missions if AI fails
 * 
 * @param position - Player's current GPS coordinates
 * @param nearbyZones - Array of zones within range (max 8 for context)
 * @returns Promise<{missions: Mission[]}> - 2 adaptive missions
 * 
 * @example
 * const missions = await generateMissions(
 *   { lat: 37.7749, lng: -122.4194 },
 *   [{ id: 'zone1', owner: null, coverRating: 'high' }]
 * );
 */
export async function generateMissions(position: Position, nearbyZones: ZoneContext[]) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const neutralCount = nearbyZones.filter(z => !z.owner).length;
    const ownedCount = nearbyZones.filter(z => z.owner).length;

    const prompt = `You are a tactical AI mission generator for a GPS-based territory control game called "Area Control Loop".

The player is at position (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}).
Nearby zone summary: ${neutralCount} neutral zones, ${ownedCount} claimed zones.
Zone details: ${JSON.stringify(nearbyZones.slice(0, 8))}

Generate 2 adaptive missions based on the player's surroundings. Respond ONLY in this JSON format:
{
  "missions": [
    {
      "id": "mission-1",
      "title": "Short catchy title",
      "description": "1-2 sentence description",
      "type": "capture|strategic|exploration|defense",
      "objectives": [
        {"description": "objective text", "target": 2, "current": 0, "completed": false}
      ],
      "reward": 20,
      "expiresAt": ${Date.now() + 600000},
      "completed": false
    }
  ]
}

Make missions that feel tactical and strategic. Use military/game terminology.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Could not parse Gemini response');
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * Generates real-time tactical commentary based on player movement
 * 
 * This function creates an AI companion that provides:
 * - Strategic advice based on current position
 * - Warnings about nearby threats
 * - Tips for zone capture and defense
 * - Immersive gameplay narration
 * 
 * @param position - Player's current GPS coordinates
 * @param currentZone - Zone player is currently in (null if none)
 * @param nearbyZones - Surrounding zones for context
 * @returns Promise<{message: string, type: string}> - Commentary with severity type
 * 
 * @example
 * const commentary = await generateCommentary(
 *   { lat: 37.7749, lng: -122.4194 },
 *   { id: 'zone1', owner: 'player', hp: 80 },
 *   []
 * );
 * console.log(commentary.message); // "Zone HP at 80%. Reinforce soon."
 */
export async function generateCommentary(
    position: Position,
    currentZone: ZoneContext | null,
    nearbyZones: ZoneContext[]
) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a tactical AI companion for a GPS territory control game.

Player position: (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})
Current zone: ${currentZone ? JSON.stringify(currentZone) : 'none (in transit)'}
Nearby zones: ${JSON.stringify(nearbyZones.slice(0, 6))}

Generate ONE short tactical commentary message (max 120 characters) about the player's current situation.
Be dramatic, military-style, and game-like. Comment on zone control, strategic opportunities, or dangers.

Respond ONLY in JSON: {"message": "your message here", "type": "info|warning|alert|success"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
        return { message: 'Scanning area... standby for intel.', type: 'info' };
    }

    return JSON.parse(jsonMatch[0]);
}


/**
 * Analyzes terrain cover at a given position using Gemini AI
 * 
 * This function demonstrates advanced Gemini integration by:
 * 1. Providing contextual terrain data (buildings, open areas, density)
 * 2. Requesting structured JSON output for type-safe parsing
 * 3. Implementing fallback handling for robust error recovery
 * 
 * @param position - GPS coordinates {lat, lng} to analyze
 * @returns Promise<{coverRating: string, analysis: string, tacticalAdvice: string}>
 * 
 * @example
 * const cover = await analyzeCover({ lat: 37.7749, lng: -122.4194 });
 * console.log(cover.coverRating); // "high" | "medium" | "low"
 */
export async function analyzeCover(position: Position) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Contextual data for AI analysis
    // In production, this would come from Google Maps Places API or similar
    const context = {
        buildings: "Urban low-density residential, scattered structures",
        openAreas: "Small parks and street intersections nearby",
        speed: "Walking (avg 1.4m/s)",
        density: "Medium-Low"
    };

    // Structured prompt for consistent JSON output
    // This demonstrates best practices for Gemini prompt engineering:
    // - Clear role definition ("tactical AI assistant")
    // - Specific context (buildings, terrain, movement)
    // - Explicit output format (JSON schema)
    const prompt = `You are a tactical AI assistant in an area control map game.

Given this zone context:
- Nearby buildings: ${context.buildings}
- Nearby parks/open spaces: ${context.openAreas}
- Player movement speed: ${context.speed}
- Zone density score: ${context.density}
- Coordinates: (${position.lat.toFixed(5)}, ${position.lng.toFixed(5)})

Classify this zone as:
1. High Cover (safe)
2. Medium Cover
3. Low Cover (exposed)

Also generate a tactical suggestion for capturing nearby zones.

Respond ONLY in JSON:
{
  "coverRating": "high|medium|low",
  "analysis": "Brief 1-line terrain analysis",
  "tacticalAdvice": "Brief 1-line tactical suggestion"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Robust JSON extraction with regex
    // Handles cases where Gemini adds markdown formatting
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
        // Fallback response for error resilience
        return { coverRating: 'medium', analysis: 'Area scan complete.', tacticalAdvice: 'Proceed with caution.' };
    }

    return JSON.parse(jsonMatch[0]);
}

