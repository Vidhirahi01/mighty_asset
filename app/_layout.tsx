import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 2,
        }
    }
});

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
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
                    <Stack.Screen name="(operation)" options={{ headerShown: false }} />
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
        </QueryClientProvider>
    );
}
