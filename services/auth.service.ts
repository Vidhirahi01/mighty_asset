import { getPushToken } from '@/lib/tokens';
import { supabase } from '../lib/supabase'; 

export const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        console.error("Auth Error:", error);
        throw new Error(`Authentication failed: ${error.message}`);
    }

    const userId = data.user.id;
    console.log("Auth successful. User ID:", userId);
    const token = await getPushToken();
    if(token) {
        await supabase.from('notification_table').upsert(
            {user_id: userId, token, type: 'device_token'},
            {onConflict: 'user_id'}
        );
    }
    const { data: userData, error: userError } = await supabase
        .from("user_table")
        .select("*")
        .eq("id", userId)
        .single();

    if (userError) {
        console.error("User table error:", userError);
        throw new Error(`User not found in database: ${userError.message}`);
    }

    console.log("User data fetched:", userData);
    console.log("Password reset flag:", userData?.password_reset);

    if (userData?.password_reset === true) {
        console.log("User NEEDS password reset - will redirect to reset screen");
    } else if (userData?.password_reset === false) {
        console.log("User does NOT need password reset - proceed to dashboard");
    } else {
        console.warn("password_reset is unclear:", userData?.password_reset, typeof userData?.password_reset);
    }

    return userData;
};
