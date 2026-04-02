import { SignInForm } from '@/components/sign-in-form';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import LoginScreen from './(auth)/login-screen';

export default function Screen() {

  return (
    <>
        <LoginScreen />
    </>
  );
}

// const THEME_ICONS = {
//   light: SunIcon,
//   dark: MoonStarIcon,
// };

// function ThemeToggle() {
//   const { colorScheme, toggleColorScheme } = useColorScheme();

//   return (
//     <Button
//       onPressIn={toggleColorScheme}
//       size="icon"
//       variant="ghost"
//       className="ios:size-9 rounded-full web:mx-4">
//       <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
//     </Button>
//   );
// }
