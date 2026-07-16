# lively-mobile — Plan

**Window:** 2026-07-16 → 2026-07-18 (Garuda Hacks 7.0, offline). ~3 days. Solo/small-team repo owner. Assumes `lively-backend`'s API (per [CORE.md](CORE.md)) is reachable by Day 2 — this repo can build UI against mocked data until then.

## Setup (Day 0 / early Day 1)
- Env: `BACKEND_API_URL`. Ship `.env.example` only.
- Accounts: Expo account (for EAS build/QR install), push notification credentials (Expo push — 🟡 confirm vs Firebase Cloud Messaging).
- Tooling: Node.js, Expo CLI, NativeWind + `react-native-reusables` 🟡 (confirm Day 1 — see README note), navigation library (e.g. Expo Router).
- Repo: public; README skeleton + license + `.gitignore` (this pass).

## Definition of Done (the bar)
1. Companion selection flow works end-to-end (pick companion → set honorific → health flags → launch), writing to `lively-backend`.
2. Chat Monitor renders a live conversation read from `POST /bot/inbound`/`outbound` logs.
3. Progress screen renders streak + chair-test chart from seeded/demo data.
4. Alerts: missed-day push fires from a simulated 2-missed-days state; titipan message send works.
> Item 1 is the demo's opening beat; item 2+4 are the "magic moment" and "the loop" beats in the pitch — both must work live.

## Day-by-day
**Day 1 — 2026-07-16 — scaffold + selection flow**
- `npx create-expo-app`, set up navigation, confirm NativeWind/component-kit choice (🔴 resolve fast — don't burn Day 1 bikeshedding styling tools).
- Build My Companion screen: companion cards (Mbak Asih / Mas Budi), honorific picker, health-flag checkboxes, launch button — against mocked/local data first.
- Confirm QR install on a real phone works (judges will install this way).

**Day 2 — 2026-07-17 — integrate backend + remaining screens**
- Wire selection flow to `lively-backend` (`POST /elders`, `PATCH /elders/:id`).
- Build Chat Monitor (poll or subscribe to `GET /elders/:id/conversation`), titipan send (`POST /elders/:id/titipan`).
- Build Progress screen (streak calendar, chair-test chart), medication list (add/edit routine medicine via `POST /medications`), and Alerts screen (push on missed-day/medication-missed/pain/no-response/emergency).

**Day 3 — 2026-07-18 — polish, demo rehearsal, submit**
- Seed demo elder "Eyang Uti" data via backend, verify all four screens render real (not mock) data.
- Rehearse the live demo flow 3× with a timer (companion switch, typing-indicator magic moment, titipan loop).
- Submit with margin before deadline.

## Honest feasibility verdict
Achievable in this window **if** the styling-tool decision (NativeWind vs plain StyleSheet) is locked within the first hour of Day 1 — this is the one place "faster dev tooling" could backfire by adding setup friction under time pressure. Biggest schedule risk is backend API not being ready by Day 2 morning; mitigation is building all four screens against mocked JSON first, swapping in real API calls once `lively-backend` exposes endpoints (per CORE.md, mobile only needs `/elders`, `/elders/:id/conversation`, `/elders/:id/titipan` — the smallest slice).

Cut-order if time compresses: drop Alerts push notifications and titipan relay last-in-first-cut (fall back to just displaying them in-app without real push); the irreducible core is the companion selection flow + Chat Monitor, since those two carry the demo's opening and "magic moment" beats.
