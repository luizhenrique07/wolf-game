import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Role } from '@/game/types';
import { ROLE_EMOJI } from '@/game/constants';

interface Props {
  name: string;
  isAlive: boolean;
  size?: number;
  showRole?: boolean;
  role?: Role;
}

export function PlayerAvatar({ name, isAlive, size = 48, showRole = false, role }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.wrapper, !isAlive && styles.dead]}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
      </View>
      <Text style={[styles.name, !isAlive && styles.deadText]} numberOfLines={1}>
        {showRole && role ? `${ROLE_EMOJI[role]} ` : ''}
        {name}
        {!isAlive ? ' †' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  dead: {
    opacity: 0.4,
  },
  circle: {
    backgroundColor: '#3D2B6B',
    borderWidth: 2,
    borderColor: '#7C5CBF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#E8D5FF',
    fontWeight: '700',
  },
  name: {
    color: '#E8D5FF',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 72,
    textAlign: 'center',
  },
  deadText: {
    textDecorationLine: 'line-through',
  },
});
