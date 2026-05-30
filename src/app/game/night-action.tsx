import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { NightGate } from '@/components/game/night-gate';
import { ActionTargetList } from '@/components/game/action-target-list';
import type { PlayerId } from '@/game/types';
import { ROLE_LABELS, NIGHT_ACTION_INSTRUCTIONS } from '@/game/constants';
import { RoleIcon } from '@/components/game/icons';

export default function NightActionScreen() {
  const { state, dispatch, alivePlayers, currentNightTurn, currentNightActor } = useGame();
  const [isReady, setIsReady] = useState(false);
  const [selected, setSelected] = useState<PlayerId | null>(null);
  const [oracleResult, setOracleResult] = useState<{ targetName: string; isWolf: boolean } | null>(null);

  useEffect(() => {
    setIsReady(false);
    setSelected(null);
    setOracleResult(null);
  }, [state.nightTurnIndex]);

  useEffect(() => {
    if (state.phase === 'night_summary') {
      router.replace('/game/night-summary');
    } else if (state.phase === 'game_over') {
      router.replace('/game/result');
    }
  }, [state.phase]);

  if (!currentNightTurn || !currentNightActor) return null;

  const isNoAction = currentNightTurn.actionType === 'no_action';
  const isOracle = currentNightTurn.actionType === 'oracle_check';
  const targets = alivePlayers.filter((p) => p.id !== currentNightActor.id);

  const submitAction = (targetId: PlayerId | null) => {
    dispatch({ type: 'SUBMIT_NIGHT_ACTION', targetId });
  };

  const handleConfirm = () => {
    if (!selected) return;
    if (isOracle) {
      const target = state.players.find((p) => p.id === selected);
      if (target) {
        setOracleResult({ targetName: target.name, isWolf: target.role === 'wolf' });
        return;
      }
    }
    submitAction(selected);
  };

  // Gate screen — no role shown, role is secret
  if (!isReady) {
    return (
      <NightGate
        playerName={currentNightActor.name}
        onReady={() => setIsReady(true)}
      />
    );
  }

  // Oracle private result screen
  if (oracleResult) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.oracleTitle}>Oracle's Vision</Text>
          <View style={styles.oracleCard}>
            <Text style={styles.oracleTargetName}>{oracleResult.targetName}</Text>
            <Text style={[styles.oracleVerdict, oracleResult.isWolf ? styles.oracleWolf : styles.oracleVillage]}>
              {oracleResult.isWolf ? 'IS THE WOLF' : 'IS NOT THE WOLF'}
            </Text>
          </View>
          <Text style={styles.oracleHint}>Remember this — you cannot check again.</Text>
          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            onPress={() => submitAction(selected)}
          >
            <Text style={styles.confirmBtnText}>Got it</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // No-action screen (villager or already-used ability)
  if (isNoAction) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.noActionContainer}>
          <View style={styles.noActionContent}>
            <RoleIcon role={currentNightActor.role} size={56} color="#3A2060" />
            <Text style={styles.actorName}>{currentNightActor.name}</Text>
            <View style={styles.roleLabelRow}>
              <RoleIcon role={currentNightActor.role} size={14} color="#5A3A8A" />
              <Text style={styles.roleLabel}>{ROLE_LABELS[currentNightActor.role]}</Text>
            </View>
            <Text style={styles.noActionText}>{NIGHT_ACTION_INSTRUCTIONS.no_action}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            onPress={() => submitAction(null)}
          >
            <Text style={styles.confirmBtnText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Active action screen (wolf / hunter / oracle with unused ability)
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.roleLabelRow}>
            <RoleIcon role={currentNightActor.role} size={16} color="#6A4A9A" />
            <Text style={styles.roleLabel}>{ROLE_LABELS[currentNightActor.role]}</Text>
          </View>
          <Text style={styles.actorName}>{currentNightActor.name}</Text>
          <Text style={styles.instruction}>
            {NIGHT_ACTION_INSTRUCTIONS[currentNightTurn.actionType]}
          </Text>
        </View>

        <View style={styles.listArea}>
          <ActionTargetList
            players={targets}
            selected={selected}
            onSelect={setSelected}
          />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
            onPress={() => submitAction(null)}
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.confirmBtn, styles.confirmBtnFlex, !selected && styles.confirmBtnDisabled, pressed && selected && styles.pressed]}
            onPress={handleConfirm}
            disabled={!selected}
          >
            <Text style={styles.confirmBtnText}>
              {isOracle ? 'Investigate' : 'Confirm'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, gap: 20 },
  noActionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  noActionContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  noActionText: {
    fontSize: 16,
    color: '#6A4A8A',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  header: { gap: 6 },
  roleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleLabel: { fontSize: 13, color: '#6A4A9A', textTransform: 'uppercase', letterSpacing: 2 },
  actorName: { fontSize: 28, color: '#E8D5FF', fontWeight: '800' },
  instruction: { fontSize: 16, color: '#8060A0', lineHeight: 24, marginTop: 4 },
  spacer: { flex: 1 },
  listArea: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 12 },
  skipBtn: {
    backgroundColor: '#1A0D2E',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A2A5A',
  },
  skipBtnText: { color: '#6A4A8A', fontSize: 16, fontWeight: '600' },
  confirmBtn: {
    backgroundColor: '#5A3A9A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A5ADA',
  },
  confirmBtnFlex: { flex: 1 },
  confirmBtnDisabled: {
    backgroundColor: '#1A0D2E',
    borderColor: '#2A1A4A',
  },
  confirmBtnText: { color: '#E8D5FF', fontSize: 18, fontWeight: '700' },
  oracleTitle: { fontSize: 22, color: '#A070E0', fontWeight: '700', textAlign: 'center' },
  oracleCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#120820',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4A2D8A',
    gap: 20,
    paddingHorizontal: 24,
  },
  oracleTargetName: { fontSize: 32, color: '#E8D5FF', fontWeight: '800', textAlign: 'center' },
  oracleVerdict: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  oracleWolf: { color: '#E04040' },
  oracleVillage: { color: '#40C040' },
  oracleHint: { fontSize: 13, color: '#5A3A8A', textAlign: 'center' },
  pressed: { opacity: 0.7 },
});
