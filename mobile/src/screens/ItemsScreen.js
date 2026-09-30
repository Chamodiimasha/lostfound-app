import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, Empty, Loading, s, statusColor, colors } from '../ui';

export default function ItemsScreen({ navigation }) {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <Text style={{ color: colors.danger, fontWeight: '600' }} onPress={logout}>Logout</Text>,
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => navigation.navigate('MyClaims')}>My Claims</Text>
          <Text style={{ color: colors.primary, fontWeight: '600' }} onPress={() => navigation.navigate('ItemForm')}>+ Report</Text>
        </View>
      ),
    });
  }, [navigation, logout]);

  const load = async (q = search) => {
    try {
      setError('');
      const { data } = await api.get('/items', { params: { search: q } });
      setItems(data);
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <Loading />;

  return (
    <View style={s.screen}>
      <TextInput style={[s.input, { margin: 12 }]} placeholder="Search items..." value={search}
        onChangeText={setSearch} onSubmitEditing={() => load(search)} returnKeyType="search" />
      {!!error && <Text style={[s.error, { marginHorizontal: 12 }]}>{error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        ListEmptyComponent={<Empty text="No items yet. Tap + Report to add one." />}
        contentContainerStyle={items.length ? {} : { flexGrow: 1 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => navigation.navigate('ItemDetail', { id: item._id })}>
            {item.image ? <Image source={{ uri: item.image }} style={{ width: 70, height: 70, borderRadius: 8, marginRight: 12 }} />
              : <View style={{ width: 70, height: 70, borderRadius: 8, marginRight: 12, backgroundColor: '#e5e7eb' }} />}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.title}</Text>
              <Text style={{ color: colors.grey }}>{item.type} · {item.category} · {item.location}</Text>
              <Badge text={item.status} color={statusColor(item.status)} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
