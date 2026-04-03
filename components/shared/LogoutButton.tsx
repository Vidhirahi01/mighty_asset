import React from 'react';
import { Pressable } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';

interface LogoutButtonProps {
    onPress: () => void;
}

export function LogoutButton({ onPress }: LogoutButtonProps) {
    const { colors } = NAV_THEME;
    return (
        <Pressable
            onPress={onPress}
            className="mr-4 p-2"
        >
            <LogOut size={20} color={colors.primary} strokeWidth={2} />
        </Pressable>
    );
}
