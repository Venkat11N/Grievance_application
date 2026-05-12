import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../src/services/auth';

const magicOtpHintEnabled = process.env.EXPO_PUBLIC_ENABLE_MAGIC_OTP === 'true';

export default function VerifyOtpScreen() {
  // Retrieve the email passed from the previous screen
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.subtitle}>No email provided. Please go back and register or login first.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/login' as any)}>
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.verifyOtp(email, otp);
      await SecureStore.setItemAsync('authToken', response.token);
      Alert.alert('Success', 'Verified successfully!');
      router.replace('/notifications' as any);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.eyebrow}>Maritime Grievance Portal</Text>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code generated for {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={__DEV__ && magicOtpHintEnabled ? 'Enter OTP (dev hint: 123456)' : 'Enter OTP'}
        placeholderTextColor="#6B7280"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify Code</Text>
        </TouchableOpacity>
      )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 28, backgroundColor: '#F4F7FB' },
  eyebrow: { color: '#2563EB', fontSize: 13, fontWeight: '800', marginBottom: 8, textAlign: 'center', textTransform: 'uppercase' },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 8, textAlign: 'center', color: '#111827' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 26, textAlign: 'center', color: '#4B5563' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8,
    padding: 15, fontSize: 18, marginBottom: 20, textAlign: 'center', color: '#111827',
    letterSpacing: 5
  },
  button: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
