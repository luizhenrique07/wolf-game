import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  Keyframe,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { ROLE_LABELS, TEAM_LABELS } from '@/game/constants';
import { ROLE_TEAM } from '@/game/types';
import { RoleIcon, WolfIcon } from '@/components/game/icons';

function WinnerBanner({ winner }: { winner: 'wolves' | 'village' }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
  }, [opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isWolves = winner === 'wolves';

  return (
    <Animated.View style={[styles.banner, isWolves ? styles.bannerWolf : styles.bannerVillage, style]}>
      <WolfIcon size={64} color={isWolves ? '#40C060' : '#E04040'} />
      <Text style={[styles.bannerTitle, isWolves ? styles.bannerTitleWolf : styles.bannerTitleVillage]}>
        {isWolves ? 'Wolf wins!' : 'Wolf loses!'}
      </Text>
    </Animated.View>
  );
}

export default function ResultScreen() {
  const { state, dispatch } = useGame();

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    router.replace('/');
  };

  if (!state.winner) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <WinnerBanner winner={state.winner} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Roles Revealed</Text>
          {state.players.map((p, idx) => (
            <View key={p.id} style={[styles.playerRow, !p.isAlive && styles.playerRowDead]}>
              <View style={styles.playerInfo}>
                <RoleIcon role={p.role} size={24} color={p.isAlive ? '#A080C0' : '#5A3A8A'} />
                <View>
                  <Text style={[styles.playerName, !p.isAlive && styles.playerNameDead]}>
                    {p.name}
                  </Text>
                  <Text style={styles.playerRole}>
                    {ROLE_LABELS[p.role]} · {TEAM_LABELS[ROLE_TEAM[p.role]]}
                  </Text>
                </View>
              </View>
              <Text style={[styles.status, p.isAlive ? styles.statusAlive : styles.statusDead]}>
                {p.isAlive ? 'Alive' : 'Eliminated'}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.playAgainBtn, pressed && styles.pressed]}
          onPress={handlePlayAgain}
        >
          <Text style={styles.playAgainBtnText}>Play Again 🐺</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },
  banner: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    marginTop: 16,
  },
  bannerWolf: { backgroundColor: '#052A0A', borderColor: '#1A7A2A' },
  bannerVillage: { backgroundColor: '#2A0505', borderColor: '#8B2020' },
  bannerTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  bannerTitleWolf: { color: '#40C060' },
  bannerTitleVillage: { color: '#E04040' },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 12,
    color: '#5A3A8A',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#150C28',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A1A4A',
  },
  playerRowDead: { opacity: 0.55 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playerName: { fontSize: 16, color: '#E8D5FF', fontWeight: '600' },
  playerNameDead: { textDecorationLine: 'line-through', color: '#7A5A9A' },
  playerRole: { fontSize: 12, color: '#6A4A8A', marginTop: 2 },
  status: { fontSize: 12, fontWeight: '600' },
  statusAlive: { color: '#40C060' },
  statusDead: { color: '#A04040' },
  playAgainBtn: {
    backgroundColor: '#5A3A9A',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8A5ADA',
  },
  playAgainBtnText: { color: '#E8D5FF', fontSize: 20, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
