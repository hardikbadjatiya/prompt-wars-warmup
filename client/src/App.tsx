import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGeolocation } from './hooks/useGeolocation';
import { useZones } from './hooks/useZones';
import { LoginScreen } from './components/LoginScreen';
import { GameMap } from './components/GameMap';
import { PlayerHUD } from './components/PlayerHUD';
import { MissionPanel } from './components/MissionPanel';
import { TacticalFeed } from './components/TacticalFeed';
import { Leaderboard } from './components/Leaderboard';
import { ZoneInfo } from './components/ZoneInfo';
import { fetchMissions, fetchCommentary } from './services/api';
import type { Zone, Mission, TacticalMessage, LeaderboardEntry } from './types';

function App() {
  const { user, token, loading: authLoading, error: authError, login, logout } = useAuth();
  const { position, accuracy, isTracking, startTracking } = useGeolocation();
  const { zonesArray, currentZone, captureTimer, score, zonesCapturedCount, getNearbyZones } = useZones(
    position,
    user?.uid ?? null
  );

  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [tacticalMessages, setTacticalMessages] = useState<TacticalMessage[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [missionPanelOpen, setMissionPanelOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const lastMissionFetch = useRef(0);
  const lastCommentaryFetch = useRef(0);

  // Start GPS tracking when logged in
  useEffect(() => {
    if (user && !isTracking) {
      startTracking();
    }
  }, [user, isTracking, startTracking]);

  // Fetch missions periodically
  useEffect(() => {
    if (!token || !position || missionsLoading) return;
    const now = Date.now();
    if (now - lastMissionFetch.current < 30000) return; // Every 30 seconds

    lastMissionFetch.current = now;
    setMissionsLoading(true);

    const nearby = getNearbyZones(position, 10);
    fetchMissions(token, position, nearby)
      .then((res) => {
        setMissions(res.missions || []);
      })
      .catch((err) => {
        console.error('Mission fetch error:', err);
        // Provide fallback missions
        setMissions([
          {
            id: 'fallback-1',
            title: 'Territory Expansion',
            description: 'Capture 2 nearby neutral zones to expand your territory.',
            type: 'capture',
            objectives: [
              { description: 'Capture neutral zones', target: 2, current: Math.min(zonesCapturedCount, 2), completed: zonesCapturedCount >= 2 },
            ],
            reward: 20,
            expiresAt: Date.now() + 300000,
            completed: zonesCapturedCount >= 2,
          },
          {
            id: 'fallback-2',
            title: 'Area Recon',
            description: 'Explore the surrounding area — walk to discover new zones.',
            type: 'exploration',
            objectives: [
              { description: 'Discover new zones', target: 5, current: Math.min(zonesArray.length, 5), completed: zonesArray.length >= 5 },
            ],
            reward: 15,
            expiresAt: Date.now() + 600000,
            completed: zonesArray.length >= 5,
          },
        ]);
      })
      .finally(() => setMissionsLoading(false));
  }, [token, position, getNearbyZones, zonesCapturedCount, zonesArray.length]);

  // Fetch tactical commentary periodically
  useEffect(() => {
    if (!token || !position) return;
    const now = Date.now();
    if (now - lastCommentaryFetch.current < 20000) return; // Every 20 seconds

    lastCommentaryFetch.current = now;
    const nearby = getNearbyZones(position, 8);

    fetchCommentary(token, position, currentZone, nearby)
      .then((res) => {
        if (res.message) {
          setTacticalMessages(prev => [
            ...prev.slice(-19),
            {
              id: `tac-${Date.now()}`,
              text: res.message,
              type: res.type || 'info',
              timestamp: Date.now(),
            },
          ]);
        }
      })
      .catch(() => {
        // Provide fallback commentary
        const fallbackMessages = [
          'Area scanned. Zone grid generated around your position.',
          'Move into neutral zones to begin capture sequence.',
          'Remember: captured zones decay over time. Reinforce by standing nearby.',
          'Strategic tip: Focus on high-cover zones for better defense.',
          `You're controlling ${zonesCapturedCount} zones. Keep pushing!`,
        ];
        const msg = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        setTacticalMessages(prev => [
          ...prev.slice(-19),
          {
            id: `tac-${Date.now()}`,
            text: msg,
            type: 'info',
            timestamp: Date.now(),
          },
        ]);
      });
  }, [token, position, currentZone, getNearbyZones, zonesCapturedCount]);

  // Build leaderboard with dummy entries for demo
  useEffect(() => {
    if (!user) return;

    // Create dummy leaderboard entries
    const dummyEntries: LeaderboardEntry[] = [
      {
        uid: 'demo-player-1',
        displayName: 'TerritoryKing',
        photoURL: null,
        score: 1250,
        zonesCaptured: 125,
        rank: 1,
      },
      {
        uid: 'demo-player-2',
        displayName: 'ZoneHunter',
        photoURL: null,
        score: 980,
        zonesCaptured: 98,
        rank: 2,
      },
      {
        uid: 'demo-player-3',
        displayName: 'MapMaster',
        photoURL: null,
        score: 875,
        zonesCaptured: 87,
        rank: 3,
      },
      {
        uid: 'demo-player-4',
        displayName: 'AreaCommander',
        photoURL: null,
        score: 720,
        zonesCaptured: 72,
        rank: 4,
      },
      {
        uid: 'demo-player-5',
        displayName: 'GridWarrior',
        photoURL: null,
        score: 650,
        zonesCaptured: 65,
        rank: 5,
      },
      {
        uid: 'demo-player-6',
        displayName: 'TacticalPro',
        photoURL: null,
        score: 580,
        zonesCaptured: 58,
        rank: 6,
      },
      {
        uid: 'demo-player-7',
        displayName: 'StrategistX',
        photoURL: null,
        score: 490,
        zonesCaptured: 49,
        rank: 7,
      },
      {
        uid: 'demo-player-8',
        displayName: 'CaptureExpert',
        photoURL: null,
        score: 420,
        zonesCaptured: 42,
        rank: 8,
      },
      {
        uid: 'demo-player-9',
        displayName: 'ZoneDefender',
        photoURL: null,
        score: 350,
        zonesCaptured: 35,
        rank: 9,
      },
    ];

    // Add current user to leaderboard
    const currentUserEntry: LeaderboardEntry = {
      uid: user.uid,
      displayName: user.displayName || 'Player',
      photoURL: user.photoURL,
      score,
      zonesCaptured: zonesCapturedCount,
      rank: 10, // Will be recalculated
    };

    // Combine and sort by score
    const allEntries = [...dummyEntries, currentUserEntry].sort((a, b) => b.score - a.score);

    // Recalculate ranks
    const rankedEntries = allEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    setLeaderboard(rankedEntries);
  }, [user, score, zonesCapturedCount]);

  const handleZoneClick = useCallback((zone: Zone) => {
    setSelectedZone(zone);
  }, []);

  // Show login screen if not authenticated
  if (authLoading) {
    return (
      <div className="loading-screen" role="status" aria-label="Loading">
        <div className="loading-spinner" />
        <p>Initializing…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} loading={authLoading} error={authError} />;
  }

  return (
    <div className="app" role="application" aria-label="Area Control Loop">
      {/* Player HUD */}
      <PlayerHUD
        displayName={user.displayName || 'Player'}
        photoURL={user.photoURL}
        score={score}
        zonesCaptured={zonesCapturedCount}
        currentZone={currentZone}
        isTracking={isTracking}
        accuracy={accuracy}
        onLogout={logout}
      />

      {/* Main Map */}
      <GameMap
        playerPos={position}
        zones={zonesArray}
        playerId={user.uid}
        onZoneClick={handleZoneClick}
        captureProgress={captureTimer}
        currentZone={currentZone}
      />

      {/* Tactical Feed */}
      <TacticalFeed messages={tacticalMessages} />

      {/* Side Panels */}
      <MissionPanel
        missions={missions}
        isOpen={missionPanelOpen}
        onToggle={() => setMissionPanelOpen(!missionPanelOpen)}
        loading={missionsLoading}
      />

      <Leaderboard
        entries={leaderboard}
        currentPlayerId={user.uid}
        isOpen={leaderboardOpen}
        onToggle={() => setLeaderboardOpen(!leaderboardOpen)}
      />

      {/* Zone Info Popup */}
      <ZoneInfo
        zone={selectedZone}
        playerId={user.uid}
        onClose={() => setSelectedZone(null)}
      />
    </div>
  );
}

export default App;
