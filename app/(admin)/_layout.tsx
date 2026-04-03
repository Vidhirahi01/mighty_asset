import { Tabs } from 'expo-router';
import { Home, User, Shield, LogOut } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';

import React, { useState } from 'react';
import { View, Text, Alert, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { debugCheckPasswordResetFlag } from '@/services/user.service';

export default function AdminLayout() {
    const { colors } = NAV_THEME;
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await supabase.auth.signOut();
            setShowLogoutModal(false);
            router.replace('/(auth)/login-screen');
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
                        backgroundColor: 'transparent', // important
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
                        <Shield
                            size={20}
                            color={colors.primary}
                            strokeWidth={2}
                            style={{ marginLeft: 12 }}
                        />
                    ),

                    headerRight: () => (
                        <Pressable
                            onPress={() => setShowLogoutModal(true)}
                            className="mr-4 p-2"
                        >
                            <LogOut size={20} color={colors.primary} strokeWidth={2} />
                        </Pressable>
                    ),
                }}
            >
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: 'Dashboard',
                        headerTitle: 'Admin Dashboard',
                        tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="users"
                    options={{
                        title: 'Users',
                        headerTitle: 'Manage Users',
                        tabBarIcon: ({ color }) => <User size={24} color={color} />,
                    }}
                />
            </Tabs>

            {/* Logout Modal */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-card rounded-lg p-6 w-80 shadow-lg">
                        <Text className="text-foreground font-bold text-lg mb-2">Confirm Logout</Text>
                        <Text className="text-foreground/70 mb-6">
                            Are you sure you want to logout? You will need to login again.
                        </Text>

                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => setShowLogoutModal(false)}
                                className="flex-1 bg-secondary/10 rounded-lg py-3 items-center"
                                disabled={loggingOut}
                            >
                                <Text className="text-secondary font-bold">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleLogout}
                                className="flex-1 bg-primary rounded-lg py-3 items-center"
                                disabled={loggingOut}
                            >
                                <Text className="text-white font-bold">
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Debug Check Password Reset Flag */}
            <View>
                <Text>Debug Check Password Reset Flag</Text>
                <Pressable
                    onPress={() => debugCheckPasswordResetFlag('manager@example.com')}
                    className="bg-primary/10 rounded-lg p-3"
                >
                    <Text className="text-white">Check Reset Flag</Text>
                </Pressable>
            </View>
        </View>
    );
}