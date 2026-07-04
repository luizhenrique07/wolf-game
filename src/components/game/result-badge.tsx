import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, withSpring } from 'react-native-reanimated';

interface Props {
  survived: boolean;
  delay?: number;
}

export function ResultBadge({ survived, delay = 0 }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 180 }));
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.badge, survived ? styles.survived : styles.dead, style]}>
      <Text style={styles.text}>{survived ? 'SURVIVED' : 'ELIMINATED'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  survived: {
    backgroundColor: '#1A3A1A',
    borderWidth: 1,
    borderColor: '#3A7A3A',
  },
  dead: {
    backgroundColor: '#3A0A0A',
    borderWidth: 1,
    borderColor: '#8B2020',
  },
  text: {
    color: '#E8D5FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
