import { TrackedGame } from '../utils/playtimeUtils';

export interface InstalledDeviceApp {
  packageName: string;
  appName: string;
  icon: string;
  category: string;
  sizeMb: number;
}

export const INITIAL_TRACKED_GAMES: TrackedGame[] = [
  {
    id: 'game-1',
    packageName: 'com.cdprojektred.cyberpunk2077',
    title: 'Cyberpunk 2077',
    iconUri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 142 * 3600 + 45 * 60, // 142h 45m
    lastPlayedTimestamp: Date.now() - 42 * 60 * 1000, // 42m ago
    recentPlaytimeSeconds: 12 * 3600,
    isTracking: true,
    category: 'RPG',
  },
  {
    id: 'game-2',
    packageName: 'com.fromsoftware.eldenring',
    title: 'Elden Ring',
    iconUri: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 88 * 3600 + 15 * 60, // 88h 15m
    lastPlayedTimestamp: Date.now() - 3 * 3600 * 1000, // 3h ago
    recentPlaytimeSeconds: 6 * 3600,
    isTracking: true,
    category: 'Action',
  },
  {
    id: 'game-3',
    packageName: 'com.teamcherry.hollowknight',
    title: 'Hollow Knight',
    iconUri: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 34 * 3600 + 20 * 60, // 34h 20m
    lastPlayedTimestamp: Date.now() - 24 * 3600 * 1000, // Yesterday
    recentPlaytimeSeconds: 4 * 3600,
    isTracking: true,
    category: 'Indie',
  },
  {
    id: 'game-4',
    packageName: 'com.miHoYo.GenshinImpact',
    title: 'Genshin Impact',
    iconUri: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 19 * 3600 + 10 * 60, // 19h 10m
    lastPlayedTimestamp: Date.now() - 4 * 24 * 3600 * 1000,
    recentPlaytimeSeconds: 2 * 3600,
    isTracking: true,
    category: 'RPG',
  },
  {
    id: 'game-5',
    packageName: 'com.mojang.minecraftpe',
    title: 'Minecraft Pocket Edition',
    iconUri: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 5 * 3600 + 40 * 60,
    lastPlayedTimestamp: Date.now() - 8 * 24 * 3600 * 1000,
    recentPlaytimeSeconds: 0,
    isTracking: true,
    category: 'Simulation',
  },
  {
    id: 'game-6',
    packageName: 'com.playdigious.deadcells',
    title: 'Dead Cells',
    iconUri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    headerImageUri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    totalPlaytimeSeconds: 1 * 3600 + 15 * 60, // 1h 15m
    lastPlayedTimestamp: Date.now() - 15 * 24 * 3600 * 1000,
    recentPlaytimeSeconds: 0,
    isTracking: true,
    category: 'Action',
  },
];

export const MOCK_INSTALLED_APPS: InstalledDeviceApp[] = [
  {
    packageName: 'com.tencent.ig',
    appName: 'PUBG Mobile',
    icon: 'https://images.unsplash.com/photo-1552824722-ddab1374e622?w=200&auto=format&fit=crop&q=80',
    category: 'Shooter',
    sizeMb: 1240,
  },
  {
    packageName: 'com.activision.callofduty.shooter',
    appName: 'Call of Duty: Warzone Mobile',
    icon: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=200&auto=format&fit=crop&q=80',
    category: 'Shooter',
    sizeMb: 2450,
  },
  {
    packageName: 'com.chucklefish.stardewvalley',
    appName: 'Stardew Valley',
    icon: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=200&auto=format&fit=crop&q=80',
    category: 'Simulation',
    sizeMb: 380,
  },
  {
    packageName: 'com.HoYoverse.hkrpgoversea',
    appName: 'Honkai: Star Rail',
    icon: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    category: 'RPG',
    sizeMb: 3100,
  },
  {
    packageName: 'com.roblox.client',
    appName: 'Roblox',
    icon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    category: 'Indie',
    sizeMb: 190,
  },
  {
    packageName: 'com.and.games505.TerrariaPaid',
    appName: 'Terraria',
    icon: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&auto=format&fit=crop&q=80',
    category: 'Action',
    sizeMb: 180,
  },
  {
    packageName: 'com.playstack.balatro',
    appName: 'Balatro Mobile',
    icon: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    category: 'Strategy',
    sizeMb: 95,
  },
  {
    packageName: 'com.poncle.vampiresurvivors',
    appName: 'Vampire Survivors',
    icon: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    category: 'Action',
    sizeMb: 140,
  },
];
