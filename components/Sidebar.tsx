import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Category, addCategory, deleteCategory } from '../storage/categories';

type Props = {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCategoriesChanged: () => void;
};

export default function Sidebar({ categories, selectedId, onSelect, onCategoriesChanged }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await addCategory(trimmed);
    setNewName('');
    setShowInput(false);
    onCategoriesChanged();
  }

  async function handleDelete(cat: Category) {
    if (cat.isDefault) return;
    Alert.alert('Delete category?', `"${cat.name}" and its entries will remain but the category will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteCategory(cat.id);
          if (selectedId === cat.id) onSelect(null);
          onCategoriesChanged();
        }
      },
    ]);
  }

  return (
    <View style={styles.sidebar}>
      <Text style={styles.appTitle}>journal 🌿</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* All entries */}
        <TouchableOpacity
          style={[styles.item, selectedId === null && styles.itemActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.itemText, selectedId === null && styles.itemTextActive]}>
            all entries
          </Text>
        </TouchableOpacity>

        {/* Categories */}
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.item, selectedId === cat.id && styles.itemActive]}
            onPress={() => onSelect(cat.id)}
            onLongPress={() => handleDelete(cat)}
          >
            <Text style={[styles.itemText, selectedId === cat.id && styles.itemTextActive]}>
              {cat.name.toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Add category */}
        {showInput ? (
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="category name"
              placeholderTextColor="#a89b8c"
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={handleAdd}
              autoFocus
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleAdd} style={styles.confirmBtn}>
              <Text style={styles.confirmText}>add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowInput(true)}>
            <Text style={styles.addBtnText}>+ new category</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Calendar link */}
      <TouchableOpacity style={styles.calendarBtn} onPress={() => onSelect('__calendar__')}>
        <Text style={styles.calendarText}>📅 mood calendar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    backgroundColor: '#f5ebe0',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderRightWidth: 1,
    borderRightColor: '#e8d5c4',
    flex: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4a3728',
    marginBottom: 28,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: '#e8d5c4',
  },
  itemText: {
    fontSize: 15,
    color: '#7a6255',
  },
  itemTextActive: {
    color: '#4a3728',
    fontWeight: '700',
  },
  addBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addBtnText: {
    color: '#c9a87c',
    fontSize: 14,
    fontWeight: '600',
  },
  inputWrap: {
    marginTop: 12,
    gap: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#4a3728',
    borderWidth: 1,
    borderColor: '#e8d5c4',
  },
  confirmBtn: {
    backgroundColor: '#4a3728',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fdf6ee',
    fontWeight: '600',
    fontSize: 14,
  },
  calendarBtn: {
    marginTop: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#e8d5c4',
  },
  calendarText: {
    color: '#4a3728',
    fontSize: 14,
    fontWeight: '600',
  },
});