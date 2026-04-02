import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
export const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: {
    background: '#f8f9fa',
    text: '#1a1a1a',
    card: '#ffffff',
    primary: '#1b72fc',
    notification: "#b41c2b",
    border: '#e0e0e0',
  },
};

// export const NAV_THEME: Record<'light' | 'dark', Theme> = {
//   light: {
//     ...DefaultTheme,
//     colors: {
//       background: THEME.light.background,
//       border: THEME.light.border,
//       card: THEME.light.card,
//       notification: THEME.light.destructive,
//       primary: THEME.light.primary,
//       text: THEME.light.foreground,
//     },
//   },
//   dark: {
//     ...DarkTheme,
//     colors: {
//       background: THEME.dark.background,
//       border: THEME.dark.border,
//       card: THEME.dark.card,
//       notification: THEME.dark.destructive,
//       primary: THEME.dark.primary,
//       text: THEME.dark.foreground,
//     },
//   },
// };