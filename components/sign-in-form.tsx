import { SocialConnections } from '@/components/social-connections';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Alert, Pressable, type TextInput, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { loginUser } from '@/services/auth.service';
import { getRoleBasedRoute } from '@/lib/navigationUtils';


export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const onSubmit = async () => {
    try {
      console.log("🔐 Login attempt with email:", email);
      const user = await loginUser(email, password);

      console.log("📊 User object:", user);
      console.log("🔑 password_reset value:", user?.password_reset);

      if (user?.password_reset === true) {
        console.log("🔄 User NEEDS password reset - routing to reset screen");
        // Route to password reset screen
        router.replace({
          pathname: "/(auth)/reset-password",
          params: { email, userId: user.id, role: user.role }
        } as any);
      } else {
        console.log("✅ User does NOT need password reset - routing to dashboard");
        // Route to role-based dashboard
        const destination = getRoleBasedRoute(user.role);
        console.log("📍 Destination route:", destination);
        router.replace(destination as any);
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      Alert.alert("Login failed", err.message);
    }
  }

  return (
    <View className="gap-6 ">
      <Card className="bg-card sm:border-border border border-border rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-foreground font-bold text-2xl sm:text-left">MightyAsset</CardTitle>
          <CardDescription className="text-center text-foreground/70 sm:text-left mt-1">
            Welcome back! Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-2">
              <Label htmlFor="email" className="text-foreground font-semibold">Email Address</Label>
              <Input
                id="email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                submitBehavior="submit"
                className="bg-accent-100 border border-border text-foreground placeholder:text-foreground/40 rounded-lg px-4 py-3"
              />
            </View>
            <View className="gap-2">
              <View className="flex-row items-center">
                <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
              </View>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                className="bg-accent-100 border border-border text-foreground placeholder:text-foreground/40 rounded-lg px-4 py-3"
              />
            </View>
            <Button className="w-full bg-primary rounded-lg " onPress={onSubmit}>
              <Text className="text-white font-bold text-base">Sign In</Text>
            </Button>
          </View>

        </CardContent>
      </Card>
    </View>
  );
}
