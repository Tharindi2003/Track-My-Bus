// src/screens/admin/AdminProfile.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';

export default function AdminProfile() {
  const { profile, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>ADMINISTRATOR</Text>
        </View>
      </View>
      <View style={styles.infoCard}>
        {[
          { icon: 'mail', label: 'Email', value: profile?.email },
          { icon: 'call', label: 'Phone', value: profile?.phoneNumber || 'Not set' },
        ].map(item => (
          <View key={item.label} style={styles.infoRow}>
            <Ionicons name={item.icon + '-outline'} size={20} color={COLORS.adminColor} />
            <View>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.adminColor, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  avatarSection: { alignItems: 'center', padding: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.adminColor, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  roleBadge: { marginTop: 6, backgroundColor: COLORS.adminColor + '22', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  roleBadgeText: { color: COLORS.adminColor, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  infoCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 20, gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoLabel: { fontSize: 12, color: COLORS.textLight },
  infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 20, backgroundColor: COLORS.danger + '15', borderRadius: 14, paddingVertical: 14 },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});