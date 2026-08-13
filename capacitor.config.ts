import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.panalera.app',
  appName: 'Pañalera',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
