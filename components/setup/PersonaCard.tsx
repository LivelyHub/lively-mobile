import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import type { Persona } from './config';

// Large, vertically-stacked persona card (M2.1 step 2). Selected card lifts with
// the one card shadow + a primary border + a check; unselected stays calm and flat.
// The greeting preview interpolates the honorific entered in step 1 inside a
// companion-styled chat bubble (radius 18, 4pt tail corner per tokens).

type PersonaCardProps = {
  persona: Persona;
  honorific: string;
  selected: boolean;
  onPress: () => void;
};

export function PersonaCard({ persona, honorific, selected, onPress }: PersonaCardProps) {
  const greetingName = honorific.trim() || 'Eyang';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Pilih ${persona.displayName}`}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Avatar initials={persona.initials} tint={persona.tint} tintText={persona.tintText} size={56} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{persona.displayName}</Text>
          <Text style={styles.personality}>{persona.personality}</Text>
        </View>
        <View style={[styles.checkRing, selected ? styles.checkRingOn : styles.checkRingOff]}>
          {selected ? <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} /> : null}
        </View>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{persona.greeting(greetingName)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.md,
  },
  cardIdle: {
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.primary,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  name: {
    ...typography.section,
  },
  personality: {
    ...typography.bodyMuted,
  },
  checkRing: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checkRingOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkRingOff: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.bubble,
    borderBottomLeftRadius: radii.bubbleTail,
  },
  bubbleText: {
    ...typography.body,
    color: colors.text,
  },
});
