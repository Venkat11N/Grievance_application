import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth';
import { router, useNavigation } from 'expo-router';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setResendCooldownSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldownSeconds]);

  const handleRequestOtp = async () => {
    if (isOtpSent && resendCooldownSeconds > 0) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await authService.requestOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtp('');
      setIsOtpSent(true);
      setResendCooldownSeconds(30);
      Alert.alert('Success', 'OTP sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, trimmedOtp);
      if (response.token) {
        await SecureStore.setItemAsync('authToken', response.token);
        await SecureStore.setItemAsync('userRole', response.user.role);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'notifications' }],
          })
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.screen}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.eyebrow}>Maritime Grievance Portal</Text>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Receive a secure OTP to access grievance updates.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email *"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isOtpSent}
      />

      {isOtpSent && (
        <TextInput
          style={styles.input}
          placeholder="Enter OTP *"
          placeholderTextColor="#6B7280"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={isOtpSent ? handleLogin : handleRequestOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isOtpSent ? 'Login' : 'Send OTP'}</Text>
        )}
      </TouchableOpacity>

      {isOtpSent && (
        <TouchableOpacity onPress={handleRequestOtp} disabled={loading || resendCooldownSeconds > 0}>
          <Text style={[styles.secondaryLinkText, (loading || resendCooldownSeconds > 0) && styles.disabledLinkText]}>
            {resendCooldownSeconds > 0 ? `Resend OTP in ${resendCooldownSeconds}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.replace('/register' as any)}>
        <Text style={styles.linkText}>Don&apos;t have an account? Register</Text>
      </TouchableOpacity>
      </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1D4ED8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#1D4ED8',
    textAlign: 'center',
    marginTop: 20,
  },
  secondaryLinkText: {
    color: '#1D4ED8',
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  disabledLinkText: {
    color: '#94A3B8',
  },
});
