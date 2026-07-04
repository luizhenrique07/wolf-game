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

export default function VoteResultScreen() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase === 'night_action') {
      router.replace('/game/night-action');
    }
  }, [state.phase]);

  const votedOutPlayer = state.lastVoteEliminated
    ? state.players.find((p) => p.id === state.lastVoteEliminated)
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeIn delay={0}>
          <Text style={styles.icon}>🗳️</Text>
        </FadeIn>

        <FadeIn delay={300}>
          <Text style={styles.heading}>The votes are in…</Text>
        </FadeIn>

        <FadeIn delay={700}>
          <View style={styles.resultCard}>
            {votedOutPlayer ? (
              <>
                <Text style={styles.eliminatedName}>{votedOutPlayer.name}</Text>
                <Text style={styles.eliminatedText}>was voted out by the village.</Text>
                <ResultBadge survived={false} delay={900} />
              </>
            ) : (
              <>
                <Text style={styles.tieEmoji}>🤝</Text>
                <Text style={styles.tieText}>No one was eliminated.</Text>
                <Text style={styles.tieSubtext}>The vote was tied or everyone abstained.</Text>
              </>
            )}
          </View>
        </FadeIn>

        <FadeIn delay={1100}>
          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            onPress={() => dispatch({ type: 'ACKNOWLEDGE_VOTE_RESULT' })}
          >
            <Text style={styles.continueBtnText}>Continue to Night 🌙</Text>
          </Pressable>
        </FadeIn>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 24, paddingBottom: 48, flexGrow: 1, justifyContent: 'center' },
  icon: { fontSize: 48, textAlign: 'center' },
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
  eliminatedName: { fontSize: 28, color: '#E8D5FF', fontWeight: '800', textAlign: 'center' },
  eliminatedText: { fontSize: 16, color: '#8060A0', textAlign: 'center' },
  tieEmoji: { fontSize: 48 },
  tieText: { fontSize: 20, color: '#60C060', fontWeight: '700', textAlign: 'center' },
  tieSubtext: { fontSize: 14, color: '#5A3A8A', textAlign: 'center' },
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
