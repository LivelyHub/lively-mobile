import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Push registration helpers (M8.1). All functions are safe to call on web and on
// simulators — they no-op rather than throw, so the caller never needs to guard
// platform. The app stays fully functional via polling regardless of push state.

export type PushPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

const SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

// Foreground behavior: show the banner + play sound even while the app is open,
// so a demo-day alert is visible without backgrounding the app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('alerts', {
    name: 'Peringatan',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#B8543A',
  });
}

export async function getPushPermission(): Promise<PushPermission> {
  if (!SUPPORTED) return 'unsupported';
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'unsupported';
  }
}

// Prompt only if not already decided. Returns the resulting permission so the
// caller can register a token on 'granted' or surface the banner on 'denied'.
export async function requestPushPermission(): Promise<PushPermission> {
  if (!SUPPORTED) return 'unsupported';
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (existing.status !== 'granted' && existing.canAskAgain) {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status === 'granted') {
      await ensureAndroidChannel();
      return 'granted';
    }
    return status === 'denied' ? 'denied' : 'undetermined';
  } catch {
    return 'unsupported';
  }
}

// The Expo push token, or null when unavailable (web, simulator, or no project
// id configured). Callers PATCH it to /family-members/me when non-null.
export async function getExpoPushToken(): Promise<string | null> {
  if (!SUPPORTED || !Device.isDevice) return null;
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

// Pull the alert id a push carries so a tap can deep-link into the detail screen.
export function alertIdFromResponse(
  response: Notifications.NotificationResponse | null | undefined,
): string | null {
  const data = response?.notification.request.content.data as { alert_id?: unknown } | undefined;
  return typeof data?.alert_id === 'string' ? data.alert_id : null;
}
