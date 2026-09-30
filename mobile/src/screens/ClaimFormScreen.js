import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import api, { errMsg } from '../api';
import { Btn, Field, s } from '../ui';

// Used for both creating (params.itemId) and editing (params.claim) a claim
export default function ClaimFormScreen({ route, navigation }) {
  const { itemId, claim } = route.params;
  const [message, setMessage] = useState(claim?.message || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (message.trim().length < 5) return setError('Message must be at least 5 characters');
    setError('');
    setBusy(true);
    try {
      if (claim) await api.put(`/claims/${claim._id}`, { message });
      else await api.post('/claims', { itemId, message });
      navigation.goBack();
    } catch (e) { Alert.alert('Could not save claim', errMsg(e)); setBusy(false); }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
      <Field label="How can you prove this is yours?" value={message} onChangeText={setMessage}
        multiline placeholder="Describe unique marks, contents, serial number..." error={error} />
      <Btn title={busy ? 'Saving...' : claim ? 'Update claim' : 'Submit claim'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
