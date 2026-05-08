import AsyncStorage from '@react-native-async-storage/async-storage';

export type JournalEntry = {
  id: string;
  date: string;
  categoryId: string;
  body: string;
  emotions: string[];
  photoUri: string;     // required
};

const KEY = 'journal_entries';

export async function saveEntry(entry: JournalEntry): Promise<void> {
  const existing = await loadEntries();
  const updated = [entry, ...existing];
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function loadEntries(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function loadEntriesByCategory(categoryId: string): Promise<JournalEntry[]> {
  const all = await loadEntries();
  return all.filter(e => e.categoryId === categoryId);
}

export async function deleteEntry(id: string): Promise<void> {
  const existing = await loadEntries();
  await AsyncStorage.setItem(KEY, JSON.stringify(existing.filter(e => e.id !== id)));
}

export async function getLastEntryTime(): Promise<Date | null> {
  const entries = await loadEntries();
  if (entries.length === 0) return null;
  return new Date(entries[0].date);
}