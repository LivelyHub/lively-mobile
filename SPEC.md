# lively-mobile — Spec

> The family-facing Expo app for Lively — setup, monitoring, and progress tracking for the parent's WhatsApp companion. This spec covers only the mobile-specific implementation — the shared data model and API live in [CORE.md](CORE.md).

## 1. Hackathon context
| Field | Value |
|-------|-------|
| Event | Garuda Hacks 7.0 (offline) |
| Submit by | 2026-07-18 — exact time 🔴 TBD |
| QUALIFICATION GATE | Working demo + repo + pitch deck submitted |
| Judging | 🔴 TBD — criteria/weights not yet published |

**Chosen track:** Health — Lively targets the health-literacy and eldercare gap between urban and rural Indonesian families named in the theme brief, using a fall-risk assessment (30s Chair Stand) and daily strength coaching as the clinical backbone.

## 2. Problem & target user
**User:** the adult child of an elderly parent — digitally fluent, the paying customer, wants to support their parent's independence without being able to visit or coach them daily in person. **Problem:** existing eldercare apps require the elder to adopt new technology; this user needs a way to deliver care through a channel the parent already uses (WhatsApp), while still having visibility and control themselves.

## 3. Concept
- Family member downloads the app, picks a companion for their parent (Mbak Asih or Mas Budi), sets the honorific and health flags — this triggers the companion's first WhatsApp message to the parent.
- Family member reads the ongoing conversation (Chat Monitor) and can send a "titipan" (a message the companion relays in character).
- Progress screen shows a progress bar, engagement streak, and 30s Chair Stand scores over time — the clinical signal underneath the chat, framed so the family member wants to check in rather than feeling like they're auditing a chore (post-kickoff mentor/judge feedback — see CORE.md §7). A weekly/monthly performance report card summarizes the same data for a quick "how's Eyang doing" check.
- Family member adds the elder's routine long-term medications (name, dosage, times); the companion reminds at each scheduled time over the same chat and logs confirmations, same UX pattern as exercise check-ins.
- Alerts screen implements the reverse-Duolingo loop: missed days nudge the child to call, not the elder to open an app — and escalates hard (immediate push) if the elder mentions pain/dizziness, doesn't respond within the check-in window, or something is flagged as an emergency.
- Alternative considered: giving the elder their own app account too. Rejected for MVP — the entire product thesis is that elders adopt nothing; only the family installs.

## 4. MVP features (YAGNI-tight)
**In scope (the demoable spine):**
- Companion selection flow (pick → honorific → health flags → launch)
- Companion switch (Mbak Asih ↔ Mas Budi) mid-conversation
- Chat Monitor (read-only conversation view)
- Titipan message relay (family → companion → elder)
- Progress screen (progress bar, engagement streak calendar, chair-test chart, exercise/medication history graphs — CORE.md §7)
- Medication list management (add/edit routine long-term medicine + schedule times) — companion reminds and logs doses over chat
- Alerts screen (missed-day, medication-missed, pain/dizziness mention, no-response, emergency push)
- Performance report card (weekly/monthly summary, P1 — CORE.md §7)

**Explicitly NOT in MVP** → §6.

## 5. Architecture
Expo (React Native), TypeScript. Styling: NativeWind 🟡 (Tailwind for RN) + `react-native-reusables` 🟡 (shadcn-style primitives) — requested for faster dev, not yet confirmed against Expo's setup constraints (resolve Day 1). Navigation: Expo Router (assumed, 🟡 not yet confirmed).

```
lively-mobile ──JWT──▶ lively-backend ──▶ Postgres (Neon)
     │                        ▲
     └── push notifications ──┘ (alert triggers)
```

No direct connection to `lively-bot` or WhatsApp — mobile only ever talks to `lively-backend`, per [CORE.md](CORE.md).

## 6. Non-goals
- No elder-facing account or app — by design, per §3.
- No in-app video calling — the loop is "child calls parent," not a built-in call feature.
- No multi-child shared access to one elder profile at MVP — single family-member owner per elder.
- No offline mode — assumes connectivity at setup and monitoring time.

## 7. Risks & unknowns
- 🔴 Styling-tool choice (NativeWind + react-native-reusables) unconfirmed — could add setup friction under time pressure if it doesn't play well with Expo Go. Resolve first hour of Day 1; fall back to plain StyleSheet if blocked.
- 🟡 Push notification provider (Expo push vs Firebase) not chosen — pick Day 1, needed for Alerts screen.
- 🟡 Backend API availability timeline — mobile builds against mocked data until `lively-backend` exposes real endpoints (target: Day 2).
- 🔴 Gamification scope (progress bar, streak, graphs, performance report) landed after Day 1 kickoff with ~2 days left. Mitigated by design: M5.1's additions reuse the existing `GET /progress` fetch (no new request), and M11 (performance report) is a separate, cuttable screen — see PLAN.md cut-order.
- 🟢 Expo QR-install for judges is low-risk — standard hackathon pattern.

## 8. Submission checklist (mapped to THIS event's deliverables)
- [ ] Working demo (Expo app installable via QR at demo time)
- [ ] Public repo with README, LICENSE, `.gitignore`, no committed secrets
- [ ] Pitch deck (🔴 TBD which repo hosts it)

**Doc sources:** none fetched — all facts above came directly from the user during drafting (2026-07-16).
