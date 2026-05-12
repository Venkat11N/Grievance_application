import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="register" options={{ gestureEnabled: false }} />
        <Stack.Screen name="notifications" options={{ gestureEnabled: false }} />
        <Stack.Screen name="notification/[id]" />
      </Stack>
    </AuthProvider>
  );
}
