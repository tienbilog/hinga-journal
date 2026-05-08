import AsyncStorage from '@react-native-async-storage/async-storage';

export type CheckIn = {
  id: string;
  date: string;        // ISO string
  emotions: string[];  // what the user felt
  categoryChosen?: string; // if they started an entry after
};

const KEY = 'checkins';

export async function saveCheckIn(checkin: CheckIn): Promise<void> {
  const existing = await loadCheckIns();
  await AsyncStorage.setItem(KEY, JSON.stringify([checkin, ...existing]));
}

export async function loadCheckIns(): Promise<CheckIn[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function getLastCheckInTime(): Promise<Date | null> {
  const checkins = await loadCheckIns();
  if (checkins.length === 0) return null;
  return new Date(checkins[0].date);
}