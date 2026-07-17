import type { TextStyle, ViewStyle } from 'react-native';

// Design tokens (M0.2). Single source of truth for color, type, spacing, shape.
// Screens must never use ad-hoc hex or font sizes; consume these semantic names.
// Structured so dark mode is a palette swap: components read `colors.*`, never raw hex.

// Raw hex lives only here. Contrast ratios (WCAG) noted where a pair carries text:
//   text     #2E2A28 on background #FDFCFB = 13.5:1
//   textMuted #6E6560 on background #FDFCFB =  5.4:1  (on surface #FFFFFF = 5.7:1)
//   white     #FFFFFF on primary    #B8543A =  4.7:1  (button label)
//   primary   #B8543A on background #FDFCFB =  ~4.9:1
//   white     #FFFFFF on danger     #C4362B =  5.4:1
//   danger    #C4362B on background #FDFCFB =  5.0:1
//   warning   #8A5A0C on background #FDFCFB =  5.5:1
//   success   #2F7D4F on background #FDFCFB =  4.7:1  (white on success = 5.0:1)
//   white     #FFFFFF on tabBarBg  #241B16 = 15.8:1  (icon-only, decorative use)
const palette = {
  terracotta: '#B8543A',
  terracottaPressed: '#9C4630',
  terracottaSoft: '#F7E4DB',
  terracottaSoftPressed: '#EFD4C7',

  // "Clean white" reads as bright, not warm-cream: background carries only a
  // whisper of tint (never bare #FFF per design-law) and surfaces sit at true
  // white, separated by hairline + the single card shadow instead of a color step.
  paperWhite: '#FDFCFB',
  white: '#FFFFFF',
  surfaceMuted: '#F6F3EF', // tonal panel: header strip, quick-action tiles, chip rest state
  hairline: '#ECE7E1',
  border: '#E3DDD4',

  ink: '#2E2A28',
  inkMuted: '#6E6560',

  green: '#2F7D4F',
  greenSoft: '#E4F0E8',

  amber: '#8A5A0C',
  amberSoft: '#F6EAD5',

  red: '#C4362B',
  redPressed: '#A82D24',
  redSoft: '#F7DED9',

  shadowWarm: '#6B4A34',

  // Floating pill tab bar: near-black warm dark (not bare #000) so the one
  // dark surface in an otherwise white app still belongs to the terracotta family.
  tabBarBg: '#241B16',
  tabBarIconInactive: 'rgba(255, 255, 255, 0.5)',
};

export const colors = {
  primary: palette.terracotta,
  primaryPressed: palette.terracottaPressed,
  primarySoft: palette.terracottaSoft, // chips, tonal buttons, brand banners
  primarySoftPressed: palette.terracottaSoftPressed,
  textOnPrimary: palette.white,

  background: palette.paperWhite,
  surface: palette.white,
  surfaceMuted: palette.surfaceMuted,
  border: palette.border,
  hairline: palette.hairline,

  text: palette.ink,
  textMuted: palette.inkMuted,

  success: palette.green,
  successSoft: palette.greenSoft,

  warning: palette.amber,
  warningSoft: palette.amberSoft,

  danger: palette.red, // reserved exclusively for genuine alerts
  dangerPressed: palette.redPressed,
  dangerSoft: palette.redSoft,

  overlay: 'rgba(46, 42, 40, 0.45)',

  tabBarBg: palette.tabBarBg,
  tabBarIconActive: palette.white,
  tabBarIconInactive: palette.tabBarIconInactive,
  tabBarActiveDot: palette.terracotta,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  input: 12,
  button: 12,
  card: 16,
  bubble: 18,
  bubbleTail: 4,
  pill: 999,
} as const;

// Type scale: 28 title / 20 section / 16 body & button / 13 caption (timestamps only).
// System font (no font loading). Line-height >= 1.4 on reading text.
export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
  } as TextStyle,
  section: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: colors.text,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  } as TextStyle,
  bodyMuted: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.textMuted,
  } as TextStyle,
  caption: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.textMuted,
  } as TextStyle,
  // Button label sets its own color per variant; single-line, so tighter line-height.
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
} as const;

// One shadow level for cards: soft, subtle, slightly warm. Flat everywhere else.
export const shadow = {
  card: {
    shadowColor: palette.shadowWarm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadow,
} as const;

export type Theme = typeof theme;
