import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, typography } from '@/constants/tokens';

// A single calm progress ring in primary (CORE §7 overall_progress_pct). 0%
// renders as an empty-but-whole track, never an alarm. Fixed intrinsic size and
// centered, so it cannot overflow the screen.
type ProgressRingProps = {
  pct: number; // 0-100
  size?: number;
  strokeWidth?: number;
};

export function ProgressRing({ pct, size = 148, strokeWidth = 12 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.hairline} strokeWidth={strokeWidth} fill="none" />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>
          {clamped}
          <Text style={styles.unit}>%</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.title,
    color: colors.primary,
  },
  unit: {
    ...typography.section,
    color: colors.primary,
  },
});
