import { StyleSheet, Text, View } from 'react-native';

import { radii } from '@/constants/tokens';

// Initials avatar on a warm token tint (no external images). Shared by the setup
// wizard's persona cards and the Home elder card so the companion looks identical
// everywhere. Size drives the initials scale.
type AvatarProps = {
  initials: string;
  tint: string;
  tintText: string;
  size?: number;
};

export function Avatar({ initials, tint, tintText, size = 56 }: AvatarProps) {
  return (
    <View
      style={[styles.avatar, { width: size, height: size, backgroundColor: tint }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.text, { color: tintText, fontSize: Math.round(size * 0.36) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
