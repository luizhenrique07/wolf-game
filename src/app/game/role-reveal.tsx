import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useGame } from "@/game/context";
import { NightGate } from "@/components/game/night-gate";
import { RoleCard } from "@/components/game/role-card";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RoleRevealScreen() {
  const { state, dispatch } = useGame();
  const [isReady, setIsReady] = useState(false);

  const currentPlayer = state.players[state.revealIndex];
  const isLastPlayer = state.revealIndex === state.players.length - 1;

  // Reset gate when reveal index changes
  useEffect(() => {
    setIsReady(false);
  }, [state.revealIndex]);

  // Navigate away when phase changes
  useEffect(() => {
    if (state.phase === "discussion") {
      router.replace("/game/discussion");
    } else if (state.phase === "night_action") {
      router.replace("/game/night-action");
    }
  }, [state.phase]);

  if (!currentPlayer) return null;

  if (!isReady) {
    return (
      <NightGate
        playerName={currentPlayer.name}
        subtitle={`Player ${state.revealIndex + 1} of ${state.players.length}`}
        onReady={() => setIsReady(true)}
        readyLabel="Show my role"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>Your role</Text>
        <Text style={styles.name}>{currentPlayer.name}</Text>

        <View style={styles.cardArea}>
          <RoleCard role={currentPlayer.role} revealed={true} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            pressed && styles.pressed,
          ]}
          onPress={() => dispatch({ type: "NEXT_REVEAL" })}
        >
          <Text style={styles.continueBtnText}>
            {isLastPlayer ? "Begin Night 🌙" : `Done `}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#080510" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 16,
  },
  heading: {
    fontSize: 13,
    color: "#5A3A8A",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  name: { fontSize: 28, color: "#E8D5FF", fontWeight: "800" },
  cardArea: { flex: 1, justifyContent: "center", width: "100%" },
  continueBtn: {
    backgroundColor: "#3D2B6B",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#7C5CBF",
    width: "100%",
    alignItems: "center",
  },
  continueBtnText: { color: "#E8D5FF", fontSize: 17, fontWeight: "700" },
  pressed: { opacity: 0.7 },
});
