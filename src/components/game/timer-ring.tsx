import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface Props {
  progress: number; // 1.0 = full, 0.0 = empty
  remainingMs: number;
  size?: number;
}

export function TimerRing({ progress, remainingMs, size = 240 }: Props) {
  const animatedWidth = useSharedValue(progress);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 100, easing: Easing.linear });
  }, [progress, animatedWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isWarning = remainingMs < 20_000;
  const isCritical = remainingMs < 10_000;

  return (
    <View style={[styles.container, { width: size }]}>
      <View style={styles.timeWrapper}>
        <Text style={[styles.time, isCritical && styles.timeCritical, isWarning && !isCritical && styles.timeWarning]}>
          {timeLabel}
        </Text>
        <Text style={styles.label}>remaining</Text>
      </View>

      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            isCritical && styles.fillCritical,
            isWarning && !isCritical && styles.fillWarning,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  timeWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 64,
    fontWeight: '800',
    color: '#A070E0',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  timeWarning: {
    color: '#E0A030',
  },
  timeCritical: {
    color: '#E04040',
  },
  label: {
    fontSize: 12,
    color: '#5A3A8A',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bar: {
    width: '100%',
    height: 8,
    backgroundColor: '#1A0D2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#7C5CBF',
    borderRadius: 4,
  },
  fillWarning: {
    backgroundColor: '#C08020',
  },
  fillCritical: {
    backgroundColor: '#C03030',
  },
});
