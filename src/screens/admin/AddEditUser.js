// src/screens/admin/AddEditUser.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/theme';
import { createUser, updateUser } from '../../services/adminService';

export default function AddEditUser({ navigation, route }) {
  const { role, user: existing } = route.params || {};
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name || '',
    email: existing?.email || '',
    phone: existing?.phoneNumber || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  function update(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.name || !form.email) return Alert.alert('Error', 'Name and email are required');
    if (!isEdit && !form.password) return Alert.alert('Error', 'Password is required for new accounts');

    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(existing.userId, { name: form.name, phoneNumber: form.phone });
        Alert.alert('Success', 'User updated');
      } else {
        await createUser(form.email.trim(), form.password, form.name, form.phone, role);
        Alert.alert('Success', `${role === 'ADMIN' ? 'Admin' : 'Driver'} account created`);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  const roleColor = role === 'ADMIN' ? COLORS.adminColor : COLORS.driverColor;
  const roleLabel = role === 'ADMIN' ? 'Admin' : 'Driver';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: roleColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? `Edit ${roleLabel}` : `New ${roleLabel} Account`}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={[styles.roleTag, { backgroundColor: roleColor + '22' }]}>
          <Ionicons name={role === 'ADMIN' ? 'shield-checkmark' : 'bus'} size={18} color={roleColor} />
          <Text style={[styles.roleTagText, { color: roleColor }]}>Role: {role}</Text>
        </View>

        {[
          { label: 'Full Name *', field: 'name', placeholder: 'Enter full name', autoCapitalize: 'words' },
          { label: 'Email *', field: 'email', placeholder: 'Enter email', keyboardType: 'email-address', autoCapitalize: 'none', editable: !isEdit },
          { label: 'Phone', field: 'phone', placeholder: 'Enter phone number', keyboardType: 'phone-pad' },
          ...(!isEdit ? [{ label: 'Password *', field: 'password', placeholder: 'Min 6 characters', secureTextEntry: true }] : []),
        ].map(f => (
          <View key={f.field} style={styles.fieldWrap}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={[styles.input, f.editable === false && styles.disabled]}
              value={form[f.field]}
              onChangeText={v => update(f.field, v)}
              placeholderTextColor={COLORS.textLight}
              editable={f.editable !== false}
              {...f}
            />
          </View>
        ))}

        {!isEdit && (
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.noteText}>
              Share these credentials with the {roleLabel.toLowerCase()} so they can log in to the app.
            </Text>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: roleColor }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Update' : `Create ${roleLabel}`}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  form: { padding: 20 },
  roleTag: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 20 },
  roleTagText: { fontWeight: '700', fontSize: 14 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  disabled: { backgroundColor: COLORS.bg, color: COLORS.textLight },
  noteCard: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.primary + '11', borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
