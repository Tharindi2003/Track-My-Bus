// src/screens/auth/RegisterScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { registerParent } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { setProfile, setUser } = useAuth();

  const handleRegister = useCallback(async () => {
    if (!name || !email || !phone || !password)
      return Alert.alert('Error', 'Please fill in all fields');
    if (password !== confirm)
      return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      await registerParent(email.trim(), password, name, phone);
      Alert.alert('Success', 'Account created! You can now log in.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  }, [name, email, phone, password, confirm]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.busIcon}><Ionicons name="bus" size={40} color="#fff" /></View>
          <Text style={styles.appName}>Track My Bus</Text>
          <Text style={styles.sub}>Create Parent Account</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Full Name', value: name, setter: setName, icon: 'person-outline', autoCapitalize: 'words', keyboardType: 'default' },
            { label: 'Email Address', value: email, setter: setEmail, icon: 'mail-outline', autoCapitalize: 'none', keyboardType: 'email-address' },
            { label: 'Phone Number', value: phone, setter: setPhone, icon: 'call-outline', autoCapitalize: 'none', keyboardType: 'phone-pad' },
            { label: 'Password', value: password, setter: setPassword, icon: 'lock-closed-outline', autoCapitalize: 'none', secure: true },
            { label: 'Confirm Password', value: confirm, setter: setConfirm, icon: 'lock-closed-outline', autoCapitalize: 'none', secure: true },
          ].map((f) => (
            <View key={f.label} style={styles.inputWrap}>
              <Ionicons name={f.icon} size={20} color={COLORS.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={f.label}
                placeholderTextColor={COLORS.textLight}
                value={f.value}
                onChangeText={f.setter}
                autoCapitalize={f.autoCapitalize}
                keyboardType={f.keyboardType || 'default'}
                secureTextEntry={f.secure || false}
                autoCorrect={false}
                blurOnSubmit={false}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrap}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  back: { padding: 20, paddingBottom: 0 },
  header: { alignItems: 'center', padding: 20 },
  busIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 24, margin: 16, padding: 24, marginBottom: 40 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, paddingVertical: 12 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkWrap: { alignItems: 'center', marginTop: 14 },
  link: { color: COLORS.textLight, fontSize: 14 },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});