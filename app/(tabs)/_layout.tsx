import '@/global.css';
import { useFonts } from 'expo-font';
import { NAV_THEME } from '@/lib/theme';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';

export default function RootLayout() {
  const [loaded] = useFonts({
    ClashGrotesk: require('@/assets/fonts/ClashGrotesk-Regular.otf'),
    'ClashGrotesk-Bold': require('@/assets/fonts/ClashGrotesk-Bold.otf'),
    'ClashGrotesk-Semibold': require('@/assets/fonts/ClashGrotesk-Semibold.otf'),
  });

  if (!loaded) return null;

  return (

    <ThemeProvider value={NAV_THEME}>
      <View className="flex-1 bg-background dark">
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
        <StatusBar style="light" />
      </View>
    </ThemeProvider>

  );
}