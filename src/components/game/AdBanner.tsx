import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-8708909067515736/6184825460';

export function AdBanner() {
  return (
    <View style={styles.wrapper}>
      <BannerAd unitId={UNIT_ID} size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: '100%', backgroundColor: '#080510' },
});
