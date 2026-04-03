import React, { useMemo } from 'react';
import { View } from 'react-native';
import { NAV_THEME } from '@/lib/theme';

export const useTabScreenOptions = (): any => {
    const { colors } = NAV_THEME;

    return useMemo(() => ({
        headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowColor: 'transparent',
        },

        headerBackground: () => React.createElement(View, {
            style: {
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
            }
        }),

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
    }), [colors]);
};
