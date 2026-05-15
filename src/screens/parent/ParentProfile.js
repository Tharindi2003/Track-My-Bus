// src/screens/parent/ParentProfile.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile, logout, changePassword } from '../../services/authService';

export default function ParentProfile() {
  const { profile, setProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name || '', phoneNumber: profile?.phoneNumber || '' });
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const updated = { ...profile, ...form };
      await updateProfile(profile.userId, updated);
      setProfile(updated);
      setEditing(false);
      Alert.alert('✅', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePass() {
    if (newPass.length < 6) return Alert.alert('Error', 'Min 6 characters');
    setLoading(true);
    try {
      await changePassword(newPass);
      setNewPass('');
      Alert.alert('✅', 'Password updated');
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

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>PARENT</Text></View>
      </View>

      <View style={styles.card}>
        {[
          { label: 'Full Name', field: 'name', icon: 'person' },
          { label: 'Phone', field: 'phoneNumber', icon: 'call', keyboardType: 'phone-pad' },
        ].map(f => (
          <View key={f.field} style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name={f.icon + '-outline'} size={18} color={COLORS.parentColor} />
              <Text style={styles.label}>{f.label}</Text>
            </View>
            {editing
              ? <TextInput style={styles.input} value={form[f.field]} onChangeText={v => setForm(p => ({ ...p, [f.field]: v }))} keyboardType={f.keyboardType} />
              : <Text style={styles.value}>{form[f.field] || '—'}</Text>
            }
          </View>
        ))}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="mail-outline" size={18} color={COLORS.parentColor} />
            <Text style={styles.label}>Email</Text>
          </View>
          <Text style={styles.value}>{profile?.email}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput style={styles.passInput} placeholder="New password" placeholderTextColor={COLORS.textLight} secureTextEntry value={newPass} onChangeText={setNewPass} />
        <TouchableOpacity style={styles.passBtn} onPress={handleChangePass} disabled={loading}>
          <Text style={styles.passBtnText}>Update Password</Text>
        </TouchableOpacity>
      </View>

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
  header: { backgroundColor: COLORS.parentColor, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  avatarSection: { alignItems: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.parentColor, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  roleBadge: { backgroundColor: COLORS.parentColor + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6 },
  roleText: { color: COLORS.parentColor, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  value: { fontSize: 14, color: COLORS.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  input: { fontSize: 14, color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: 4, minWidth: 140, textAlign: 'right' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  passInput: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  passBtn: { backgroundColor: COLORS.parentColor, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  passBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 16, marginBottom: 40, backgroundColor: COLORS.danger + '15', borderRadius: 14, paddingVertical: 14 },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
