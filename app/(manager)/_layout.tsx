import { Tabs, useRouter } from 'expo-router';
import { Home, CheckSquare, Package, Gauge } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTabScreenOptions } from '@/hooks/useTabScreenOptions';
import { useTheme } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { LogoutModal } from '@/components/shared/LogoutModal';

export default function ManagerLayout() {
    const baseScreenOptions = useTabScreenOptions();
    const { colors } = useTheme();
    const router = useRouter();
    const { logout, isLoading } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login-screen');
        } catch (error) {
            console.error('Logout error:', error);
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
                        <Home
                            size={20}
                            color={colors.primary}
                            strokeWidth={2}
                            style={{ marginLeft: 12 }}
                        />
                    ),

                    headerRight: () => (
                        <LogoutButton onPress={() => setShowLogoutModal(true)} />
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
                <Tabs.Screen
                    name="approvals"
                    options={{
                        title: 'Approvals',
                        tabBarLabel: 'Approvals',
                        tabBarIcon: ({ color }) => <CheckSquare size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="inventory"
                    options={{
                        title: 'Inventory',
                        tabBarLabel: 'Inventory',
                        tabBarIcon: ({ color }) => <Package size={20} color={color} />,
                    }}
                />
                <Tabs.Screen
                    name="analytics"
                    options={{
                        title: 'Analytics',
                        tabBarLabel: 'Analytics',
                        tabBarIcon: ({ color }) => <Gauge size={20} color={color} />,
                    }}
                />
            </Tabs>

            <LogoutModal
                visible={showLogoutModal}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
                loggingOut={isLoading}
            />
        </View>
    );
}
