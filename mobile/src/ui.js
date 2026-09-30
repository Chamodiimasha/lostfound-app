import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';

export const colors = { primary: '#2563eb', danger: '#dc2626', ok: '#16a34a', grey: '#6b7280', bg: '#f3f4f6' };

export const Loading = () => (
  <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>
);

export const Empty = ({ text }) => (
  <View style={s.center}><Text style={{ color: colors.grey, fontSize: 16 }}>{text}</Text></View>
);

export const Field = ({ label, error, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput style={[s.input, error && { borderColor: colors.danger }]} placeholderTextColor="#9ca3af" {...props} />
    {!!error && <Text style={s.error}>{error}</Text>}
  </View>
);

export const Btn = ({ title, onPress, color = colors.primary, disabled, small }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled}
    style={[s.btn, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }, small && { paddingVertical: 8, paddingHorizontal: 12 }]}>
    <Text style={s.btnText}>{title}</Text>
  </TouchableOpacity>
);

export const Badge = ({ text, color }) => (
  <Text style={[s.badge, { backgroundColor: color }]}>{text}</Text>
);

export const statusColor = (st) =>
  ({ Open: colors.primary, Returned: colors.ok, Pending: '#d97706', Approved: colors.ok, Rejected: colors.danger, Cancelled: colors.grey }[st] || colors.grey);

export const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontWeight: '600', marginBottom: 4, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  error: { color: colors.danger, marginTop: 4, fontSize: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', marginVertical: 4 },
  btnText: { color: '#fff', fontWeight: '700' },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontSize: 12, overflow: 'hidden', alignSelf: 'flex-start' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginHorizontal: 12, marginVertical: 6, flexDirection: 'row' },
});
