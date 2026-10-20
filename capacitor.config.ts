import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.steamwise.tracker',
  appName: 'SteamWise Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
