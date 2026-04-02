import { Tabs } from 'expo-router';
import { Home, LogOut } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';
import React, { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ManagerLayout() {
    const { colors } = NAV_THEME;
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        setLoggingOut(true);
                        await supabase.auth.signOut();
                        router.replace('/(auth)/login-screen');
                    },
                    style: 'destructive',
                },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
            console.error(error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <View className="flex-1">
            <Tabs
                screenOptions={{
                    headerStyle: {
                        backgroundColor: 'transparent',
                        elevation: 0,
                        shadowColor: 'transparent',
                    },

                    headerBackground: () => (
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.card,
                                borderBottomLeftRadius: 20,
                                borderBottomRightRadius: 20,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                                shadowColor: '#000',
                                shadowOpacity: 0.08,
                                shadowRadius: 8,
                                shadowOffset: { width: 0, height: 2 },
                                elevation: 3,
                            }}
                        />
                    ),

                    headerTintColor: colors.text,

                    headerTitleStyle: {
                        fontFamily: 'ClashGrotesk-Bold',
                        fontSize: 16,
                    },

                    headerShadowVisible: false,

                    tabBarStyle: {
                        backgroundColor: colors.card,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    },

                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: '#999999',

                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                    },

                    headerLeft: () => (
                        <Home
                            size={20}
                            color={colors.primary}
                            strokeWidth={2}
                            style={{ marginLeft: 12 }}
                        />
                    ),

                    headerRight: () => (
                        <Pressable onPress={handleLogout} disabled={loggingOut} className="mr-4 p-2">
                            <LogOut size={20} color={colors.primary} strokeWidth={2} />
                        </Pressable>
                    ),
                }}
            >
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Manager Dashboard',
                        tabBarLabel: 'Dashboard',
                        tabBarIcon: ({ color }) => <Home size={20} color={color} />,
                    }}
                />
            </Tabs>
        </View>
    );
}
