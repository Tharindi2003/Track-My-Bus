// src/screens/admin/ManageParents.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { getUsersByRole, deleteUserProfile } from '../../services/adminService';

export default function ManageParents({ navigation }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getUsersByRole('PARENT');
    setParents(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function confirmDelete(user) {
    Alert.alert('Remove Parent', `Remove ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteUserProfile(user.userId); load(); } },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parents ({parents.length})</Text>
      </View>
      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : <FlatList
            data={parents}
            keyExtractor={i => i.userId}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.[0]}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                  <Text style={styles.phone}>{item.phoneNumber}</Text>
                  {item.assignedBusId ? <View style={styles.busBadge}><Text style={styles.busBadgeText}>Bus assigned</Text></View> : null}
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No parents registered yet</Text>}
          />
      }
    </View>
  );
}

const s = StyleSheet.create;
const styles = s({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.parentColor, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 13, color: COLORS.textLight },
  phone: { fontSize: 13, color: COLORS.textLight },
  busBadge: { marginTop: 4, backgroundColor: COLORS.accent + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  busBadgeText: { fontSize: 11, color: COLORS.accent, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
});
