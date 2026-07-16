import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadow, spacing } from '@/constants/tokens';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing | number;
};

export function Card({ children, style, padding = 'lg' }: CardProps) {
  const pad = typeof padding === 'number' ? padding : spacing[padding];
  return <View style={[styles.card, { padding: pad }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...shadow.card,
  },
});
