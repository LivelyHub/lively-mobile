# lively-mobile — Testing Guide

> How every screen is verified. No automated UI tests at hackathon scope; instead a disciplined per-screen state checklist run on a physical device (Expo Go), once when the screen lands and again in the M10.1 audit. Backend endpoint testing lives in `lively-backend/docs/TESTING.md`.

## 1. Per-screen state checklist

Run on a **physical device**. Every cell of the [UI-UX-GUIDELINES.md](UI-UX-GUIDELINES.md) §2 state matrix is a test case. How to force each state:

| State | How to force it |
|---|---|
| Skeleton | Cold-open on slow network (throttle, or a dev-only 2s delay flag in the API client) |
| Empty | Fresh account with no data (register a throwaway), or mock-mode empty fixtures |
| Error | Point `BACKEND_API_URL` at a dead port, or kill the backend mid-session |
| Offline | Airplane mode after data loaded once (cache) and before any load (error/offline) |
| Live update | curl the relevant bot endpoint (below) and watch the poll cycle |

**Per screen, confirm:**
- [ ] Skeleton matches final layout — no jump when content arrives
- [ ] Empty state shows a visual + copy + CTA (never a blank list)
- [ ] Error state has a working Retry that actually refetches
- [ ] Offline: banner shows; cached content still visible; mutations fail gracefully with a toast + preserved input
- [ ] Pull-to-refresh works where specified (Home, Chat, Progress, Alerts, Meds, Performance report)
- [ ] No spinner runs > 10s (timeout → error state)
- [ ] Text doesn't overflow at 130% OS font scale (caregivers skew older)
- [ ] Honorific interpolation correct on every string (never "null" or a bare name)

## 2. Driving live updates (operator curl)

The mobile team doesn't need `lively-bot` running — the operator curl script in `lively-backend/docs/TESTING.md` §3 posts inbound messages, chair tests, medication logs, and alerts. Keep a copy handy; use it to verify Chat Monitor live-append (M4), Progress refresh including the progress bar/streak (M5), medication slot flips (M6), the alert banner + push (M3/M8), and the performance report picking up the same posted data on its next fetch (M11).

## 3. Mock mode (build offline, survive venue Wi-Fi)

- `EXPO_PUBLIC_USE_MOCKS=1` serves fixtures matching every endpoint (M0.3). Every screen must be fully walkable in mock mode — this is both the offline dev path and the demo-day backup if the backend dies.
- Keep fixtures in sync with the backend response shapes. When a backend contract changes (or a CORE.md amendment lands), update the matching fixture in the same PR.

## 4. E2E — demo rehearsal

The demo script in [SUCCESS-CRITERIA.md](SUCCESS-CRITERIA.md) §2 is the E2E test. Run it:
1. **Day 2 evening** — against the deployed backend; log every rough edge as a Day 3 fix.
2. **Day 3 midday** — after API freeze; this pass must be clean.
3. **Day 3 pre-submit** — a teammate who didn't build the app runs it (fresh eyes catch the "obvious" steps only the author knows).

Timing bar: each screen interactive < 2s on the demo network; push arrival < 10s from curl to notification.

## 5. Device checklist before the demo

- [ ] Demo build installed on the primary demo phone and a backup phone
- [ ] Backup phone has the mock-mode build too
- [ ] Notification permission granted on the demo phone; a test push received
- [ ] Seeded demo account logged in; Home, Chat, Progress all show real data
- [ ] Phone hotspot ready as the venue-Wi-Fi escape hatch
