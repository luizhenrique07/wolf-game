import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { ResultBadge } from '@/components/game/result-badge';
import { AdBanner } from '@/components/game/AdBanner';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500 }));
  }, [delay, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

export default function NightSummaryScreen() {
  const { state, dispatch } = useGame();
  const summary = state.lastNightSummary;

  useEffect(() => {
    if (state.phase === 'discussion') {
      router.replace('/game/discussion');
    }
  }, [state.phase]);

  const killedPlayer = summary?.killed
    ? state.players.find((p) => p.id === summary.killed)
    : null;

  const votedOutPlayer = state.lastVoteEliminated
    ? state.players.find((p) => p.id === state.lastVoteEliminated)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn delay={0}>
          <Text style={styles.moon}>🌅</Text>
        </FadeIn>

        <FadeIn delay={300}>
          <Text style={styles.heading}>The night has ended…</Text>
        </FadeIn>

        {votedOutPlayer && (
          <FadeIn delay={500}>
            <View style={styles.resultCard}>
              <Text style={styles.killedName}>{votedOutPlayer.name}</Text>
              <Text style={styles.killedText}>was voted out by the village.</Text>
              <ResultBadge survived={false} delay={700} />
            </View>
          </FadeIn>
        )}

        <FadeIn delay={700}>
          <View style={styles.resultCard}>
            {killedPlayer ? (
              <>
                <Text style={styles.killedName}>{killedPlayer.name}</Text>
                <Text style={styles.killedText}>did not survive the night.</Text>
                <ResultBadge survived={false} delay={900} />
              </>
            ) : (
              <>
                <Text style={styles.safeEmoji}>🛡️</Text>
                <Text style={styles.safeText}>The village slept safely.</Text>
                <Text style={styles.safeSubtext}>No one was killed during the night.</Text>
              </>
            )}
          </View>
        </FadeIn>

        <FadeIn delay={1100}>
          <View style={styles.playerList}>
            <Text style={styles.playerListTitle}>Status</Text>
            {state.players.map((p) => (
              <View key={p.id} style={[styles.playerRow, !p.isAlive && styles.playerRowDead]}>
                <Text style={[styles.playerName, !p.isAlive && styles.playerNameDead]}>
                  {p.name}
                </Text>
                <Text style={[styles.playerStatus, !p.isAlive && styles.statusDead]}>
                  {p.isAlive ? 'Alive' : 'Eliminated'}
                </Text>
              </View>
            ))}
          </View>
        </FadeIn>

        <FadeIn delay={1300}>
          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={() => dispatch({ type: 'ACKNOWLEDGE_NIGHT_SUMMARY' })}
          >
            <Text style={styles.continueBtnText}>Begin Discussion 💬</Text>
          </Pressable>
        </FadeIn>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },
  moon: { fontSize: 48, textAlign: 'center', marginTop: 16 },
  heading: { fontSize: 24, color: '#E8D5FF', fontWeight: '700', textAlign: 'center' },
  resultCard: {
    backgroundColor: '#150C28',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A1A4A',
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  killedName: { fontSize: 28, color: '#E8D5FF', fontWeight: '800', textAlign: 'center' },
  killedText: { fontSize: 16, color: '#8060A0', textAlign: 'center' },
  safeEmoji: { fontSize: 48 },
  safeText: { fontSize: 20, color: '#60C060', fontWeight: '700', textAlign: 'center' },
  safeSubtext: { fontSize: 14, color: '#5A3A8A', textAlign: 'center' },
  playerList: { gap: 8 },
  playerListTitle: {
    fontSize: 12,
    color: '#5A3A8A',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#150C28',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A1A4A',
  },
  playerRowDead: { opacity: 0.5 },
  playerName: { fontSize: 16, color: '#A080C0', fontWeight: '500' },
  playerNameDead: { textDecorationLine: 'line-through', color: '#6A4A8A' },
  playerStatus: { fontSize: 13, color: '#60A060', fontWeight: '600' },
  statusDead: { color: '#A04040' },
  continueBtn: {
    backgroundColor: '#5A3A9A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A5ADA',
  },
  continueBtnText: { color: '#E8D5FF', fontSize: 18, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
