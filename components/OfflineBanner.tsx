import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui';
import { spacing } from '@/constants/tokens';
import { useIsOffline } from '@/hooks/useIsOffline';

const RECONNECTED_MESSAGE_MS = 2000;

// Mounted once in the (app) layout, above the navigator, so every screen gets
// it (UI-UX §2 offline row). Shows the persistent offline banner while NetInfo
// reports disconnected, then a brief "Terhubung kembali" on recovery.
export function OfflineBanner() {
  const isOffline = useIsOffline();
  const insets = useSafeAreaInsets();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(isOffline);

  useEffect(() => {
    if (wasOffline.current && !isOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), RECONNECTED_MESSAGE_MS);
      wasOffline.current = isOffline;
      return () => clearTimeout(timer);
    }
    wasOffline.current = isOffline;
  }, [isOffline]);

  if (!isOffline && !showReconnected) return null;

  return (
    <View style={{ paddingTop: insets.top, paddingHorizontal: spacing.lg, paddingBottom: spacing.xs }}>
      {isOffline ? (
        <Banner variant="offline" message="Tidak ada koneksi - menampilkan data terakhir" />
      ) : (
        <Banner variant="info" message="Terhubung kembali" />
      )}
    </View>
  );
}
