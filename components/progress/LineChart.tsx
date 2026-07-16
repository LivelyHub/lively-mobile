import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors, typography } from '@/constants/tokens';

// Hand-rolled line/area chart on react-native-svg primitives (no chart library).
// The caller measures its container and passes `width`; the chart never hardcodes
// a pixel width, so it fits a narrow phone without overflow. Colors are tokens.
type LineChartProps = {
  values: number[];
  width: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fillColor?: string;
  baselineColor?: string;
  showArea?: boolean;
  showDots?: boolean;
  dotLabels?: string[]; // small value labels above each point (e.g. reps)
  yMin?: number;
  yMax?: number; // omit to auto-scale with headroom above the tallest point
};

export function LineChart({
  values,
  width,
  height = 160,
  strokeWidth = 3,
  color = colors.primary,
  fillColor = colors.primarySoft,
  baselineColor = colors.hairline,
  showArea = true,
  showDots = true,
  dotLabels,
  yMin = 0,
  yMax,
}: LineChartProps) {
  const hasLabels = Boolean(dotLabels && dotLabels.length);
  const padX = 14;
  const padTop = hasLabels ? 22 : 12;
  const padBottom = 12;

  // Container not measured yet: reserve height so there is no layout shift.
  if (width <= 0 || values.length === 0) {
    return <View style={{ height }} />;
  }

  const innerW = Math.max(width - padX * 2, 1);
  const innerH = Math.max(height - padTop - padBottom, 1);
  const dataMax = Math.max(...values);
  const top = yMax ?? Math.max(dataMax * 1.15, yMin + 1);
  const span = Math.max(top - yMin, 1);

  const x = (i: number) =>
    values.length === 1 ? padX + innerW / 2 : padX + (i / (values.length - 1)) * innerW;
  const y = (v: number) => padTop + innerH - ((v - yMin) / span) * innerH;

  const linePath = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`)
    .join(' ');

  const baselineY = padTop + innerH;
  const areaPath =
    `${linePath} L ${x(values.length - 1).toFixed(2)} ${baselineY.toFixed(2)}` +
    ` L ${x(0).toFixed(2)} ${baselineY.toFixed(2)} Z`;

  return (
    <Svg width={width} height={height}>
      <Line x1={padX} y1={baselineY} x2={padX + innerW} y2={baselineY} stroke={baselineColor} strokeWidth={1} />
      {showArea && values.length > 1 ? <Path d={areaPath} fill={fillColor} /> : null}
      <Path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showDots
        ? values.map((v, i) => (
            <Circle key={`dot-${i}`} cx={x(i)} cy={y(v)} r={strokeWidth + 1.5} fill={color} />
          ))
        : null}
      {hasLabels
        ? values.map((v, i) => (
            <SvgText
              key={`label-${i}`}
              x={x(i)}
              y={y(v) - 10}
              fontSize={typography.caption.fontSize}
              fontWeight="700"
              fill={colors.text}
              textAnchor="middle"
            >
              {dotLabels?.[i] ?? ''}
            </SvgText>
          ))
        : null}
    </Svg>
  );
}
