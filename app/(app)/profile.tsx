import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, Card, ErrorState, Skeleton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { useFamilyMember } from '@/lib/api/hooks';

function initialsFrom(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function ProfileScreen() {
  const family = useFamilyMember();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {family.isLoading && !family.data ? (
        <View style={styles.stack}>
          <Skeleton width={72} height={72} radius={radii.pill} />
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
        </View>
      ) : family.isError && !family.data ? (
        <ErrorState onRetry={() => void family.refetch()} isRetrying={family.isRefetching} />
      ) : family.data ? (
        <View style={styles.stack}>
          <View style={styles.identity}>
            <Avatar
              initials={initialsFrom(family.data.name)}
              tint={colors.primarySoft}
              tintText={colors.primary}
              size={72}
            />
            <Text style={styles.name}>{family.data.name}</Text>
          </View>

          <Card>
            <Row icon="mail-outline" label="Email" value={family.data.email} />
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.textMuted} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stack: {
    gap: spacing.lg,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  name: {
    ...typography.section,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  rowLabel: {
    ...typography.caption,
  },
  rowValue: {
    ...typography.body,
  },
});
