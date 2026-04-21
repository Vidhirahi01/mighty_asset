import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export const useLogout = () => {
    const router = useRouter();
    const { logout, isLoading } = useAuthStore();

    const performLogout = async () => {
        try {
            await logout();
            router.replace('/(auth)/login-screen');
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
            console.error(error);
        }
    };

    const initiateLogout = (useAlert: boolean = true) => {
        if (useAlert) {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
                {
                    text: 'Cancel',
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: performLogout,
                    style: 'destructive',
                },
            ]);
        } else {
            performLogout();
        }
    };

    return { initiateLogout, performLogout, loggingOut: isLoading };
};