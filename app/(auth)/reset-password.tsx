import { useState, useRef } from 'react';
import { Alert, View, ScrollView, type TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react-native';
import { getRoleBasedRoute } from '@/lib/navigationUtils';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { email, userId, role } = useLocalSearchParams<{ email: string; userId: string; role: string }>();

    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!newPassword.trim()) {
            Alert.alert("Error", "New password is required");
            return false;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return false;
        }

        // Check for password strength
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            Alert.alert(
                "Weak Password",
                "Password must contain uppercase letters, lowercase letters, and numbers"
            );
            return false;
        }

        return true;
    };

    const onSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Update password in Supabase Auth
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            // Update password_reset flag in database
            const { error: dbError } = await supabase
                .from('user_table')
                .update({ password_reset: false })
                .eq('id', userId);

            if (dbError) throw dbError;

            Alert.alert(
                "Password Reset Successfully!",
                "Your password has been changed. You can now access your dashboard.",
                [{
                    text: "OK",
                    onPress: () => {
                        // Navigate based on user role
                        const destination = getRoleBasedRoute(role as string);
                        router.replace(destination as any);
                    }
                }]
            );
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to reset password");
            console.error('Reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : 'height'}
            className="flex-1"
        >
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 justify-center px-6 py-8">
                    <Card className="bg-card border border-border rounded-xl shadow-md">
                        <CardHeader>
                            <View className="items-center mb-3">
                                <View className="bg-primary/10 rounded-full p-4">
                                    <Lock size={32} color="#1b72fc" strokeWidth={2} />
                                </View>
                            </View>
                            <CardTitle className="text-center text-foreground font-bold text-2xl">
                                Reset Your Password
                            </CardTitle>
                            <CardDescription className="text-center text-foreground/70 mt-2">
                                This is your first login. Please set a new password to continue.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="gap-6">
                            {/* Email Display */}
                            <View className="bg-accent-100 rounded-lg p-4">
                                <Text className="text-foreground/70 text-sm">Account:</Text>
                                <Text className="text-foreground font-semibold text-base mt-1">
                                    {email}
                                </Text>
                            </View>

                            {/* New Password */}
                            <View className="gap-2">
                                <Label htmlFor="new-password" className="text-foreground font-semibold">New Password</Label>
                                <View className="flex-row items-center bg-accent-100 rounded-lg px-4">
                                    <Input
                                        ref={passwordInputRef}
                                        id="new-password"
                                        secureTextEntry={!showNewPassword}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        returnKeyType="next"
                                        onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                                        className="flex-1 text-foreground bg-transparent py-3"
                                    />
                                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)} className="p-2">
                                        {showNewPassword ? (
                                            <Eye size={20} color="#666" />
                                        ) : (
                                            <EyeOff size={20} color="#666" />
                                        )}
                                    </Pressable>
                                </View>
                                <Text className="text-foreground/60 text-xs mt-1">
                                    • At least 8 characters{'\n'}• Mix of uppercase, lowercase, and numbers
                                </Text>
                            </View>

                            {/* Confirm Password */}
                            <View className="gap-2">
                                <Label htmlFor="confirm-password" className="text-foreground font-semibold">Confirm Password</Label>
                                <View className="flex-row items-center bg-accent-100 rounded-lg px-4">
                                    <Input
                                        ref={confirmPasswordInputRef}
                                        id="confirm-password"
                                        secureTextEntry={!showConfirmPassword}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={onSubmit}
                                        className="flex-1 text-foreground bg-transparent py-3"
                                    />
                                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-2">
                                        {showConfirmPassword ? (
                                            <Eye size={20} color="#666" />
                                        ) : (
                                            <EyeOff size={20} color="#666" />
                                        )}
                                    </Pressable>
                                </View>
                            </View>

                            {/* Password Match Indicator */}
                            {newPassword && confirmPassword && (
                                <View className={`flex-row items-center gap-2 p-3 rounded-lg ${newPassword === confirmPassword
                                    ? 'bg-success/10'
                                    : 'bg-destructive/10'
                                    }`}>
                                    <CheckCircle
                                        size={18}
                                        color={newPassword === confirmPassword ? '#22c55e' : '#ef4444'}
                                    />
                                    <Text className={`font-semibold text-sm ${newPassword === confirmPassword
                                        ? 'text-success'
                                        : 'text-destructive'
                                        }`}>
                                        {newPassword === confirmPassword
                                            ? 'Passwords match'
                                            : 'Passwords do not match'}
                                    </Text>
                                </View>
                            )}

                            {/* Reset Button */}
                            <Button
                                className="w-full bg-primary rounded-lg py-3"
                                onPress={onSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <Text className="text-white font-bold text-base">Reset Password</Text>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
