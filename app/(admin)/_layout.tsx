import { Tabs, useRouter } from 'expo-router';
import { Home, User, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTabScreenOptions } from '@/hooks/useTabScreenOptions';
import { useAuthStore } from '@/store/authStore';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { LogoutModal } from '@/components/shared/LogoutModal';

export default function AdminLayout() {
    const baseScreenOptions = useTabScreenOptions();
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
                    ...baseScreenOptions,
                    headerLeft: () => (
                        <Shield
                            size={20}
                            color={baseScreenOptions.headerTintColor}
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
                <Tabs.Screen
                    name="createUserForm"
                    options={{
                        href: null,
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