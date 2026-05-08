import * as Notifications from 'expo-notifications';
import { getLastCheckInTime } from '../storage/checkins';
import { getLastEntryTime } from '../storage/entries';

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleInactivityNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const lastCheckin = await getLastCheckInTime();
  const lastEntry = await getLastEntryTime();

  const now = new Date();
  const TWENTY_HOURS = 20 * 60 * 60 * 1000;

  const lastActivity = (() => {
    if (!lastCheckin && !lastEntry) return null;
    if (!lastCheckin) return lastEntry;
    if (!lastEntry) return lastCheckin;
    return lastCheckin > lastEntry ? lastCheckin : lastEntry;
  })();

  const timeSinceLast = lastActivity
    ? now.getTime() - lastActivity.getTime()
    : TWENTY_HOURS + 1;

  const delaySecs = timeSinceLast >= TWENTY_HOURS
    ? 1
    : Math.floor((TWENTY_HOURS - timeSinceLast) / 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "check in with yourself today.",
      body: "it's been a while. how are you feeling?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, delaySecs),
      repeats: false,
    },
  });
}