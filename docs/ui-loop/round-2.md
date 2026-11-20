# UI loop, round 2

Worker: impeccable (applied round 1 carry-over list). Validators: emil-design-eng, design-taste-frontend.

## Worker change (branch ui/round-2-worker)
- AlertRow/AlertCard: caption text on tonal fills uses `colors.text` (muted on dangerSoft was 4.44:1; ink is 11.1:1). Resolved rows keep muted on white (5.7:1).
- Button moved onto PressableScale (one press language; pressed background still comes from the variant).
- Toast enter: 220ms ease-out timing instead of a bouncing spring.
- PressableScale added to MedicationRow, PersonaCard, SelectChip (non-removable), HomeBanner.

## Validator: emil-design-eng
| Before | After | Why | Status |
| --- | --- | --- | --- |
| Button spring (0.98) vs PressableScale | Same timing/easing everywhere | One press language | Done |
| Toast spring bounce | 220ms ease-out | No bounce in routine UI | Done |
| Toast exit uses default `ease` | Use ease-out too | Exit should respond immediately | Open, minor |
| Removable SelectChip has no scale | Leave | Small nested targets, sibling buttons | Accepted |

## Validator: design-taste (app-screens rules)
| Finding | Verdict |
| --- | --- |
| All text on tonal alert fills now >= AA | PASS |
| HomeBanner small "Kirim kabar" label above the headline | WARN. Small labels are normal in app screens, brand copy, left alone |
| ShortcutRow tinted icon circles | WARN, established brand pattern, left alone |
| No gradients, glass, side stripes, or extra shadows introduced | PASS |

## Gate
- `npx tsc --noEmit`: clean (both rounds).
- `expo lint` could not run: eslint is not a project dependency. Running it scaffolded `eslint.config.js` and edited `package.json`; those were removed before commit.
- Not verified on a device. Press feel and the Button migration should be checked in the next APK build.

## Open for a future round
- Toast exit easing.
- Remaining plain-opacity pressables: Banner actions, ProfileMenu, ConfirmSheet, ExerciseCalendar, ChipListField, auth and tab screens.
