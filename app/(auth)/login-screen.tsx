import { SignInForm } from '@/components/sign-in-form';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function LoginScreen() {
  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : 'height'}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-background">
        <SignInForm />
      </View>
    </KeyboardAvoidingView>
  );
}