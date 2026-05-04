import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export interface User {
    id: string;
    email: string;
    role: string;
    name?: string;       
    department?: string; 
    is_active?: boolean; 
}

interface AuthStore {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    isLoading: false,
    isLoggedIn: false,

    setUser: (user) => set({ user, isLoggedIn: !!user }),

    setLoading: (loading) => set({ isLoading: loading }),

    logout: async () => {
        try {
            set({ isLoading: true });
            await supabase.auth.signOut();
            set({ user: null, isLoggedIn: false });
            // Navigation should be handled by the component calling this
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
            // Navigation should be handled by the component calling this
    },

    initializeAuth: async () => {
        try {
            set({ isLoading: true });
            const { data } = await supabase.auth.getSession();

            if (data.session?.user) {
                set({
                    user: {
                        id: data.session.user.id,
                        email: data.session.user.email || '',
                        role: data.session.user.user_metadata?.role || 'user',
                    },
                    isLoggedIn: true,
                });
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
