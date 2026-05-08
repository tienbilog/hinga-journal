import AsyncStorage from '@react-native-async-storage/async-storage';

export type Category = {
  id: string;
  name: string;
  isDefault?: boolean;
};

const KEY = 'categories';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'journal', name: 'Journal', isDefault: true },
];

export async function loadCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
}

export async function addCategory(name: string): Promise<void> {
  const existing = await loadCategories();
  const newCat: Category = {
    id: Date.now().toString(),
    name,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([...existing, newCat]));
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await loadCategories();
  const updated = existing.filter(c => c.id !== id && c.isDefault !== true);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}