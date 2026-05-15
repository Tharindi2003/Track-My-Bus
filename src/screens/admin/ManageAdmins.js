// src/screens/admin/ManageAdmins.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { getUsersByRole, deleteUserProfile } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

export default function ManageAdmins({ navigation }) {
  const { profile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getUsersByRole('ADMIN');
    setAdmins(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admins</Text>
        <TouchableOpacity style={styles.addBtn}
          onPress={() => navigation.navigate('AddEditUser', { role: 'ADMIN' })}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Admin</Text>
        </TouchableOpacity>
      </View>
      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : <FlatList
            data={admins}
            keyExtractor={i => i.userId}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.avatar}><Ionicons name="shield-checkmark" size={22} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  {item.userId === profile?.userId && <Text style={styles.you}>(You)</Text>}
                </View>
                {item.userId !== profile?.userId && (
                  <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${item.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: async () => { await deleteUserProfile(item.userId); load(); } }
                  ])}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.adminColor, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textLight },
  you: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
});
