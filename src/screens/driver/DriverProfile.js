// src/screens/driver/DriverProfile.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, logout, changePassword } from '../../services/authService';

export default function DriverProfile() {
  const { profile, setProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    phoneNumber: profile?.phoneNumber || '',
    driverLicenseNumber: profile?.driverLicenseNumber || '',
  });
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const updated = { ...profile, ...form };
      await updateProfile(profile.userId, updated);
      setProfile(updated);
      setEditing(false);
      Alert.alert('✅', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    if (newPass.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await changePassword(newPass);
      setNewPass('');
      Alert.alert('✅', 'Password changed successfully');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={24} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="bus" size={36} color="#fff" />
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>BUS DRIVER</Text></View>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {/* Fields */}
      <View style={styles.card}>
        {[
          { label: 'Full Name', field: 'name', icon: 'person' },
          { label: 'Phone Number', field: 'phoneNumber', icon: 'call', keyboardType: 'phone-pad' },
          { label: 'License Number', field: 'driverLicenseNumber', icon: 'card' },
        ].map(f => (
          <View key={f.field} style={styles.fieldWrap}>
            <View style={styles.fieldHeader}>
              <Ionicons name={f.icon + '-outline'} size={16} color={COLORS.driverColor} />
              <Text style={styles.label}>{f.label}</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={form[f.field]}
                onChangeText={v => setForm(p => ({ ...p, [f.field]: v }))}
                keyboardType={f.keyboardType}
                placeholderTextColor={COLORS.textLight}
              />
            ) : (
              <Text style={styles.value}>{form[f.field] || '—'}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="New password (min 6 chars)"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
        />
        <TouchableOpacity style={styles.passBtn} onPress={handleChangePassword} disabled={loading}>
          <Text style={styles.passBtnText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ])}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.driverColor, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  avatarSection: { alignItems: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.driverColor, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  roleBadge: { backgroundColor: COLORS.driverColor + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  roleText: { color: COLORS.driverColor, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  email: { color: COLORS.textLight, marginTop: 6, fontSize: 13 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  value: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  input: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  passBtn: { backgroundColor: COLORS.driverColor, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  passBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 16, marginBottom: 40, backgroundColor: COLORS.danger + '15', borderRadius: 14, paddingVertical: 14 },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
