import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { initAds } from '@/lib/ads';

import { GameProvider } from '@/game/context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initAds();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="game/role-reveal" />
          <Stack.Screen name="game/night-action" />
          <Stack.Screen name="game/night-summary" />
          <Stack.Screen name="game/discussion" />
          <Stack.Screen name="game/vote" />
          <Stack.Screen name="game/result" />
        </Stack>
      </GameProvider>
    </ThemeProvider>
  );
}
