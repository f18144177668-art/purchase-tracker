import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.purchase.tracker',
  appName: '采购记录管理',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
