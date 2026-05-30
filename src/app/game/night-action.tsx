import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { NightGate } from '@/components/game/night-gate';
import { ActionTargetList } from '@/components/game/action-target-list';
import type { PlayerId } from '@/game/types';
import { ROLE_LABELS, ROLE_EMOJI, NIGHT_ACTION_INSTRUCTIONS } from '@/game/constants';

export default function NightActionScreen() {
  const { state, dispatch, alivePlayers, currentNightTurn, currentNightActor } = useGame();
  const [isReady, setIsReady] = useState(false);
  const [selected, setSelected] = useState<PlayerId | null>(null);
  // Oracle reveal state: after confirming, show oracle's private result
  const [oracleResult, setOracleResult] = useState<{ targetName: string; isWolf: boolean } | null>(null);

  // Reset gate & selection when the turn index changes
  useEffect(() => {
    setIsReady(false);
    setSelected(null);
    setOracleResult(null);
  }, [state.nightTurnIndex]);

  // Navigate when phase changes to night_summary or game_over
  useEffect(() => {
    if (state.phase === 'night_summary') {
      router.replace('/game/night-summary');
    } else if (state.phase === 'game_over') {
      router.replace('/game/result');
    }
  }, [state.phase]);

  if (!currentNightTurn || !currentNightActor) return null;

  // Available targets: alive players excluding the actor
  const targets = alivePlayers.filter((p) => p.id !== currentNightActor.id);

  const isOracle = currentNightTurn.actionType === 'oracle_check';

  const handleConfirm = () => {
    if (!selected) return;

    if (isOracle) {
      const target = state.players.find((p) => p.id === selected);
      if (target) {
        setOracleResult({ targetName: target.name, isWolf: target.role === 'wolf' });
        return; // Don't dispatch yet — wait for oracle to tap "Got it"
      }
    }

    dispatch({ type: 'SUBMIT_NIGHT_ACTION', targetId: selected });
  };

  const handleOracleAcknowledge = () => {
    if (!selected) return;
    dispatch({ type: 'SUBMIT_NIGHT_ACTION', targetId: selected });
  };

  // Gate screen
  if (!isReady) {
    return (
      <NightGate
        playerName={currentNightActor.name}
        subtitle={`${ROLE_EMOJI[currentNightActor.role]} ${ROLE_LABELS[currentNightActor.role]}`}
        onReady={() => setIsReady(true)}
      />
    );
  }

  // Oracle private result screen
  if (oracleResult) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.oracleTitle}>🔮 Oracle's Vision</Text>
          <View style={styles.oracleCard}>
            <Text style={styles.oracleTargetName}>{oracleResult.targetName}</Text>
            <Text style={[styles.oracleVerdict, oracleResult.isWolf ? styles.oracleWolf : styles.oracleVillage]}>
              {oracleResult.isWolf ? '🐺 IS THE WOLF' : '✅ IS NOT THE WOLF'}
            </Text>
          </View>
          <Text style={styles.oracleHint}>Remember this — you cannot check again.</Text>
          <Pressable
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.pressed]}
            onPress={handleOracleAcknowledge}
          >
            <Text style={styles.confirmBtnText}>Got it</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Action screen
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.roleLabel}>
            {ROLE_EMOJI[currentNightActor.role]} {ROLE_LABELS[currentNightActor.role]}
          </Text>
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

        <Pressable
          style={({ pressed }) => [styles.confirmBtn, !selected && styles.confirmBtnDisabled, pressed && selected && styles.pressed]}
          onPress={handleConfirm}
          disabled={!selected}
        >
          <Text style={styles.confirmBtnText}>
            {isOracle ? 'Investigate' : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 32, gap: 20 },
  header: { gap: 6 },
  roleLabel: { fontSize: 13, color: '#6A4A9A', textTransform: 'uppercase', letterSpacing: 2 },
  actorName: { fontSize: 28, color: '#E8D5FF', fontWeight: '800' },
  instruction: { fontSize: 16, color: '#8060A0', lineHeight: 24, marginTop: 4 },
  listArea: { flex: 1 },
  confirmBtn: {
    backgroundColor: '#5A3A9A',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A5ADA',
  },
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
