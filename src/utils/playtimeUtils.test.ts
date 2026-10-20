import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPlaytime,
  getPlaytimeBadge,
  formatLastPlayed,
  sortGames,
  calculateSessionSecondsFromEvents,
} from './playtimeUtils.ts';
import type { TrackedGame, UsageEvent } from './playtimeUtils.ts';

test('formatPlaytime handles zero and negative numbers', () => {
  assert.equal(formatPlaytime(0), '0m');
  assert.equal(formatPlaytime(-50), '0m');
  assert.equal(formatPlaytime(0, 'steam_hours'), '0.0 hrs');
});

test('formatPlaytime formats minutes and hours correctly in compact style', () => {
  assert.equal(formatPlaytime(45 * 60), '45m');
  assert.equal(formatPlaytime(3600), '1h');
  assert.equal(formatPlaytime(3600 + 1200), '1h 20m');
  assert.equal(formatPlaytime(14 * 3600 + 20 * 60), '14h 20m');
});

test('formatPlaytime formats steam decimal hours and detailed styles', () => {
  assert.equal(formatPlaytime(14 * 3600 + 1800, 'steam_hours'), '14.5 hrs');
  assert.equal(formatPlaytime(7200, 'steam_hours'), '2.0 hrs');
  assert.equal(formatPlaytime(3665, 'detailed'), '1h 1m 5s');
});

test('getPlaytimeBadge assigns correct Steam tiers', () => {
  assert.equal(getPlaytimeBadge(3600).tier, 'Fresh Start (<2h)');
  assert.equal(getPlaytimeBadge(2 * 3600).tier, 'Explorer');
  assert.equal(getPlaytimeBadge(15 * 3600).tier, 'Dedicated');
  assert.equal(getPlaytimeBadge(60 * 3600).tier, 'Hardcore Veteran');
  assert.equal(getPlaytimeBadge(120 * 3600).tier, 'Centurion Master');
});

test('formatLastPlayed returns humanized relative time strings', () => {
  const now = 1000000000000;
  assert.equal(formatLastPlayed(0, now), 'Never played');
  assert.equal(formatLastPlayed(now - 30 * 1000, now), 'Just now');
  assert.equal(formatLastPlayed(now - 15 * 60 * 1000, now), '15 min ago');
  assert.equal(formatLastPlayed(now - 3 * 3600 * 1000, now), '3h ago');
  assert.equal(formatLastPlayed(now - 25 * 3600 * 1000, now), 'Yesterday');
});

test('sortGames sorts correctly by playtime and titles', () => {
  const games: TrackedGame[] = [
    {
      id: '1',
      packageName: 'com.game.a',
      title: 'Zelda',
      iconUri: '',
      totalPlaytimeSeconds: 100,
      lastPlayedTimestamp: 1000,
      recentPlaytimeSeconds: 50,
      isTracking: true,
    },
    {
      id: '2',
      packageName: 'com.game.b',
      title: 'Apex',
      iconUri: '',
      totalPlaytimeSeconds: 500,
      lastPlayedTimestamp: 2000,
      recentPlaytimeSeconds: 200,
      isTracking: true,
    },
  ];

  const sortedDesc = sortGames(games, 'playtime_desc');
  assert.equal(sortedDesc[0].title, 'Apex');

  const sortedAsc = sortGames(games, 'name_asc');
  assert.equal(sortedAsc[0].title, 'Apex');
});

test('calculateSessionSecondsFromEvents correctly aggregates resumed and paused intervals', () => {
  const pkg = 'com.mojang.minecraftpe';
  const events: UsageEvent[] = [
    { packageName: pkg, eventType: 1, timeStamp: 10000 },
    { packageName: pkg, eventType: 2, timeStamp: 25000 }, // 15 seconds
    { packageName: 'other.app', eventType: 1, timeStamp: 26000 },
    { packageName: pkg, eventType: 1, timeStamp: 30000 },
    { packageName: pkg, eventType: 2, timeStamp: 40000 }, // 10 seconds
  ];

  const totalSeconds = calculateSessionSecondsFromEvents(events, pkg);
  assert.equal(totalSeconds, 25);
});
