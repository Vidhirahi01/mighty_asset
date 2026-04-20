import { Tabs } from 'expo-router';
import { User, LogOut, PackagePlus } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';
import React, { useState } from 'react';
import { View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function EmployeeLayout() {
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
                        backgroundColor: `${colors.card}e6`,
                        borderTopWidth: 0,
                        borderWidth: 1,
                        borderColor: `${colors.border}40`,
                        marginBottom: 16,
                        marginHorizontal: 16,
                        marginTop: 8,
                        paddingBottom: 8,
                        paddingTop: 8,
                        paddingHorizontal: 12,
                        borderRadius: 20,
                        overflow: 'hidden',
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        right: 16,
                        height: 72,
                        shadowColor: '#000',
                        shadowOpacity: 0.12,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 6,
                    },

                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: '#8b8b8b',

                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '700',
                        marginTop: 6,
                    },

                    tabBarItemStyle: {
                        paddingVertical: 4,
                        paddingHorizontal: 2,
                    },

                    headerLeft: () => (
                        <User
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
                        title: 'Employee Dashboard',
                        tabBarLabel: 'Dashboard',
                        tabBarIcon: ({ color }) => <User size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name='myassets'
                    options={{
                        title: 'My Assets',
                        tabBarLabel: 'My Assets',
                        tabBarIcon: ({ color }) => <PackagePlus size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="request-asset"
                    options={{
                        title: 'Request Asset Form',
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="report-issue"
                    options={{
                        title: 'Report Issue Form',
                        href: null,
                    }}
                />
                <Tabs.Screen
                    name="return-asset"
                    options={{
                        title: 'Return Asset Form',
                        href: null,
                    }}
                />
            </Tabs>
        </View>
    );
}
