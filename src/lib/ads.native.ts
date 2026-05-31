import Constants from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

export function initAds() {
  if (isExpoGo) return;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mobileAds = require('react-native-google-mobile-ads').default;
  mobileAds().initialize();
}
