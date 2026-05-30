import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface Props {
  playerName: string;
  subtitle?: string;
  onReady: () => void;
  readyLabel?: string;
}

export function NightGate({ playerName, subtitle, onReady, readyLabel = "I'm ready" }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.moon}>🌙</Text>
        <Text style={styles.instruction}>Pass the device to</Text>
        <Text style={styles.name}>{playerName}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.hint}>Everyone else — look away.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onReady}
      >
        <Text style={styles.buttonText}>{readyLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#080510',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
    zIndex: 100,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  moon: {
    fontSize: 64,
    marginBottom: 8,
  },
  instruction: {
    fontSize: 18,
    color: '#8060A0',
    fontWeight: '400',
  },
  name: {
    fontSize: 36,
    color: '#E8D5FF',
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6040A0',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  hint: {
    fontSize: 14,
    color: '#4A3060',
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3D2B6B',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: '#7C5CBF',
    width: '100%',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#E8D5FF',
    fontSize: 18,
    fontWeight: '700',
  },
});
