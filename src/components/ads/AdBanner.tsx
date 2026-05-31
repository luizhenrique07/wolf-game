import { View } from 'react-native';

let BannerAd: any;
let BannerAdSize: any;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
} catch {
  // Native module not available (Expo Go)
}

interface Props {
  unitId: string;
}

export function AdBanner({ unitId }: Props) {
  if (!BannerAd || !BannerAdSize) return <View />;
  return <BannerAd unitId={unitId} size={BannerAdSize.BANNER} />;
}
