import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckInModal from '../components/CheckInModal';
import EntryCard from '../components/EntryCard';
import Sidebar from '../components/Sidebar';
import { requestNotificationPermission, scheduleInactivityNotification } from '../notifications/schedule';
import { Category, loadCategories } from '../storage/categories';
import { getLastCheckInTime } from '../storage/checkins';
import { JournalEntry, loadEntries } from '../storage/entries';
import CalendarScreen from './calendar';

const SIDEBAR_WIDTH = 200;

export default function HomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const appState = useRef(AppState.currentState);

  // Animated value: 0 = closed, 1 = open
  const sidebarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestNotificationPermission();
    loadData();
    checkIfShouldShowCheckin();

    const sub = AppState.addEventListener('change', nextState => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkIfShouldShowCheckin();
        loadData();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  function toggleSidebar(open: boolean) {
    setSidebarOpen(open);
    Animated.spring(sidebarAnim, {
      toValue: open ? 1 : 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  }

  async function loadData() {
    const [e, c] = await Promise.all([loadEntries(), loadCategories()]);
    setEntries(e);
    setCategories(c);
  }

  async function checkIfShouldShowCheckin() {
    const last = await getLastCheckInTime();
    if (!last) { setShowCheckin(true); return; }
    const hoursSince = (Date.now() - last.getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 1) setShowCheckin(true);
  }

  function handleCheckinDone(categoryChosen?: string) {
    setShowCheckin(false);
    scheduleInactivityNotification();
    if (categoryChosen) {
      router.push({ pathname: '/new-entry', params: { categoryId: categoryChosen } });
    }
    loadData();
  }

  function handleSelect(id: string | null) {
    setSelectedCategoryId(id);
    toggleSidebar(false);
  }

  const sidebarTranslate = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const overlayOpacity = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const filteredEntries = selectedCategoryId === '__calendar__'
    ? []
    : selectedCategoryId
      ? entries.filter(e => e.categoryId === selectedCategoryId)
      : entries;

  const currentCategoryName = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)?.name.toLowerCase() ?? 'entries'
    : 'all entries';

  return (
    <View style={styles.root}>
      <CheckInModal
        visible={showCheckin}
        categories={categories}
        onDone={handleCheckinDone}
      />

      {/* Main content */}
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => toggleSidebar(!sidebarOpen)} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>{sidebarOpen ? '✕' : '☰'}</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>{currentCategoryName}</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push({
              pathname: '/new-entry',
              params: { categoryId: selectedCategoryId ?? 'journal' }
            })}
          >
            <Text style={styles.newBtnText}>+ new</Text>
          </TouchableOpacity>
        </View>

        {selectedCategoryId === '__calendar__' ? (
          <CalendarScreen />
        ) : filteredEntries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📓</Text>
            <Text style={styles.emptyText}>no entries yet</Text>
            <Text style={styles.emptySub}>tap + new to write your first one</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntries}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <EntryCard
                entry={item}
                onPress={() => router.push({ pathname: '/entry/[id]', params: { id: item.id } })}
              />
            )}
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      {/* Dim overlay — tap to close sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
          pointerEvents={sidebarOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => toggleSidebar(false)} />
        </Animated.View>
      )}

      {/* Sidebar slides in over content */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslate }] }]}>
        <Sidebar
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleSelect}
          onCategoriesChanged={loadData}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fdf6ee' },
  main: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  menuBtn: { paddingRight: 12 },
  menuIcon: { fontSize: 20, color: '#4a3728' },
  heading: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: '#4a3728',
  },
  newBtn: {
    backgroundColor: '#4a3728',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  newBtnText: { color: '#fdf6ee', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#4a3728' },
  emptySub: { fontSize: 14, color: '#a89b8c' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 20,
  },
});