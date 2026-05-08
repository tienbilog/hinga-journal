import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { JournalEntry } from '../storage/entries';

type Props = {
  entry: JournalEntry;
  onPress: () => void;
};

export default function EntryCard({ entry, onPress }: Props) {
  const date = new Date(entry.date);
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {entry.photoUri ? (
        <Image source={{ uri: entry.photoUri }} style={styles.photo} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.date}>{formatted}</Text>
        <Text style={styles.body} numberOfLines={3}>{entry.body}</Text>
        <View style={styles.tagRow}>
          {entry.emotions.map((e, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{e}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8d5c4',
  },
  photo: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: '#a89b8c',
    marginBottom: 6,
  },
  body: {
    fontSize: 15,
    color: '#4a3728',
    lineHeight: 22,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f5ebe0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#7a6255',
  },
});