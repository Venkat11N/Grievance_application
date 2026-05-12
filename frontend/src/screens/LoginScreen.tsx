import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { authService } from '../services/auth';
import { appStorage } from '../services/storage';
import { registerPushToken } from '../hooks/usePushToken';
import { styles } from './LoginScreen.styles';

export default function LoginScreen() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isWideWeb = isWeb && width >= 1024;
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);

  // Push token will be registered after successful login

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return undefined;
    const timer = setInterval(() => setResendCooldownSeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
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
        await appStorage.setItem('authToken', response.token);
        await appStorage.setItem('userRole', response.user.role);
        
        // Register push token after successful login
        await registerPushToken();
        
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={[styles.container, isWideWeb && styles.webContainer]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.authShell, isWideWeb && styles.authShellWeb]}>
            {isWideWeb && (
              <View style={styles.webHero}>
                <Text style={styles.webHeroEyebrow}>Maritime grievance operations</Text>
                <Text style={styles.webHeroTitle}>A browser-ready desk for grievance follow-up.</Text>
                <Text style={styles.webHeroBody}>
                  Sign in to review wage disputes, official notices, document requests, and port escalation updates from a layout built for desktop use.
                </Text>
                <View style={styles.webFeatureList}>
                  <Text style={styles.webFeatureItem}>Role-based inboxes for seafarers and officials</Text>
                  <Text style={styles.webFeatureItem}>OTP access without password resets or lockouts</Text>
                  <Text style={styles.webFeatureItem}>A wider workspace for reading notifications comfortably</Text>
                </View>
              </View>
            )}

            <View style={[styles.formCard, isWideWeb && styles.formCardWeb]}>
              <Text style={[styles.eyebrow, isWideWeb && styles.eyebrowWeb]}>Maritime Grievance Portal</Text>
              <Text style={[styles.title, isWideWeb && styles.titleWeb]}>Login</Text>
              <Text style={[styles.subtitle, isWideWeb && styles.subtitleWeb]}>Receive a secure OTP to access grievance updates.</Text>

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

              <TouchableOpacity style={styles.button} onPress={isOtpSent ? handleLogin : handleRequestOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isOtpSent ? 'Login' : 'Send OTP'}</Text>}
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
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
