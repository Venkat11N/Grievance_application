import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'seafarer' | 'official'>('seafarer');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
      Alert.alert('Error', errorMsg);
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
        await SecureStore.setItemAsync('authToken', response.token);
        await SecureStore.setItemAsync('userRole', role);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'notifications' }],
          })
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
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
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register to receive grievance status updates and official notices.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        placeholderTextColor="#6B7280"
        value={name}
        onChangeText={setName}
        editable={!isOtpSent}
      />

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
          <TouchableOpacity
            style={[styles.roleButton, role === 'seafarer' && styles.roleButtonActive]}
            onPress={() => setRole('seafarer')}
            disabled={isOtpSent}
          >
            <Text style={[styles.roleButtonText, role === 'seafarer' && styles.roleButtonTextActive]}>
              Seafarer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'official' && styles.roleButtonActive]}
            onPress={() => setRole('official')}
            disabled={isOtpSent}
          >
            <Text style={[styles.roleButtonText, role === 'official' && styles.roleButtonTextActive]}>
              Official
            </Text>
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

      <TouchableOpacity
        style={styles.button}
        onPress={isOtpSent ? handleRegister : handleRequestOtp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isOtpSent ? 'Register' : 'Send OTP'}</Text>
        )}
      </TouchableOpacity>

      {isOtpSent && (
        <TouchableOpacity onPress={handleRequestOtp} disabled={loading}>
          <Text style={styles.secondaryLinkText}>Resend OTP</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.replace('/login' as any)}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
    marginBottom: 26,
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
  roleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#111827',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  roleButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
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
});
