import { View } from 'react-native';
import Constants from 'expo-constants';

// 'storeClient' = Expo Go — native modules like AdMob are not available
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

if (!isExpoGo) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
}

interface Props {
  unitId: string;
}

export function AdBanner({ unitId }: Props) {
  if (!BannerAd || !BannerAdSize) return <View />;
  const resolvedId = __DEV__ && TestIds ? TestIds.BANNER : unitId;
  return <BannerAd unitId={resolvedId} size={BannerAdSize.BANNER} />;
}
