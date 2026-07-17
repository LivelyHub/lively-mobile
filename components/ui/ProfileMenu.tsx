import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import { clearToken } from '@/lib/auth/token';
import { queryClient } from '@/lib/query/queryClient';

import { Avatar } from './Avatar';

type ProfileMenuProps = {
  name?: string;
};

function initialsFrom(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function ProfileMenu({ name }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);

  const goTo = (path: '/profile' | '/settings') => {
    setOpen(false);
    router.push(path);
  };

  const signOut = async () => {
    setOpen(false);
    await clearToken();
    queryClient.clear();
    router.replace('/login');
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Menu profil"
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Avatar
          initials={initialsFrom(name)}
          tint={colors.primarySoft}
          tintText={colors.primary}
          size={40}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menuWrap}>
            <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
              <MenuItem icon="person-outline" label="Lihat profil" onPress={() => goTo('/profile')} />
              <MenuItem icon="settings-outline" label="Pengaturan" onPress={() => goTo('/settings')} />
              <View style={styles.divider} />
              <MenuItem icon="log-out-outline" label="Keluar" onPress={signOut} danger />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.text} />
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  menuWrap: {
    position: 'absolute',
    top: spacing.xxl + spacing.lg,
    right: spacing.lg,
  },
  menu: {
    minWidth: 200,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.xs,
    ...shadow.card,
    shadowOpacity: 0.16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  itemPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  itemLabel: {
    ...typography.body,
  },
  itemLabelDanger: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: spacing.xs,
  },
});
