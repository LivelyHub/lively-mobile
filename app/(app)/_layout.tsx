import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="setup-wizard"
        options={{ presentation: 'modal', headerShown: true, title: 'Tambah Eyang' }}
      />
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
        name="gallery"
        options={{ headerShown: true, title: 'Component Gallery' }}
      />
    </Stack>
  );
}
