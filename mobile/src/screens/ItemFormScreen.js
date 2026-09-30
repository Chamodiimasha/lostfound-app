import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { errMsg } from '../api';
import { Btn, Field, s, colors } from '../ui';

const CATEGORIES = ['Electronics', 'Documents', 'Bags', 'Keys', 'Clothing', 'Other'];
const TYPES = ['Lost', 'Found'];

const Chips = ({ options, value, onChange }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
    {options.map((o) => (
      <TouchableOpacity key={o} onPress={() => onChange(o)}
        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: value === o ? colors.primary : '#e5e7eb' }}>
        <Text style={{ color: value === o ? '#fff' : '#111827' }}>{o}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function ItemFormScreen({ route, navigation }) {
  const editing = route.params?.item;
  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [location, setLocation] = useState(editing?.location || '');
  const [category, setCategory] = useState(editing?.category || 'Other');
  const [type, setType] = useState(editing?.type || 'Lost');
  const [image, setImage] = useState(null); // newly picked image
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Allow photo access to attach a picture.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled) setImage(res.assets[0]);
  };

  const submit = async () => {
    const e = {};
    if (title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (!location.trim()) e.location = 'Location is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    const form = new FormData();
    Object.entries({ title, description, location, category, type }).forEach(([k, v]) => form.append(k, v));
    if (image) {
      const ext = (image.uri.split('.').pop() || 'jpg').toLowerCase();
      form.append('image', { uri: image.uri, name: `photo.${ext}`, type: image.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}` });
    }
    setBusy(true);
    try {
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) await api.put(`/items/${editing._id}`, form, cfg);
      else await api.post('/items', form, cfg);
      navigation.goBack();
    } catch (err) { Alert.alert('Could not save', errMsg(err)); setBusy(false); }
  };

  const preview = image?.uri || editing?.image;

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
      <Field label="Title" value={title} onChangeText={setTitle} error={errors.title} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline error={errors.description} />
      <Field label="Location" value={location} onChangeText={setLocation} error={errors.location} />
      <Text style={s.label}>Type</Text><Chips options={TYPES} value={type} onChange={setType} />
      <Text style={s.label}>Category</Text><Chips options={CATEGORIES} value={category} onChange={setCategory} />
      {preview ? <Image source={{ uri: preview }} style={{ width: '100%', height: 180, borderRadius: 10, marginBottom: 8 }} /> : null}
      <Btn title={preview ? 'Change photo' : 'Add photo'} color={colors.grey} onPress={pick} />
      <Btn title={busy ? 'Saving...' : editing ? 'Save changes' : 'Report item'} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}
