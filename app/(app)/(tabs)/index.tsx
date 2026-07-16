import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/tokens';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beranda</Text>
      {__DEV__ ? (
        <Link href="/gallery" asChild>
          <Pressable
            style={({ pressed }) => [styles.devLink, pressed && styles.devLinkPressed]}
          >
            <Text style={styles.devLinkText}>Buka Component Gallery (dev)</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.section,
  },
  devLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  devLinkText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  devLinkPressed: {
    opacity: 0.6,
  },
});
