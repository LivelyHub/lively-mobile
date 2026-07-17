import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';

import { useUpdateFamilyMember } from '@/lib/api/hooks';
import {
  alertIdFromResponse,
  getExpoPushToken,
  getPushPermission,
  requestPushPermission,
  type PushPermission,
} from '@/lib/push';

function openAlert(id: string | null) {
  if (id) router.push({ pathname: '/alert/[id]', params: { id } });
}

// App-level bootstrap, mounted once in (app)/_layout. On cold start it refreshes
// the push token if permission was already granted (BACKLOG M8.1 "re-check on app
// start"), and wires tap-to-open deep-linking for both the cold-start tap that
// launched the app and warm taps while it runs.
export function usePushBootstrap() {
  const updateFamily = useUpdateFamilyMember();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if ((await getPushPermission()) !== 'granted') return;
      const token = await getExpoPushToken();
      if (!cancelled && token) updateFamily.mutate({ push_token: token });
    })();
    return () => {
      cancelled = true;
    };
    // updateFamily is stable across renders; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Tap-to-open deep-linking has no web implementation (no OS notification
    // tray to tap from in a browser tab) — both calls throw there.
    if (Platform.OS === 'web') return;

    void Notifications.getLastNotificationResponseAsync().then((response) =>
      openAlert(alertIdFromResponse(response)),
    );
    const sub = Notifications.addNotificationResponseReceivedListener((response) =>
      openAlert(alertIdFromResponse(response)),
    );
    return () => sub.remove();
  }, []);
}

// Called after the setup wizard succeeds (BACKLOG M8.1 "ask after setup, not on
// app open"). Prompts once, and on grant PATCHes the Expo token to the family
// member. Returns the resulting permission so callers can proceed regardless.
export function useRequestPushPermission() {
  const updateFamily = useUpdateFamilyMember();
  return useCallback(async (): Promise<PushPermission> => {
    const perm = await requestPushPermission();
    if (perm === 'granted') {
      const token = await getExpoPushToken();
      if (token) updateFamily.mutate({ push_token: token });
    }
    return perm;
  }, [updateFamily]);
}

// Reads the current permission for the Alerts enable-notifications banner. Refreshes
// whenever `refreshKey` changes (e.g. screen focus) so returning from OS settings
// updates the banner.
export function usePushPermission(refreshKey?: unknown): PushPermission | null {
  const [permission, setPermission] = useState<PushPermission | null>(null);
  useEffect(() => {
    let cancelled = false;
    void getPushPermission().then((p) => {
      if (!cancelled) setPermission(p);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);
  return permission;
}
