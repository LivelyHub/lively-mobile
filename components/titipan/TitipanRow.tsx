import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { spacing, typography } from '@/constants/tokens';
import type { TitipanMessage } from '@/lib/api/types';
import { relativeTime } from '@/lib/time';
import { StatusPill } from './StatusPill';

type TitipanRowProps = {
  message: TitipanMessage;
};

export function TitipanRow({ message }: TitipanRowProps) {
  return (
    <Card>
      <Text style={styles.body}>{message.body}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>{relativeTime(message.created_at)}</Text>
        <StatusPill deliveredAt={message.delivered_at} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    ...typography.body,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  time: {
    ...typography.caption,
    flexShrink: 1,
  },
});
