import Constants from 'expo-constants';

const ADS_ENABLED = false; // must match AdBanner.native.tsx
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export function initAds() {
  if (!ADS_ENABLED || isExpoGo) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mobileAds = require('react-native-google-mobile-ads').default;
  mobileAds().initialize();
}
