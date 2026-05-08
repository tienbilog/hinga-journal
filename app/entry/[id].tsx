import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteEntry, JournalEntry, loadEntries } from '../../storage/entries';

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    loadEntries().then(entries => {
      setEntry(entries.find(e => e.id === id) ?? null);
    });
  }, [id]);

  async function handleDelete() {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteEntry(id);
          router.back();
        }
      },
    ]);
  }

  if (!entry) return null;

  const date = new Date(entry.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ back</Text>
      </TouchableOpacity>

      <Text style={styles.date}>{date}</Text>

      {entry.photoUri && (
        <Image source={{ uri: entry.photoUri }} style={styles.photo} />
      )}

      <Text style={styles.body}>{entry.body}</Text>

      {entry.emotions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>feelings</Text>
          <View style={styles.tagRow}>
            {entry.emotions.map((e, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{e}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>delete entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6ee' },
  content: { padding: 24, paddingBottom: 60 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#c9a87c', fontWeight: '600' },
  date: { fontSize: 14, color: '#a89b8c', marginBottom: 20 },
  photo: { width: '100%', height: 240, borderRadius: 16, marginBottom: 24 },
  body: { fontSize: 16, color: '#4a3728', lineHeight: 26, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#a89b8c', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#e8d5c4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#4a3728', fontSize: 13 },
  deleteBtn: { marginTop: 16, padding: 16, alignItems: 'center' },
  deleteBtnText: { color: '#c9a87c', fontSize: 14 },
});