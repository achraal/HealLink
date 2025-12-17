import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/database/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initializeDB = async () => {
      try {
        console.log('Initialisation de la base de données...');
        await initDatabase();
        console.log('Base de données initialisée avec succès');
      } catch (error) {
        console.error('erreur initialisation base de données:', error);
      }
    };
    initializeDB();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cagnotte-detail" options={{ headerShown: false }} />
        <Stack.Screen name="cagnotte-edit" options={{ headerShown: false }} />
        <Stack.Screen name="cagnotte-options" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
