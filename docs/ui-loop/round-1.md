# UI loop, round 1

Worker: impeccable. Validators: emil-design-eng (interaction/motion), design-taste-frontend (visual/app-screen rules, contrast).

## Worker change (branch ui/round-1-worker)
- `PressableScale` + `useReduceMotion`: one press language (scale on press-in 110ms, release 180ms, ease-out `cubic-bezier(0.23,1,0.32,1)`, scale dropped under reduced motion).
- Applied to ShortcutRow, AlertCard, AlertRow, TabBar.
- TabBar a11y labels now use the Indonesian screen titles instead of route names ("index").
- AlertRow: removed the left accent rail (DESIGN.md forbids side stripes); unresolved rows use full tonal fill.

## Validator: emil-design-eng
| Before | After | Why |
| --- | --- | --- |
| Button uses its own spring (speed 40, 0.98) | Use the same timing/easing as PressableScale | Two press languages feel inconsistent |
| Toast enters with `spring bounciness: 4` | `timing` 200ms ease-out, no bounce | Avoid bounce in routine UI |
| MedicationRow, PersonaCard, SelectChip, HomeBanner still opacity/colour-only press | Move to PressableScale | Every pressable should acknowledge the press |
| TabBar active swap is instant | Leave as is | High-frequency navigation, no animation is correct |

Verdict: PressableScale itself passes (ease-out, <200ms, interruptible via timing retarget, reduced-motion aware).

## Validator: design-taste (app-screens rules)
| Finding | Severity | Action |
| --- | --- | --- |
| Muted caption (#6E6560) on dangerSoft = 4.44:1 (<4.5). Round 1 made unresolved AlertRow sit on tonal fill, so this is a regression on the most urgent surface | FAIL | Round 2: meta text on tonal rows uses `colors.text` |
| Same caption-on-tone in AlertCard | FAIL | Same fix |
| ShortcutRow icons in tinted circles | WARN, established brand pattern | Leave, note only |
| Rest of palette: other soft fills pass 4.6+ | OK | none |

## Carried to round 2
1. Contrast fix on tonal alert rows/cards.
2. Button joins the shared press timing.
3. Toast: drop spring bounce.
4. PressableScale on MedicationRow, PersonaCard, SelectChip, HomeBanner.
