import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../src/services/auth';

export default function VerifyOtpScreen() {
  // Retrieve the email passed from the previous screen
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.subtitle}>No email provided. Please go back and register or login first.</Text>
        <Button title="Go to Login" onPress={() => router.replace('/login' as any)} />
      </View>
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
      <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code generated for {email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={__DEV__ ? 'Enter OTP (dev hint: 123456)' : 'Enter OTP'}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Verify Code" onPress={handleVerify} />
      )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 15, fontSize: 18, marginBottom: 20, textAlign: 'center',
    letterSpacing: 5
  },
});