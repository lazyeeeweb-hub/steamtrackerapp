/**
 * Pure logic utility functions for SteamWise playtime calculations and formatting.
 * Mirrors the exact business logic implemented in the Android Kotlin MainViewModel and Repository.
 */

export interface TrackedGame {
  id: string;
  packageName: string;
  title: string;
  iconUri: string;
  headerImageUri?: string;
  totalPlaytimeSeconds: number;
  lastPlayedTimestamp: number; // epoch ms
  recentPlaytimeSeconds: number; // last 2 weeks
  isTracking: boolean;
  category?: 'RPG' | 'Action' | 'Strategy' | 'Indie' | 'Simulation' | 'Shooter';
}

export type SortOption = 'playtime_desc' | 'playtime_asc' | 'recent' | 'name_asc';

/**
 * Formats seconds into human-readable compact or detailed strings.
 * e.g. "14h 20m", "42m", "0m", or Steam-style decimal "14.2 hrs".
 */
export function formatPlaytime(seconds: number, style: 'compact' | 'steam_hours' | 'detailed' = 'compact'): string {
  if (!seconds || seconds <= 0) {
    return style === 'steam_hours' ? '0.0 hrs' : '0m';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSecs = Math.floor(seconds % 60);

  if (style === 'steam_hours') {
    const decimalHours = (seconds / 3600).toFixed(1);
    return `${decimalHours} hrs`;
  }

  if (style === 'detailed') {
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSecs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSecs}s`;
    }
    return `${remainingSecs}s`;
  }

  // compact
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Returns Steam status tier badge based on accumulated hours.
 */
export function getPlaytimeBadge(totalSeconds: number): {
  tier: string;
  color: string;
  bgColor: string;
  borderColor: string;
  minHours: number;
} {
  const hours = totalSeconds / 3600;

  if (hours >= 100) {
    return {
      tier: 'Centurion Master',
      color: '#ffd700',
      bgColor: 'rgba(255, 215, 0, 0.12)',
      borderColor: '#ffd700',
      minHours: 100,
    };
  }
  if (hours >= 50) {
    return {
      tier: 'Hardcore Veteran',
      color: '#c084fc',
      bgColor: 'rgba(192, 132, 252, 0.12)',
      borderColor: '#a855f7',
      minHours: 50,
    };
  }
  if (hours >= 10) {
    return {
      tier: 'Dedicated',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.12)',
      borderColor: '#0284c7',
      minHours: 10,
    };
  }
  if (hours >= 2) {
    return {
      tier: 'Explorer',
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.12)',
      borderColor: '#16a34a',
      minHours: 2,
    };
  }
  return {
    tier: 'Fresh Start (<2h)',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: '#475569',
    minHours: 0,
  };
}

/**
 * Formats "Last Played" timestamp into human-readable Steam string.
 */
export function formatLastPlayed(timestampMs: number, nowMs: number = Date.now()): string {
  if (!timestampMs || timestampMs <= 0) {
    return 'Never played';
  }

  const diffMs = Math.max(0, nowMs - timestampMs);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const date = new Date(timestampMs);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Sorts games list according to the chosen option.
 */
export function sortGames(games: TrackedGame[], option: SortOption): TrackedGame[] {
  const list = [...games];
  switch (option) {
    case 'playtime_desc':
      return list.sort((a, b) => b.totalPlaytimeSeconds - a.totalPlaytimeSeconds);
    case 'playtime_asc':
      return list.sort((a, b) => a.totalPlaytimeSeconds - b.totalPlaytimeSeconds);
    case 'recent':
      return list.sort((a, b) => b.lastPlayedTimestamp - a.lastPlayedTimestamp);
    case 'name_asc':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return list;
  }
}

/**
 * Simulated UsageStats Event structure from Android's android.app.usage.UsageEvents.Event
 */
export interface UsageEvent {
  packageName: string;
  eventType: number; // 1 = ACTIVITY_RESUMED (Move to foreground), 2 = ACTIVITY_PAUSED (Move to background)
  timeStamp: number; // epoch ms
}

/**
 * Pure calculation logic matching Android Kotlin UsageStatsHelper session parser.
 * Computes elapsed foreground session time for a given package name from usage events.
 */
export function calculateSessionSecondsFromEvents(
  events: UsageEvent[],
  targetPackage: string
): number {
  let totalSessionMs = 0;
  let lastResumeTime: number | null = null;

  for (const event of events) {
    if (event.packageName !== targetPackage) continue;

    if (event.eventType === 1) { // ACTIVITY_RESUMED
      lastResumeTime = event.timeStamp;
    } else if (event.eventType === 2 && lastResumeTime !== null) { // ACTIVITY_PAUSED
      if (event.timeStamp >= lastResumeTime) {
        totalSessionMs += (event.timeStamp - lastResumeTime);
      }
      lastResumeTime = null;
    }
  }

  return Math.floor(totalSessionMs / 1000);
}
