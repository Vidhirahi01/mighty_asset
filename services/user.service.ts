import { supabase } from '../lib/supabase';

export interface CreateUserData {
    name: string;
    email: string;
    role: string;
    department: string;
    is_active: boolean;
    password?: string;
}

// Generate temporary password
export const generateTemporaryPassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Add random characters to reach 12 characters
    for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const createUser = async (userData: CreateUserData) => {
    try {
        const tempPassword = userData.password || generateTemporaryPassword();

        const { data, error } = await supabase.rpc('create_app_user', {
            user_email: userData.email,
            user_password: tempPassword,
            user_role: userData.role,
            user_name: userData.name,
            user_department: userData.department,
        });

        if (error) {
            console.error("User creation error:", error);
            throw new Error(`Failed to create user: ${error.message}`);
        }

        if (!data.success) {
            throw new Error(`Failed to create user: ${data.error}`);
        }

        console.log("User created successfully:", data);
        console.log("RPC Response data:", JSON.stringify(data));

        // Set password_needs_reset flag to true for users created with temporary password
        // Try multiple possible key names from the RPC response
        let userId = data.user_id || data.id || data.userId;

        if (!userId) {
            // Fallback: Query the database to find the user by email
            console.log("UserID not found in RPC response, querying by email:", userData.email);
            const { data: userFound, error: queryError } = await supabase
                .from('user_table')
                .select('id')
                .eq('email', userData.email)
                .single();

            if (!queryError && userFound) {
                userId = userFound.id;
                console.log("Found user ID by email:", userId);
            } else {
                console.warn("Could not find created user by email");
            }
        }

        if (userId) {
            console.log("Setting password_reset for user:", userId);
            const { error: updateError } = await supabase
                .from('user_table')
                .update({ password_reset: true })
                .eq('id', userId);

            if (updateError) {
                console.error("Error setting password_reset flag:", updateError);
                // Don't throw error here - user is still created, just log warning
            } else {
                console.log("✅ Password reset flag set to true for user:", userId);
            }
        } else {
            console.warn("⚠️ Could not determine user ID to set password_reset flag");
        }

        return { user: data, temporaryPassword: tempPassword };

    } catch (err: any) {
        console.error("Error creating user:", err);
        throw err;
    }
};

export const fetchAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from("user_table")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch users error:", error);
            throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return data;

    } catch (err: any) {
        console.error("Error fetching users:", err);
        throw err;
    }
};

export const updateUser = async (userId: string, userData: Partial<CreateUserData>) => {
    try {
        const { data, error } = await supabase
            .from("user_table")
            .update(userData)
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("User update error:", error);
            throw new Error(`Failed to update user: ${error.message}`);
        }

        return data;

    } catch (err: any) {
        console.error("Error updating user:", err);
        throw err;
    }
};

export const deleteUser = async (userId: string) => {
    try {
        const { error } = await supabase
            .from("user_table")
            .delete()
            .eq("id", userId);

        if (error) {
            console.error("User delete error:", error);
            throw new Error(`Failed to delete user: ${error.message}`);
        }

        return true;

    } catch (err: any) {
        console.error("Error deleting user:", err);
        throw err;
    }
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
    try {
        // ✅ User updates their own password while logged in (no admin key needed)
        const { error: authError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (authError) {
            console.error("Auth password update error:", authError);
            throw new Error(`Failed to update password: ${authError.message}`);
        }

        // Update password_needs_reset flag in database
        const { data, error: dbError } = await supabase
            .from("user_table")
            .update({ password_needs_reset: false })
            .eq("id", userId)
            .select()
            .single();

        if (dbError) {
            console.error("User update error:", dbError);
            throw new Error(`Failed to update user: ${dbError.message}`);
        }

        return data;

    } catch (err: any) {
        console.error("Error resetting password:", err);
        throw err;
    }
};

/**
 * Force a user to reset their password on next login
 * @param userId - The user ID to force password reset for
 * @returns Updated user data
 */
export const forcePasswordReset = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from("user_table")
            .update({ password_reset: true })
            .eq("id", userId)
            .select()
            .single();

        if (error) {
            console.error("Error setting password reset flag:", error);
            throw new Error(`Failed to force password reset: ${error.message}`);
        }

        console.log("Password reset flag set for user:", userId);
        return data;

    } catch (err: any) {
        console.error("Error forcing password reset:", err);
        throw err;
    }
};

/**
 * DEBUG FUNCTION: Check if user has password_reset flag set
 * @param email - User's email
 * @returns User data including password_reset flag
 */
export const debugCheckPasswordResetFlag = async (email: string) => {
    try {
        const { data, error } = await supabase
            .from("user_table")
            .select("id, email, role, department, password_reset")
            .eq("email", email)
            .single();

        if (error) {
            console.error("Error fetching user:", error);
            throw new Error(`Failed to fetch user: ${error.message}`);
        }

        console.log("=== DEBUG: User Password Reset Flag ===");
        console.log("Email:", data.email);
        console.log("User ID:", data.id);
        console.log("Role:", data.role);
        console.log("Password needs reset:", data.password_reset);
        console.log("=====================================");

        return data;

    } catch (err: any) {
        console.error("Debug error:", err);
        throw err;
    }
};