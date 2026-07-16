import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useIsOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
  }, []);

  return isOffline;
}
