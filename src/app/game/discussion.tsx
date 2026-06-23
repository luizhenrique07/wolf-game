import { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { TimerRing } from '@/components/game/timer-ring';
import { useTimer } from '@/game/use-timer';
import { DISCUSSION_DURATION_MS } from '@/game/constants';

export default function DiscussionScreen() {
  const { state, dispatch, alivePlayers } = useGame();

  const handleExpire = useCallback(() => {
    dispatch({ type: 'DISCUSSION_ENDED' });
  }, [dispatch]);

  const { remainingMs, progress, start } = useTimer({
    durationMs: DISCUSSION_DURATION_MS,
    onExpire: handleExpire,
    autoStart: true,
  });

  useEffect(() => {
    start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.phase === 'vote') {
      router.replace('/game/vote');
    }
  }, [state.phase]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Discussion</Text>
          <Text style={styles.subtitle}>Round {state.round}</Text>
        </View>

        <View style={styles.timerSection}>
          <TimerRing progress={progress} remainingMs={remainingMs} size={260} />
        </View>

        <Text style={styles.hint}>
          Discuss who you think the Wolf is. The player with the most votes will be eliminated.
        </Text>

        <View style={styles.playerSection}>
          <Text style={styles.playerSectionTitle}>Alive Players</Text>
          {alivePlayers.map((p) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerName}>{p.name}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}
          onPress={() => dispatch({ type: 'DISCUSSION_ENDED' })}
        >
          <Text style={styles.skipBtnText}>Skip to Vote →</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },
  header: { alignItems: 'center', gap: 4 },
  title: { fontSize: 28, color: '#E8D5FF', fontWeight: '800' },
  subtitle: { fontSize: 13, color: '#5A3A8A', textTransform: 'uppercase', letterSpacing: 2 },
  timerSection: { alignItems: 'center', paddingVertical: 16 },
  hint: { fontSize: 14, color: '#6A4A8A', textAlign: 'center', lineHeight: 22 },
  playerSection: { gap: 8 },
  playerSectionTitle: {
    fontSize: 12,
    color: '#5A3A8A',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  playerRow: {
    backgroundColor: '#150C28',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A1A4A',
  },
  playerName: { fontSize: 16, color: '#A080C0', fontWeight: '500' },
  skipBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A2A5A',
  },
  skipBtnText: { color: '#6A4A8A', fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
