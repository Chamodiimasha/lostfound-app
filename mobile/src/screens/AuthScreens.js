import React, { useState } from 'react';
import { Alert, ScrollView, Text } from 'react-native';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';
import { Btn, Field, s, colors } from '../ui';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = {};
    if (!emailRe.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try { await login(email.trim(), password); }
    catch (err) { Alert.alert('Login failed', errMsg(err)); setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={s.screen}>
      <Text style={{ fontSize: 26, fontWeight: '800', marginVertical: 24 }}>Campus Lost & Found</Text>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Btn title={busy ? 'Signing in...' : 'Login'} onPress={submit} disabled={busy} />
      <Text style={{ textAlign: 'center', marginTop: 16, color: colors.primary }} onPress={() => navigation.navigate('Register')}>
        No account? Register
      </Text>
    </ScrollView>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = {};
    if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!emailRe.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try { await register(name.trim(), email.trim(), password); }
    catch (err) { Alert.alert('Registration failed', errMsg(err)); setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={s.screen}>
      <Field label="Name" value={name} onChangeText={setName} error={errors.name} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
      <Btn title={busy ? 'Creating...' : 'Create account'} onPress={submit} disabled={busy} />
      <Text style={{ textAlign: 'center', marginTop: 16, color: colors.primary }} onPress={() => navigation.goBack()}>
        Already registered? Login
      </Text>
    </ScrollView>
  );
}
