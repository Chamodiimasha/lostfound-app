import React, { useCallback, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, Btn, Empty, Loading, s, statusColor, colors } from '../ui';

export default function ItemDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const { data } = await api.get(`/items/${id}`);
      setItem(data);
      if (data.reportedBy._id === user._id) {
        const res = await api.get(`/claims/item/${id}`);
        setClaims(res.data);
      }
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  };
  useFocusEffect(useCallback(() => { load(); }, [id]));

  const decide = async (claimId, status) => {
    try { await api.patch(`/claims/${claimId}/status`, { status }); await load(); }
    catch (e) { Alert.alert('Error', errMsg(e)); }
  };

  const remove = () => Alert.alert('Delete item?', 'This also deletes its claims.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/items/${id}`); navigation.goBack(); }
      catch (e) { Alert.alert('Error', errMsg(e)); }
    } },
  ]);

  if (loading) return <Loading />;
  if (!item) return <Empty text={error || 'Item not found'} />;
  const isOwner = item.reportedBy._id === user._id;

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
      {item.image ? <Image source={{ uri: item.image }} style={{ width: '100%', height: 220, borderRadius: 10, marginBottom: 12 }} /> : null}
      <Text style={{ fontSize: 22, fontWeight: '800' }}>{item.title}</Text>
      <Badge text={item.status} color={statusColor(item.status)} />
      <Text style={{ marginVertical: 8 }}>{item.description}</Text>
      <Text style={{ color: colors.grey }}>{item.type} · {item.category} · {item.location}</Text>
      <Text style={{ color: colors.grey, marginBottom: 12 }}>Reported by {item.reportedBy.name}</Text>

      {isOwner ? (
        <>
          <Btn title="Edit item" onPress={() => navigation.navigate('ItemForm', { item })} />
          <Btn title="Delete item" color={colors.danger} onPress={remove} />
          <Text style={{ fontSize: 18, fontWeight: '700', marginTop: 16 }}>Claims</Text>
          {claims.length === 0 && <Text style={{ color: colors.grey, marginTop: 8 }}>No claims yet.</Text>}
          {claims.map((c) => (
            <View key={c._id} style={[s.card, { marginHorizontal: 0, flexDirection: 'column' }]}>
              <Text style={{ fontWeight: '700' }}>{c.claimant.name} ({c.claimant.email})</Text>
              <Text style={{ marginVertical: 6 }}>{c.message}</Text>
              <Badge text={c.status} color={statusColor(c.status)} />
              {c.status === 'Pending' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <Btn small title="Approve" color={colors.ok} onPress={() => decide(c._id, 'Approved')} />
                  <Btn small title="Reject" color={colors.danger} onPress={() => decide(c._id, 'Rejected')} />
                </View>
              )}
            </View>
          ))}
        </>
      ) : item.status === 'Open' ? (
        <Btn title="This is mine - submit a claim" onPress={() => navigation.navigate('ClaimForm', { itemId: item._id })} />
      ) : (
        <Text style={{ color: colors.ok, fontWeight: '700' }}>This item has been returned to its owner.</Text>
      )}
    </ScrollView>
  );
}
