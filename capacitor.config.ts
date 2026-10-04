import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.viinisilva.paroquiasaoroque',
  appName: 'Paróquia São Roque',
  webDir: 'capacitor-web',
  server: {
    url: 'https://app-paroquia.vercel.app',
    cleartext: false,
    allowNavigation: ['app-paroquia.vercel.app'],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
