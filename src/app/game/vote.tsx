import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { VoteButton } from '@/components/game/vote-button';
import type { PlayerId } from '@/game/types';

export default function VoteScreen() {
  const { state, dispatch, alivePlayers } = useGame();
  // Track the currently highlighted vote (last tap) for visual feedback
  const [highlight, setHighlight] = useState<PlayerId | null>(null);

  useEffect(() => {
    if (state.phase === 'game_over') {
      router.replace('/game/result');
    } else if (state.phase === 'night_action') {
      router.replace('/game/night-action');
    }
  }, [state.phase]);

  // Count votes per target
  const voteCounts: Record<PlayerId, number> = {};
  for (const targetId of Object.values(state.votes)) {
    if (targetId) {
      voteCounts[targetId] = (voteCounts[targetId] ?? 0) + 1;
    }
  }

  const totalVotes = Object.keys(state.votes).length;
  const aliveCount = alivePlayers.length;

  const handleVote = (targetId: PlayerId) => {
    setHighlight(targetId);
    // Use the highlight as the voter id (simplest public voting: last tap wins per voter)
    // In public voting, each new tap adds/updates a vote from that player
    // We use the target itself as a key since we don't track individual voter identity
    // Instead we track a running vote list keyed by unique tap IDs
    const voterId = `vote_${Date.now()}`;
    dispatch({ type: 'CAST_VOTE', voterId, targetId });
  };

  const handleFinalize = () => {
    if (totalVotes === 0) {
      Alert.alert('No votes cast', 'At least one vote must be cast before finalizing.');
      return;
    }
    dispatch({ type: 'SUBMIT_VOTES' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Vote</Text>
          <Text style={styles.subtitle}>
            Tap a player to vote. Most votes = eliminated. Tie = no elimination.
          </Text>
        </View>

        <View style={styles.tally}>
          <Text style={styles.tallyText}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</Text>
        </View>

        <View style={styles.list}>
          {alivePlayers.map((p) => (
            <VoteButton
              key={p.id}
              playerId={p.id}
              name={p.name}
              voteCount={voteCounts[p.id] ?? 0}
              isSelected={highlight === p.id}
              onPress={handleVote}
            />
          ))}
        </View>

        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Each player physically taps the screen to cast their vote. Votes are public.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.finalizeBtn, pressed && styles.pressed]}
          onPress={handleFinalize}
        >
          <Text style={styles.finalizeBtnText}>Finalize Votes ⚖️</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 20, paddingBottom: 48 },
  header: { gap: 8 },
  title: { fontSize: 28, color: '#E8D5FF', fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#6A4A8A', lineHeight: 22 },
  tally: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A0D2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3A2A5A',
  },
  tallyText: { color: '#7A5AAA', fontSize: 13, fontWeight: '600' },
  list: { gap: 10 },
  hint: {
    backgroundColor: '#100820',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1A0D2E',
  },
  hintText: { color: '#4A2D6A', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  finalizeBtn: {
    backgroundColor: '#8B2020',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C84B4B',
  },
  finalizeBtnText: { color: '#FFD0D0', fontSize: 18, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
