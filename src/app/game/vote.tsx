import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/game/context';
import { NightGate } from '@/components/game/night-gate';
import { VoteButton } from '@/components/game/vote-button';
import type { PlayerId } from '@/game/types';
import { AdBanner } from '@/components/game/AdBanner';

export default function VoteScreen() {
  const { state, dispatch, alivePlayers } = useGame();

  const [voterIndex, setVoterIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [selected, setSelected] = useState<PlayerId | null>(null);
  // Collect all votes locally; dispatch to reducer only when everyone has voted
  const [localVotes, setLocalVotes] = useState<Record<PlayerId, PlayerId | null>>({});

  useEffect(() => {
    if (state.phase === 'game_over') {
      router.replace('/game/result');
    } else if (state.phase === 'vote_result') {
      router.replace('/game/vote-result');
    }
  }, [state.phase]);

  const currentVoter = alivePlayers[voterIndex];
  const nextVoter = alivePlayers[voterIndex + 1];
  const isLastVoter = voterIndex === alivePlayers.length - 1;

  // Targets: all alive players (a player can technically vote for anyone)
  const targets = alivePlayers.filter((p) => p.id !== currentVoter?.id);

  const handleVote = () => {
    if (!currentVoter) return;

    const updatedVotes = { ...localVotes, [currentVoter.id]: selected };

    if (isLastVoter) {
      // All players have voted — dispatch everything and submit.
      // useReducer processes dispatches sequentially in the same event, so
      // SUBMIT_VOTES sees the fully populated votes state.
      for (const [voterId, targetId] of Object.entries(updatedVotes)) {
        dispatch({ type: 'CAST_VOTE', voterId, targetId });
      }
      dispatch({ type: 'SUBMIT_VOTES' });
    } else {
      setLocalVotes(updatedVotes);
      setVoterIndex((i) => i + 1);
      setIsReady(false);
      setSelected(null);
    }
  };

  if (!currentVoter) return null;

  // Gate screen — pass device to current voter
  if (!isReady) {
    return (
      <NightGate
        playerName={currentVoter.name}
        subtitle={`Vote ${voterIndex + 1} of ${alivePlayers.length}`}
        onReady={() => setIsReady(true)}
        readyLabel="Cast my vote"
      />
    );
  }

  // Voting screen for current voter
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentVoter.name}</Text>
          <Text style={styles.subtitle}>Who do you vote to eliminate?</Text>
        </View>

        <View style={styles.list}>
          {targets.map((p) => (
            <VoteButton
              key={p.id}
              playerId={p.id}
              name={p.name}
              voteCount={0}
              isSelected={selected === p.id}
              onPress={setSelected}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.abstainBtn, pressed && styles.pressed]}
            onPress={() => setSelected(null)}
          >
            <Text style={styles.abstainBtnText}>Abstain</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.voteBtn,
              pressed && styles.pressed,
            ]}
            onPress={handleVote}
          >
            <Text style={styles.voteBtnText}>
              {isLastVoter
                ? 'Submit Votes'
                : `Vote → pass to ${nextVoter.name}`}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#080510' },
  scroll: { padding: 24, gap: 24, paddingBottom: 48 },
  header: { gap: 6 },
  title: { fontSize: 28, color: '#E8D5FF', fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#6A4A8A', lineHeight: 22 },
  list: { gap: 10 },
  actions: { gap: 12 },
  abstainBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A2A5A',
  },
  abstainBtnText: { color: '#6A4A8A', fontSize: 15, fontWeight: '600' },
  voteBtn: {
    backgroundColor: '#8B2020',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C84B4B',
  },
  voteBtnText: { color: '#FFD0D0', fontSize: 18, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
