import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckIn, loadCheckIns } from '../storage/checkins';

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarScreen() {
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [selected, setSelected] = useState<CheckIn[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  useEffect(() => {
    loadCheckIns().then(setCheckins);
  }, []);

  function checkinsByDate(dateStr: string) {
    return checkins.filter(c => c.date.startsWith(dateStr));
  }

  function getDaysInMonth(m: number, y: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDay(m: number, y: number) {
    return new Date(y, m, 1).getDay();
  }

  function handleDayPress(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const found = checkinsByDate(dateStr);
    setSelectedDate(dateStr);
    setSelected(found.length > 0 ? found : null);
  }

  function dominantEmotion(dayCheckins: CheckIn[]) {
    if (dayCheckins.length === 0) return null;
    return dayCheckins[0].emotions[0] ?? null;
  }

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDay(month, year);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>mood calendar</Text>

      {/* Month nav */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={() => {
          if (month === 0) { setMonth(11); setYear(y => y - 1); }
          else setMonth(m => m - 1);
        }}>
          <Text style={styles.navBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={() => {
          if (month === 11) { setMonth(0); setYear(y => y + 1); }
          else setMonth(m => m + 1);
        }}>
          <Text style={styles.navBtn}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.grid}>
        {DAYS.map(d => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (!day) return <View key={`empty-${i}`} style={styles.cell} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayCheckins = checkinsByDate(dateStr);
          const hasCheckin = dayCheckins.length > 0;
          const emotion = dominantEmotion(dayCheckins);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === today.toISOString().split('T')[0];

          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.cell, isSelected && styles.cellSelected, isToday && styles.cellToday]}
              onPress={() => handleDayPress(day)}
            >
              <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{day}</Text>
              {hasCheckin && (
                <Text style={styles.dot}>●</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day emotions */}
      {selectedDate && (
        <View style={styles.detailBox}>
          <Text style={styles.detailDate}>{selectedDate}</Text>
          {selected ? (
            selected.map((c, i) => (
              <View key={i} style={styles.checkinRow}>
                <Text style={styles.checkinTime}>
                  {new Date(c.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={styles.tagRow}>
                  {c.emotions.map((e, j) => (
                    <View key={j} style={styles.tag}>
                      <Text style={styles.tagText}>{e}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCheckin}>no check-ins this day</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf6ee' },
  content: { padding: 24, paddingBottom: 60 },
  heading: { fontSize: 26, fontWeight: '800', color: '#4a3728', marginBottom: 24 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn: { fontSize: 28, color: '#4a3728', paddingHorizontal: 12 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#4a3728' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHeader: { width: '14.28%', textAlign: 'center', fontSize: 12, color: '#a89b8c', marginBottom: 8, fontWeight: '600' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  cellSelected: { backgroundColor: '#e8d5c4' },
  cellToday: { borderWidth: 1.5, borderColor: '#c9a87c' },
  dayNum: { fontSize: 14, color: '#4a3728' },
  dayNumToday: { fontWeight: '800', color: '#c9a87c' },
  dot: { fontSize: 8, color: '#c9a87c', marginTop: 1 },
  detailBox: { marginTop: 24, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e8d5c4' },
  detailDate: { fontSize: 14, fontWeight: '700', color: '#4a3728', marginBottom: 12 },
  checkinRow: { marginBottom: 12 },
  checkinTime: { fontSize: 12, color: '#a89b8c', marginBottom: 6 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#f5ebe0', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 13, color: '#7a6255' },
  noCheckin: { fontSize: 14, color: '#a89b8c' },
});