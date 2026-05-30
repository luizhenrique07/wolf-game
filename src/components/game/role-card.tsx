import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import type { Role } from '@/game/types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_EMOJI, TEAM_LABELS } from '@/game/constants';
import { ROLE_TEAM } from '@/game/types';

interface Props {
  role: Role;
  revealed: boolean;
  onReveal?: () => void;
}

export function RoleCard({ role, revealed, onReveal }: Props) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (revealed) {
      rotation.value = withTiming(180, { duration: 500 });
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [revealed, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    opacity: interpolate(rotation.value, [0, 89, 90, 180], [1, 1, 0, 0]),
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    opacity: interpolate(rotation.value, [0, 89, 90, 180], [0, 0, 1, 1]),
    backfaceVisibility: 'hidden',
  }));

  const team = ROLE_TEAM[role];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, styles.front, frontStyle]}>
        <Pressable onPress={onReveal} style={styles.cardInner}>
          <Text style={styles.questionMark}>?</Text>
          <Text style={styles.tapHint}>Tap to reveal your role</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.card, styles.back, backStyle]}>
        <View style={styles.cardInner}>
          <Text style={styles.emoji}>{ROLE_EMOJI[role]}</Text>
          <Text style={styles.roleName}>{ROLE_LABELS[role]}</Text>
          <View style={[styles.teamBadge, team === 'wolves' ? styles.wolfTeam : styles.villageTeam]}>
            <Text style={styles.teamText}>{TEAM_LABELS[team]}</Text>
          </View>
          <Text style={styles.description}>{ROLE_DESCRIPTIONS[role]}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 360,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    position: 'absolute',
    shadowColor: '#7C5CBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 16,
  },
  front: {
    backgroundColor: '#1A0D2E',
    borderWidth: 2,
    borderColor: '#4A2D8A',
  },
  back: {
    backgroundColor: '#120820',
    borderWidth: 2,
    borderColor: '#7C5CBF',
  },
  questionMark: {
    fontSize: 72,
    color: '#4A2D8A',
  },
  tapHint: {
    color: '#7C5CBF',
    fontSize: 14,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 56,
  },
  roleName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E8D5FF',
    letterSpacing: 1,
  },
  teamBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  wolfTeam: {
    backgroundColor: '#5C1010',
  },
  villageTeam: {
    backgroundColor: '#1A3A1A',
  },
  teamText: {
    color: '#E8D5FF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  description: {
    color: '#A080D0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
