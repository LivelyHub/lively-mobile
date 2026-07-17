import { Tabs } from 'expo-router';

import { TabBar } from '@/components/ui';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="chat" options={{ title: 'Obrolan' }} />
      <Tabs.Screen name="progress" options={{ title: 'Perkembangan' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Peringatan' }} />
    </Tabs>
  );
}
