---
name: Lively Mobile
description: The family app for a WhatsApp eldercare companion — warm, gamified, quietly credible.
colors:
  terracotta: "#B8543A"
  terracotta-pressed: "#9C4630"
  terracotta-soft: "#F7E4DB"
  terracotta-soft-pressed: "#EFD4C7"
  paper-white: "#FDFCFB"
  surface-white: "#FFFFFF"
  surface-muted: "#F6F3EF"
  hairline: "#ECE7E1"
  border: "#E3DDD4"
  tab-bar-bg: "#241B16"
  ink: "#2E2A28"
  ink-muted: "#6E6560"
  success-green: "#2F7D4F"
  success-green-soft: "#E4F0E8"
  warning-amber: "#8A5A0C"
  warning-amber-soft: "#F6EAD5"
  danger-red: "#C4362B"
  danger-red-pressed: "#A82D24"
  danger-red-soft: "#F7DED9"
  shadow-warm: "#6B4A34"
typography:
  title:
    fontFamily: "System"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "40px"
  section:
    fontFamily: "System"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "28px"
  body:
    fontFamily: "System"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  bodyMuted:
    fontFamily: "System"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  caption:
    fontFamily: "System"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  button:
    fontFamily: "System"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "20px"
rounded:
  sm: "8px"
  input: "12px"
  button: "12px"
  card: "16px"
  bubble: "18px"
  bubble-tail: "4px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  button-primary-pressed:
    backgroundColor: "{colors.terracotta-pressed}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.terracotta-soft}"
    textColor: "{colors.terracotta}"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Lively Mobile

## 1. Overview

**Creative North Star: "The Warm Check-In"**

Every screen should feel like a quick, caring glance at how Eyang (the parent) is doing today — never a clinical chart, never an audit of whether the family member did their job. The system stays close to native iOS conventions (system font, standard nav patterns, familiar tab bar) so it never feels like a foreign toy, but layers in Duolingo-style interactive gamification — streaks, progress rings, chair-test trend lines — so checking in becomes something to look forward to rather than a chore.

This system explicitly rejects: the flat gray "unstyled admin panel" look, cluttered dashboards that cram every stat onto one screen with no breathing room, and childish/toy-like gamification (cartoon mascots, loud primary colors, confetti overload). Warmth comes from the terracotta-on-cream palette and soft rounded surfaces, not from cuteness — this is a health product for someone's parent, and every playful element must still read as credible.

**Key Characteristics:**
- Clean white surfaces with a single confident terracotta accent, not a rainbow of competing brand colors
- Rounded, soft-edged surfaces (12–18px radii) that feel touchable and gentle, never sharp or clinical
- Cards float a shade lighter than the page on shadow + hairline alone, not a color step — depth is used sparingly, not decoratively
- One dark surface in the whole app: the floating icon-only tab bar, which keeps the terracotta-family dark rather than bare black
- Status color (green/amber/red) reserved strictly for meaning (adherence, warnings, alerts), never for decoration
- Generous whitespace between sections — one clear signal per screen, not a wall of stat tiles

## 2. Colors

White-forward palette with terracotta as the one carried-over accent — the warm-cream background was traded for a barely-tinted white so the app reads as "clean," while terracotta keeps doing all the same brand-identity work it always did.

### Primary
- **Terracotta** (#B8543A): the single confident accent — primary buttons, active tab state, key progress indicators (streak flame, chair-test highlight). Used deliberately, not sprinkled everywhere.
- **Terracotta Pressed** (#9C4630): pressed/active state for terracotta surfaces.
- **Terracotta Soft** (#F7E4DB): tonal fill for secondary buttons, selected chips, gentle brand banners — the "soft" register of the accent.
- **Terracotta Soft Pressed** (#EFD4C7): pressed state for soft-terracotta surfaces.

### Neutral
- **Paper White** (#FDFCFB): the app's background — a whisper of warm tint, never bare #FFF, but reads as "clean white" at a glance.
- **Surface White** (#FFFFFF): elevated surfaces — cards, sheets, inputs — separated from the page by hairline + the single card shadow, not a color step.
- **Surface Muted** (#F6F3EF): tonal panel one step warmer than surface-white — header strips, quick-action tiles, the chat disclosure note.
- **Hairline** (#ECE7E1): 1px dividers between list rows and sections.
- **Border** (#E3DDD4): input and outline borders.
- **Tab Bar Background** (#241B16): the one dark surface — near-black but tinted into the terracotta family, never bare #000.
- **Ink** (#2E2A28): primary text (13.5:1 on paper-white — well past WCAG AA).
- **Ink Muted** (#6E6560): secondary/caption text (5.4:1 on paper-white).

### Status (meaning-only, never decorative)
- **Success Green** (#2F7D4F) / **Success Green Soft** (#E4F0E8): medication taken, streak maintained, chair-test improvement.
- **Warning Amber** (#8A5A0C) / **Warning Amber Soft** (#F6EAD5): missed day, upcoming dose, mild concern.
- **Danger Red** (#C4362B) / **Danger Red Pressed** (#A82D24) / **Danger Red Soft** (#F7DED9): reserved exclusively for genuine alerts — pain/dizziness mentions, emergencies, no-response escalation. Never reused for anything decorative.

### Named Rules
**The One Accent Rule.** Terracotta is the only saturated color allowed to carry brand identity. Status colors (green/amber/red) exist purely to communicate meaning — if a screen needs a second "brand" color, the answer is more terracotta-soft, not a new hue.

**The Alert Severity Rule.** Danger red must never appear for anything short of a genuine health concern. If red starts showing up on routine UI (a delete button, a generic warning), the severity signal is broken and alert fatigue follows.

## 3. Typography

**Display/Body Font:** System font (San Francisco on iOS, Roboto on Android) — no custom font loading, keeps the app feeling instantly native and fast to open, no flash-of-unstyled-text.

**Character:** A single, honest system-font family used with a confident weight scale. The personality comes from spacing, color, and restraint — not from a custom display face. This keeps the app feeling like a trustworthy native iOS tool rather than a branded marketing surface.

### Hierarchy
- **Title** (700, 28px, 40px line-height): screen-level headers — "Progress", "Alerts", companion name.
- **Section** (700, 20px, 28px line-height): section headers within a screen — "Engagement streak", "This week's doses".
- **Body** (400, 16px, 24px line-height): primary reading text, chat bubbles, list content. Cap prose at ~70ch on tablet/wide layouts.
- **Body Muted** (400, 16px, 24px line-height, ink-muted): secondary/supporting text at the same size as body — de-emphasis through color, not size, so text doesn't shrink illegibly.
- **Caption** (400, 13px, 18px line-height, ink-muted): timestamps only — the smallest text in the system, reserved for metadata that's fine to skim past.
- **Button** (600, 16px, 20px line-height): single-line, tighter line-height since it never wraps.

### Named Rules
**The De-emphasis-by-Color Rule.** Secondary text gets ink-muted, not a smaller font size. Font size communicates hierarchy of importance (title > section > body); color communicates emphasis within the same level. Never conflate the two.

## 4. Elevation

Restrained and flat by default. The app uses exactly one shadow level — a soft, warm-toned shadow reserved for cards — and nothing else. No glassmorphism, no floating glass panels, no layered blur effects. On a white-on-white page, this shadow (plus the hairline) is what separates a card from the background instead of a color step; it is never used decoratively or to fake a 3D "premium" surface. The floating tab bar reuses the same shadow at a slightly higher opacity/radius since it's the one element meant to visibly hover over content.

### Shadow Vocabulary
- **Card** (`shadowColor: #6B4A34, shadowOffset: 0/2, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2`): the only shadow in the system. Applies to Card and any card-derived surface (progress tiles, alert rows treated as cards).

### Named Rules
**The Flat-By-Default Rule.** Every surface is flat at rest. The single card shadow is the ceiling, not a starting point — never stack additional shadows, glows, or blur for "extra" depth.

## 5. Components

### Buttons
- **Shape:** 12px radius (rounded.button) — soft and reassuring, not sharp, not a full pill.
- **Primary:** terracotta background, white label, 48px min height, 16/12px padding. Scales down to 0.98 on press (spring, no bounce) for tactile, gentle feedback.
- **Secondary:** terracotta-soft background, terracotta label — same shape and press behavior as primary, lower visual weight.
- **Ghost:** transparent background, terracotta label, terracotta-soft on press — used for tertiary actions like "See all" or "Cancel".
- **Danger:** danger-red background, white label — reserved for destructive/emergency-adjacent actions only (e.g. confirming an emergency escalation), never for routine negative actions.
- **Disabled:** 0.45 opacity, no press animation.

### Cards
- **Corner Style:** 16px radius (rounded.card) — noticeably softer than buttons, reinforcing that cards are a resting surface, not an interactive control.
- **Background:** surface-white on paper-white page — separated by hairline + shadow, not a color step, since both are "white."
- **Shadow Strategy:** the single Card shadow (§4), applied uniformly — no per-card shadow variation.
- **Internal Padding:** 16px default (spacing.lg), configurable per instance; never edge-to-edge content.

### Chips / Status Pills
- **Style:** pill radius (999px), tonal fill (e.g. success-green-soft background with success-green text) — never an outlined-only chip, the fill itself carries the meaning at a glance.
- **State:** selected uses the full-saturation color as background with white text; unselected uses the soft tonal variant.

### Inputs / Fields
- **Style:** 12px radius (rounded.input), border color from `border` token, surface-white background.
- **Focus:** border shifts to terracotta, no glow or shadow added — focus is communicated by color, staying consistent with the flat-elevation philosophy.

### Navigation
- **Floating pill tab bar:** icon-only, no labels — 4 destinations is few enough that shape alone reads. A rounded pill in `tab-bar-bg` floats above content with generous bottom margin (clears the home indicator via safe-area inset).
- **Active state:** icon sits in a small terracotta-filled circle, white glyph on top. Inactive icons are white at 50% opacity on the dark pill — no labels, no underline.
- **Screen clearance:** every tab screen must reserve `TAB_BAR_CLEARANCE` (`components/ui/TabBar.tsx`) worth of bottom space so content and any floating in-screen elements (e.g. the chat disclosure note) never sit behind the pill.

### Streak / Progress Ring (signature component)
The engagement streak and chair-test progress use a single terracotta ring/bar on a terracotta-soft track — same accent-on-soft-tint logic as buttons, so the gamification layer never introduces a new color language. A short flame or check-mark glyph (not a cartoon mascot) marks an active streak day. This is the product's one "Duolingo moment" — keep it exactly this restrained; do not let it multiply into a second gamified visual system elsewhere in the app.

## 6. Do's and Don'ts

### Do:
- **Do** keep terracotta (#B8543A) as the only saturated brand color; everything else is cream, white, ink, or a meaning-only status tint.
- **Do** use the single Card shadow (`shadowOpacity: 0.12, shadowRadius: 8`) for every elevated surface — consistency here is what keeps the app feeling calm.
- **Do** reserve danger-red strictly for genuine health alerts (pain/dizziness, emergency, no-response escalation) so the color keeps its urgency.
- **Do** keep the streak/progress ring as the one gamified visual motif — one signature moment, not a mascot-driven system.
- **Do** honor generous whitespace between sections; one clear signal per screen over a wall of stat tiles.
- **Do** let hairline + the card shadow do the separating on white-on-white surfaces; reach for `surface-muted` only when a panel needs to read as a distinct tonal zone (header strip, disclosure note), not as a default card background.
- **Do** give every tab screen `TAB_BAR_CLEARANCE` of bottom padding so nothing sits behind the floating pill.

### Don't:
- **Don't** default to the flat gray "unstyled admin panel" look — no default Material blue, no ungrouped flat list rows.
- **Don't** use bare `#FFFFFF` for the page background or bare `#000000` for the tab bar — both stay tinted into the terracotta family (`paper-white`, `tab-bar-bg`).
- **Don't** cram multiple stat cards onto one screen with no breathing room — this is explicitly what the current UI does wrong today.
- **Don't** use cartoon mascots, loud primary colors, or confetti-style celebration — playful, never juvenile.
- **Don't** introduce glassmorphism, layered blur, or floating glass cards — elevation stays flat-by-default with one soft shadow only.
- **Don't** use `border-left`/`border-right` accent stripes on cards or alert rows to signal severity — use full tonal fill (status-soft background) or a leading icon instead.
- **Don't** use gradient text or `background-clip: text` effects — emphasis comes from weight and color, never a gradient.
