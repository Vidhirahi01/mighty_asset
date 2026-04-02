import AsyncStorage from '@react-native-async-storage/async-storage';

const TEMP_PASSWORD_KEY = 'temp_passwords';

export const storeTempPassword = async (email: string, password: string): Promise<void> => {
    try {
        const existing = await AsyncStorage.getItem(TEMP_PASSWORD_KEY);
        const passwords = existing ? JSON.parse(existing) : {};
        passwords[email] = password;
        await AsyncStorage.setItem(TEMP_PASSWORD_KEY, JSON.stringify(passwords));
    } catch (error) {
        console.error('Error storing temp password:', error);
    }
};

export const getTempPassword = async (email: string): Promise<string | null> => {
    try {
        const existing = await AsyncStorage.getItem(TEMP_PASSWORD_KEY);
        if (!existing) return null;
        const passwords = JSON.parse(existing);
        return passwords[email] || null;
    } catch (error) {
        console.error('Error getting temp password:', error);
        return null;
    }
};
       
export const removeTempPassword = async (email: string): Promise<void> => {
    try {
        const existing = await AsyncStorage.getItem(TEMP_PASSWORD_KEY);
        if (!existing) return;
        const passwords = JSON.parse(existing);
        delete passwords[email];
        await AsyncStorage.setItem(TEMP_PASSWORD_KEY, JSON.stringify(passwords));
    } catch (error) {
        console.error('Error removing temp password:', error);
    }
};
