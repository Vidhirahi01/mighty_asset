import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(manager)" options={{ headerShown: false }} />
                    <Stack.Screen name="(technician)" options={{ headerShown: false }} />
                    <Stack.Screen name="(employee)" options={{ headerShown: false }} />
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}
