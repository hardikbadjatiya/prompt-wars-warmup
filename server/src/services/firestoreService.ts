/**
 * Firestore Database Service
 * 
 * Handles all database operations for:
 * - User profiles and stats
 * - Zone ownership and history
 * - Leaderboard rankings
 * - Activity tracking (last 7 days)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
    initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

const db = getFirestore();

/**
 * Updates or creates a user profile in Firestore
 */
export async function updateUserProfile(userId: string, data: {
    displayName: string;
    photoURL?: string | null;
    lastActive: number;
}) {
    const userRef = db.collection('users').doc(userId);

    await userRef.set({
        displayName: data.displayName,
        photoURL: data.photoURL || null,
        lastActive: Timestamp.fromMillis(data.lastActive),
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
}

/**
 * Records a zone capture event
 */
export async function captureZone(zoneId: string, userId: string, data: {
    displayName: string;
    position: { lat: number; lng: number };
    coverRating: string;
}) {
    const zoneRef = db.collection('zones').doc(zoneId);
    const captureTime = Timestamp.now();

    // Update zone ownership
    await zoneRef.set({
        id: zoneId,
        owner: userId,
        ownerName: data.displayName,
        position: data.position,
        coverRating: data.coverRating,
        hp: 100,
        capturedAt: captureTime,
        lastReinforced: captureTime,
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Record capture history
    await db.collection('captures').add({
        zoneId,
        userId,
        displayName: data.displayName,
        position: data.position,
        timestamp: captureTime,
    });

    // Update user stats
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
        displayName: data.displayName,
        lastActive: captureTime,
        stats: {
            totalCaptures: FieldValue.increment(1),
            lastCaptureAt: captureTime,
        },
    }, { merge: true });
}

/**
 * Gets all zones with their current owners
 */
export async function getAllZones() {
    const snapshot = await db.collection('zones').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        capturedAt: doc.data().capturedAt?.toMillis() || 0,
        lastReinforced: doc.data().lastReinforced?.toMillis() || 0,
    }));
}

/**
 * Gets zones captured by a specific user in the last 7 days
 */
export async function getUserZonesLast7Days(userId: string) {
    const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('captures')
        .where('userId', '==', userId)
        .where('timestamp', '>=', sevenDaysAgo)
        .orderBy('timestamp', 'desc')
        .get();

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || 0,
    }));
}

/**
 * Gets leaderboard data for all users
 */
export async function getLeaderboard(limit: number = 10) {
    const snapshot = await db.collection('users')
        .orderBy('stats.totalCaptures', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map((doc, index) => ({
        uid: doc.id,
        displayName: doc.data().displayName,
        photoURL: doc.data().photoURL,
        totalCaptures: doc.data().stats?.totalCaptures || 0,
        lastActive: doc.data().lastActive?.toMillis() || 0,
        rank: index + 1,
    }));
}

/**
 * Gets activity statistics for the last 7 days
 */
export async function getActivityStats() {
    const sevenDaysAgo = Timestamp.fromMillis(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snapshot = await db.collection('captures')
        .where('timestamp', '>=', sevenDaysAgo)
        .get();

    // Group by user
    const userActivity: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
        const userId = doc.data().userId;
        userActivity[userId] = (userActivity[userId] || 0) + 1;
    });

    return {
        totalCaptures: snapshot.size,
        uniqueUsers: Object.keys(userActivity).length,
        userActivity,
    };
}

/**
 * Reinforces a zone (restores HP)
 */
export async function reinforceZone(zoneId: string, userId: string) {
    const zoneRef = db.collection('zones').doc(zoneId);
    const zoneDoc = await zoneRef.get();

    if (!zoneDoc.exists) {
        throw new Error('Zone not found');
    }

    const zoneData = zoneDoc.data();
    if (zoneData?.owner !== userId) {
        throw new Error('You can only reinforce your own zones');
    }

    await zoneRef.update({
        hp: 100,
        lastReinforced: Timestamp.now(),
        updatedAt: FieldValue.serverTimestamp(),
    });
}

/**
 * Decays zone HP over time (called periodically)
 */
export async function decayZones() {
    const snapshot = await db.collection('zones').get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        const lastReinforced = data.lastReinforced?.toMillis() || 0;
        const hoursSinceReinforce = (Date.now() - lastReinforced) / (1000 * 60 * 60);

        // Decay 1 HP per hour
        const newHP = Math.max(0, 100 - Math.floor(hoursSinceReinforce));

        if (newHP === 0) {
            // Zone lost, remove ownership
            batch.delete(doc.ref);
        } else if (newHP !== data.hp) {
            batch.update(doc.ref, { hp: newHP });
        }
    });

    await batch.commit();
}
