import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { dealRoles, validateRoleCounts } from '@/game/engine';
import type { Role } from '@/game/types';
import { RoleIcon, WolfIcon } from '@/components/game/icons';

const MIN_PLAYERS = 4;

interface RoleCounterProps {
  label: string;
  role: Exclude<Role, 'villager'>;
  value: number;
  onChange: (v: number) => void;
}

function RoleCounter({ label, role, value, onChange }: RoleCounterProps) {
  return (
    <View style={styles.counter}>
      <RoleIcon role={role} size={22} color="#A080C0" />
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <Pressable
          style={({ pressed }) => [styles.counterBtn, pressed && styles.pressed]}
          onPress={() => onChange(Math.max(0, value - 1))}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </Pressable>
        <Text style={styles.counterValue}>{value}</Text>
        <Pressable
          style={({ pressed }) => [styles.counterBtn, pressed && styles.pressed]}
          onPress={() => onChange(value + 1)}
        >
          <Text style={styles.counterBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function LobbyScreen() {
  const { dispatch } = useGame();
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [roleCounts, setRoleCounts] = useState<Record<Role, number>>({
    wolf: 1,
    hunter: 1,
    oracle: 1,
    villager: 1,
  });

  const playerCount = playerNames.length;
  const villagerCount = Math.max(
    0,
    playerCount - roleCounts.wolf - roleCounts.hunter - roleCounts.oracle
  );
  const effectiveRoleCounts: Record<Role, number> = {
    ...roleCounts,
    villager: villagerCount,
  };

  const addPlayer = useCallback(() => {
    setPlayerNames((prev) => [...prev, '']);
  }, []);

  const removePlayer = useCallback((idx: number) => {
    setPlayerNames((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateName = useCallback((idx: number, name: string) => {
    setPlayerNames((prev) => prev.map((n, i) => (i === idx ? name : n)));
  }, []);

  const updateRole = useCallback((role: Exclude<Role, 'villager'>, value: number) => {
    setRoleCounts((prev) => ({ ...prev, [role]: value }));
  }, []);

  const handleStart = useCallback(() => {
    const names = playerNames.map((n) => n.trim()).filter(Boolean);
    if (names.length < MIN_PLAYERS) {
      Alert.alert('Not enough players', `You need at least ${MIN_PLAYERS} players with names.`);
      return;
    }
    if (names.length !== playerNames.length) {
      Alert.alert('Missing names', 'Please fill in all player names.');
      return;
    }

    const error = validateRoleCounts(names.length, effectiveRoleCounts);
    if (error) {
      Alert.alert('Invalid roles', error);
      return;
    }

    const players = dealRoles(names, effectiveRoleCounts);
    dispatch({ type: 'START_ROLE_REVEAL', players });
    router.replace('/game/role-reveal');
  }, [playerNames, effectiveRoleCounts, dispatch]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <WolfIcon size={48} color="#C090FF" />
            <Text style={styles.title}>Wolf</Text>
            <Text style={styles.subtitle}>A social deduction game</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Players</Text>
            {playerNames.map((name, idx) => (
              <View key={idx} style={styles.playerRow}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => updateName(idx, t)}
                  placeholder={`Player ${idx + 1}`}
                  placeholderTextColor="#4A2D8A"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                {playerNames.length > MIN_PLAYERS && (
                  <Pressable
                    style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                    onPress={() => removePlayer(idx)}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}

            <Pressable
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
              onPress={addPlayer}
            >
              <Text style={styles.addBtnText}>+ Add Player</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Roles</Text>
            <RoleCounter
              label="Wolves"
              role="wolf"
              value={roleCounts.wolf}
              onChange={(v) => updateRole('wolf', v)}
            />
            <RoleCounter
              label="Hunters"
              role="hunter"
              value={roleCounts.hunter}
              onChange={(v) => updateRole('hunter', v)}
            />
            <RoleCounter
              label="Oracles"
              role="oracle"
              value={roleCounts.oracle}
              onChange={(v) => updateRole('oracle', v)}
            />
            <View style={styles.villagerRow}>
              <RoleIcon role="villager" size={22} color="#6A508A" />
              <Text style={styles.villagerLabel}>Villagers</Text>
              <Text style={styles.villagerCount}>{villagerCount}</Text>
            </View>
            <Text style={styles.villagerHint}>
              Villagers = {playerCount} players − wolves − hunters − oracles
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            onPress={handleStart}
          >
            <Text style={styles.startBtnText}>Start Game</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  flex: { flex: 1 },
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },
  header: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  title: { fontSize: 48, fontWeight: '900', color: '#E8D5FF', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#5A3A8A', letterSpacing: 2, textTransform: 'uppercase' },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 12,
    color: '#5A3A8A',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  playerRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#150C28',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A1A4A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#E8D5FF',
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5A1A1A',
  },
  removeBtnText: { color: '#E04040', fontSize: 14, fontWeight: '600' },
  addBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A1A4A',
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: '#5A3A8A', fontSize: 15, fontWeight: '600' },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#150C28',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A1A4A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  counterLabel: { flex: 1, color: '#A080C0', fontSize: 16, fontWeight: '500' },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2A1A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { color: '#E8D5FF', fontSize: 20, fontWeight: '700', lineHeight: 28 },
  counterValue: {
    color: '#E8D5FF',
    fontSize: 20,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  villagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#100820',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A0D2E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  villagerLabel: { flex: 1, color: '#6A508A', fontSize: 16, fontWeight: '500' },
  villagerCount: { color: '#7A5AAA', fontSize: 20, fontWeight: '700' },
  villagerHint: { color: '#3A2A5A', fontSize: 12, textAlign: 'center' },
  startBtn: {
    backgroundColor: '#5A3A9A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A5ADA',
    marginTop: 8,
  },
  startBtnText: { color: '#E8D5FF', fontSize: 20, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
