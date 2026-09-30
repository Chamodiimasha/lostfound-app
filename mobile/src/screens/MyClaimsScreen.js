import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { Badge, Btn, Empty, Loading, s, statusColor, colors } from '../ui';

export default function MyClaimsScreen({ navigation }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try { setError(''); const { data } = await api.get('/claims/mine'); setClaims(data); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, []));

  const act = async (fn) => { try { await fn(); await load(); } catch (e) { Alert.alert('Error', errMsg(e)); } };

  if (loading) return <Loading />;
  return (
    <View style={s.screen}>
      {!!error && <Text style={[s.error, { margin: 12 }]}>{error}</Text>}
      <FlatList
        data={claims}
        keyExtractor={(c) => c._id}
        contentContainerStyle={claims.length ? {} : { flexGrow: 1 }}
        ListEmptyComponent={<Empty text="You have not claimed anything yet." />}
        renderItem={({ item: c }) => (
          <View style={[s.card, { flexDirection: 'column' }]}>
            <Text style={{ fontWeight: '700', fontSize: 16 }} onPress={() => navigation.navigate('ItemDetail', { id: c.item._id })}>
              {c.item.title}
            </Text>
            <Text style={{ marginVertical: 6 }}>{c.message}</Text>
            <Badge text={c.status} color={statusColor(c.status)} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {c.status === 'Pending' && <Btn small title="Edit" onPress={() => navigation.navigate('ClaimForm', { claim: c })} />}
              {['Pending', 'Approved'].includes(c.status) &&
                <Btn small title="Cancel" color={colors.grey} onPress={() => act(() => api.patch(`/claims/${c._id}/cancel`))} />}
              {['Rejected', 'Cancelled'].includes(c.status) &&
                <Btn small title="Delete" color={colors.danger} onPress={() => act(() => api.delete(`/claims/${c._id}`))} />}
            </View>
          </View>
        )}
      />
    </View>
  );
}
