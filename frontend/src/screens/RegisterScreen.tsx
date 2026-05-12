import React, { useState } from 'react';
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
import { styles } from './RegisterScreen.styles';

export default function RegisterScreen() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isWideWeb = isWeb && width >= 1024;
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'seafarer' | 'official'>('seafarer');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Push token will be registered after successful registration

  const handleRequestOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || !role) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await authService.register({ name: name.trim(), email: normalizedEmail, mobile, role });
      setEmail(normalizedEmail);
      setOtp('');
      setIsOtpSent(true);
      Alert.alert('Success', 'OTP sent to your email');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verifyOtp(email, trimmedOtp, mobile);
      if (response.token) {
        await appStorage.setItem('authToken', response.token);
        await appStorage.setItem('userRole', role);
        
        // Register push token after successful registration
        await registerPushToken();
        
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'notifications' }] }));
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
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
                <Text style={styles.webHeroEyebrow}>Account onboarding</Text>
                <Text style={styles.webHeroTitle}>Create access for the right grievance workflow.</Text>
                <Text style={styles.webHeroBody}>
                  Register once, verify by OTP, and step into a browser layout that feels closer to a case portal than a handset screen.
                </Text>
                <View style={styles.webFeatureList}>
                  <Text style={styles.webFeatureItem}>Seafarers receive case updates and document requests</Text>
                  <Text style={styles.webFeatureItem}>Officials receive reviews, escalations, and hearing reminders</Text>
                  <Text style={styles.webFeatureItem}>The same flow still works cleanly in Expo Go on iPhone</Text>
                </View>
              </View>
            )}

            <View style={[styles.formCard, isWideWeb && styles.formCardWeb]}>
              <Text style={[styles.eyebrow, isWideWeb && styles.eyebrowWeb]}>Maritime Grievance Portal</Text>
              <Text style={[styles.title, isWideWeb && styles.titleWeb]}>Create account</Text>
              <Text style={[styles.subtitle, isWideWeb && styles.subtitleWeb]}>
                Register to receive grievance status updates and official notices.
              </Text>

              <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="#6B7280" value={name} onChangeText={setName} editable={!isOtpSent} />
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
              <TextInput
                style={styles.input}
                placeholder="Mobile Number (optional)"
                placeholderTextColor="#6B7280"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                editable={!isOtpSent}
              />

              <View style={styles.roleContainer}>
                <Text style={styles.label}>Role: *</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity style={[styles.roleButton, role === 'seafarer' && styles.roleButtonActive]} onPress={() => setRole('seafarer')} disabled={isOtpSent}>
                    <Text style={[styles.roleButtonText, role === 'seafarer' && styles.roleButtonTextActive]}>Seafarer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.roleButton, role === 'official' && styles.roleButtonActive]} onPress={() => setRole('official')} disabled={isOtpSent}>
                    <Text style={[styles.roleButtonText, role === 'official' && styles.roleButtonTextActive]}>Official</Text>
                  </TouchableOpacity>
                </View>
              </View>

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

              <TouchableOpacity style={styles.button} onPress={isOtpSent ? handleRegister : handleRequestOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isOtpSent ? 'Register' : 'Send OTP'}</Text>}
              </TouchableOpacity>

              {isOtpSent && (
                <TouchableOpacity onPress={handleRequestOtp} disabled={loading}>
                  <Text style={styles.secondaryLinkText}>Resend OTP</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => router.replace('/login' as any)}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
