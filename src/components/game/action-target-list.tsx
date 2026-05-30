import React from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import type { Player, PlayerId } from '@/game/types';

interface Props {
  players: Player[];
  selected: PlayerId | null;
  onSelect: (id: PlayerId) => void;
}

export function ActionTargetList({ players, selected, onSelect }: Props) {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isSelected = item.id === selected;
        return (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              isSelected && styles.rowSelected,
              pressed && styles.rowPressed,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <View style={[styles.dot, isSelected && styles.dotSelected]} />
            <Text style={[styles.name, isSelected && styles.nameSelected]}>{item.name}</Text>
            {isSelected && <Text style={styles.check}>✓</Text>}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#150C28',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#2A1A4A',
  },
  rowSelected: {
    backgroundColor: '#2A1A4A',
    borderColor: '#7C5CBF',
  },
  rowPressed: {
    opacity: 0.75,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3D2B6B',
    borderWidth: 1,
    borderColor: '#5A3A8A',
  },
  dotSelected: {
    backgroundColor: '#A070E0',
    borderColor: '#C090FF',
  },
  name: {
    flex: 1,
    fontSize: 18,
    color: '#A080C0',
    fontWeight: '500',
  },
  nameSelected: {
    color: '#E8D5FF',
    fontWeight: '700',
  },
  check: {
    color: '#A070E0',
    fontSize: 18,
    fontWeight: '700',
  },
});
