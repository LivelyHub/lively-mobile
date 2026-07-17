import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Card, Skeleton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { useConversation, useProgress } from '@/lib/api/hooks';
import type { Elder } from '@/lib/api/types';
import { companionMetaFromKey } from '@/lib/companions';
import { relativeTime } from '@/lib/time';
import { buildGlanceRows, lastHeardFrom } from './glance';
import { GlanceRow } from './GlanceRow';

// One card per elder. The elder payload has no companion name, last-message time,
// or daily rollup, so this card pulls the elder's conversation + progress and
// derives them. Each card owns its own queries, keeping hooks stable across a
// varying elder list.
export function ElderCard({ elder }: { elder: Elder }) {
  const companion = companionMetaFromKey(elder.companion_key);
  const conversation = useConversation(elder.id);
  const progress = useProgress(elder.id);

  const supportingLoading =
    (conversation.isLoading && !conversation.data) || (progress.isLoading && !progress.data);

  const lastHeard = conversation.data ? lastHeardFrom(conversation.data) : null;
  const glanceRows =
    conversation.data && progress.data
      ? buildGlanceRows(conversation.data, progress.data)
      : null;

  return (
    <Card>
      <View style={styles.header}>
        <Avatar initials={companion.initials} tint={companion.tint} tintText={companion.tintText} size={52} />
        <View style={styles.headerText}>
          <Text style={styles.honorific}>{elder.honorific}</Text>
          <Text style={styles.subline} numberOfLines={1}>
            {elder.name} · ditemani {companion.displayName}
          </Text>
        </View>
        {elder.paused ? (
          <View style={styles.pausedChip}>
            <Text style={styles.pausedText}>Dijeda</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.lastHeard}>
        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
        {supportingLoading ? (
          <Skeleton width={140} height={13} />
        ) : (
          <Text style={styles.lastHeardText}>
            {lastHeard ? `Terakhir mengobrol ${relativeTime(lastHeard)}` : 'Belum ada obrolan'}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {progress.data ? (
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progres minggu ini</Text>
            <Text style={styles.progressPct}>{progress.data.overall_progress_pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress.data.overall_progress_pct}%` }]}
            />
          </View>
          {progress.data.engagement_streak_days > 0 ? (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={16} color={colors.warning} />
              <Text style={styles.streakText}>
                {progress.data.engagement_streak_days} hari beruntun
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <Skeleton width={'100%'} height={44} radius={radii.sm} />
      )}

      <View style={styles.divider} />

      {glanceRows ? (
        <View>
          {glanceRows.map((row) => (
            <GlanceRow key={row.key} data={row} />
          ))}
        </View>
      ) : (
        <View style={styles.glanceSkeleton}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.glanceSkeletonRow}>
              <Skeleton width={20} height={20} radius={radii.sm} />
              <Skeleton width={'50%'} height={16} />
              <View style={styles.grow} />
              <Skeleton width={64} height={16} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  honorific: {
    ...typography.section,
  },
  subline: {
    ...typography.bodyMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  pausedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
  },
  pausedText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  lastHeard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  lastHeardText: {
    ...typography.caption,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: spacing.md,
  },
  glanceSkeleton: {
    gap: spacing.md,
  },
  glanceSkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  grow: {
    flex: 1,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  progressPct: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginTop: spacing.xs / 2,
  },
  streakText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
});
