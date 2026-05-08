import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import PhotoCapture from '../components/PhotoCapture';
import { Category, loadCategories } from '../storage/categories';
import { saveEntry } from '../storage/entries';

export default function NewEntryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [body, setBody] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [emotionInput, setEmotionInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId ?? 'journal');

  useFocusEffect(
    React.useCallback(() => {
      loadCategories().then(setCategories);
    }, [])
  );

  function addEmotion() {
    const trimmed = emotionInput.trim();
    if (!trimmed || emotions.length >= 5) return;
    setEmotions(prev => [...prev, trimmed]);
    setEmotionInput('');
  }

  async function handleSave() {
    if (!photoUri) {
      Alert.alert('Photo required', 'Please add a photo for this entry.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Entry is empty', 'Write something before saving.');
      return;
    }

    await saveEntry({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      categoryId: selectedCategoryId,
      body: body.trim(),
      emotions,
      photoUri,
    });

    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>new entry</Text>

        {/* Category picker */}
        <Text style={styles.label}>category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategoryId === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.catChipText, selectedCategoryId === cat.id && styles.catChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Photo */}
        <Text style={styles.label}>today's photo</Text>
        <PhotoCapture photoUri={photoUri} onPhoto={setPhotoUri} />

        {/* Body */}
        <Text style={styles.label}>what's on your mind?</Text>
        <TextInput
          style={styles.bodyInput}
          multiline
          placeholder="write your thoughts..."
          placeholderTextColor="#a89b8c"
          value={body}
          onChangeText={setBody}
          textAlignVertical="top"
        />

        {/* Emotions */}
        <Text style={styles.label}>emotions ({emotions.length}/5)</Text>
        <View style={styles.tagRow}>
          {emotions.map((e, i) => (
            <TouchableOpacity
              key={i}
              style={styles.tag}
              onPress={() => setEmotions(prev => prev.filter((_, j) => j !== i))}
            >
              <Text style={styles.tagText}>{e} ✕</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.emotionInput}
            placeholder="add emotion..."
            placeholderTextColor="#a89b8c"
            value={emotionInput}
            onChangeText={setEmotionInput}
            onSubmitEditing={addEmotion}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addEmotion}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>save entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6ee' },
  content: { padding: 24, paddingBottom: 60 },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#4a3728',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a89b8c',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
  },
  catRow: { flexDirection: 'row', marginBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5ebe0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e8d5c4',
  },
  catChipActive: { backgroundColor: '#4a3728', borderColor: '#4a3728' },
  catChipText: { color: '#7a6255', fontSize: 14 },
  catChipTextActive: { color: '#fdf6ee', fontWeight: '700' },
  bodyInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#4a3728',
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#e8d5c4',
    lineHeight: 22,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tag: {
    backgroundColor: '#e8d5c4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: '#4a3728', fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8 },
  emotionInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#4a3728',
    borderWidth: 1,
    borderColor: '#e8d5c4',
  },
  addBtn: {
    backgroundColor: '#c9a87c',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  saveBtn: {
    marginTop: 32,
    backgroundColor: '#4a3728',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fdf6ee', fontSize: 16, fontWeight: '700' },
});