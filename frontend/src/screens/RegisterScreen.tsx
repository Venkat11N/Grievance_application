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
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/auth';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'seafarer' | 'official'>('seafarer');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayedOtp, setDisplayedOtp] = useState('');

  const handleRequestOtp = async () => {
    if (!name || !email || !role) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({ name, email, mobile, role });
      setIsOtpSent(true);
      const otpCode = response.devOtp || '';
      setDisplayedOtp(otpCode);
      if (otpCode) {
        Alert.alert('OTP Generated', `Email delivery is blocked on this network.\n\nYour OTP is: ${otpCode}`);
      } else {
        Alert.alert('Success', 'OTP sent to your email');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send OTP';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp, mobile);
      if (response.token) {
        await SecureStore.setItemAsync('authToken', response.token);
        await SecureStore.setItemAsync('userRole', role);
        router.replace('/notifications' as any);
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
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={name}
        onChangeText={setName}
        editable={!isOtpSent}
      />

      <TextInput
        style={styles.input}
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isOtpSent}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number (optional)"
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
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP *"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          {displayedOtp ? (
            <Text style={styles.otpCode}>
              Your OTP: {displayedOtp}
            </Text>
          ) : null}
        </>
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

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
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
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
  },
});
