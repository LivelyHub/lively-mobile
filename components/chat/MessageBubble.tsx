import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';
import type { ConversationMessage } from '@/lib/api/types';
import { formatClock } from '@/lib/time';

// Elder (direction 'in') sits left on a neutral surface bubble; the companion
// (direction 'out') sits right on a brand-tinted bubble. Both use radius 18 with
// a 4pt tail on the near-bottom corner (bottom-left for the elder, bottom-right
// for the companion). A titipan is still a companion-side bubble (the companion
// relays it) but carries a "Titipan dari keluarga" label above it.
type MessageBubbleProps = {
  message: ConversationMessage;
  showTime: boolean;
  startsGroup: boolean;
};

export function MessageBubble({ message, showTime, startsGroup }: MessageBubbleProps) {
  const isCompanion = message.direction === 'out';
  const isTitipan = isCompanion && message.is_titipan === true;

  return (
    <View
      style={[
        styles.row,
        isCompanion ? styles.rowRight : styles.rowLeft,
        { marginTop: startsGroup ? spacing.sm : 2 },
      ]}
    >
      {isTitipan ? (
        <View style={styles.titipanLabel}>
          <Ionicons name="gift-outline" size={13} color={colors.primary} />
          <Text style={styles.titipanText}>Titipan dari keluarga</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.bubble,
          isCompanion ? styles.bubbleCompanion : styles.bubbleElder,
          isTitipan && styles.bubbleTitipan,
        ]}
      >
        <Text style={styles.body}>{message.body}</Text>
      </View>

      {showTime ? (
        <Text style={[styles.time, isCompanion ? styles.timeRight : styles.timeLeft]}>
          {formatClock(message.created_at)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    maxWidth: '78%',
  },
  rowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  rowRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.bubble,
  },
  bubbleElder: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderBottomLeftRadius: radii.bubbleTail,
  },
  bubbleCompanion: {
    backgroundColor: colors.primarySoft,
    borderBottomRightRadius: radii.bubbleTail,
  },
  bubbleTitipan: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  body: {
    ...typography.body,
  },
  titipanLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  titipanText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  time: {
    ...typography.caption,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  timeLeft: {
    textAlign: 'left',
  },
  timeRight: {
    textAlign: 'right',
  },
});
