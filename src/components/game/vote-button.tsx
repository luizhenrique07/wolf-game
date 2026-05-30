import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import type { PlayerId } from '@/game/types';

interface Props {
  playerId: PlayerId;
  name: string;
  voteCount: number;
  isSelected: boolean;
  onPress: (id: PlayerId) => void;
}

export function VoteButton({ playerId, name, voteCount, isSelected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSelected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(playerId)}
    >
      <View style={styles.row}>
        <Text style={[styles.name, isSelected && styles.nameSelected]}>{name}</Text>
        {voteCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{voteCount}</Text>
          </View>
        )}
      </View>
      {isSelected && <View style={styles.selectionRing} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#150C28',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2A1A4A',
    position: 'relative',
    overflow: 'hidden',
  },
  selected: {
    backgroundColor: '#2A1A4A',
    borderColor: '#C84B4B',
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    color: '#A080C0',
    fontWeight: '500',
  },
  nameSelected: {
    color: '#E8D5FF',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#8B2020',
    borderRadius: 12,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFD0D0',
    fontWeight: '700',
    fontSize: 14,
  },
  selectionRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C84B4B',
    opacity: 0.5,
  },
});
