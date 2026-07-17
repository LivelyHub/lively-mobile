import { Stack } from 'expo-router';
import { View } from 'react-native';

import { OfflineBanner } from '@/components/OfflineBanner';
import { usePushBootstrap } from '@/hooks/usePushRegistration';

export default function AppLayout() {
  usePushBootstrap();

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="setup-wizard"
          options={{ presentation: 'modal', headerShown: true, title: 'Tambah Eyang' }}
        />
        <Stack.Screen name="medications" options={{ headerShown: true, title: 'Kelola Obat' }} />
        <Stack.Screen
          name="medication-form"
          options={{ presentation: 'modal', headerShown: true, title: 'Obat' }}
        />
        <Stack.Screen
          name="titipan"
          options={{ presentation: 'modal', headerShown: true, title: 'Titipan' }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal', headerShown: true, title: 'Pengaturan' }}
        />
        <Stack.Screen
          name="alert/[id]"
          options={{ headerShown: true, title: 'Peringatan' }}
        />
        <Stack.Screen
          name="report"
          options={{ presentation: 'modal', headerShown: true, title: 'Ringkasan' }}
        />
        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', headerShown: true, title: 'Profil' }}
        />
      </Stack>
    </View>
  );
}
