# lively-mobile — Build Backlog

> The family-facing app (Expo / React Native). Derived from [CORE.md](../CORE.md) (shared contract — verbatim copy of the source of truth in `lively-backend`), and the `lively-backend` SPEC/PLAN. The backend backlog lives in `lively-backend/docs/BACKLOG.md`; every story here depends on an endpoint there.

**Priorities:** **P0** demo spine · **P1** credible demo · **P2** polish. The irreducible core is the screens that show elder creation, conversation, and the chair-test chart. Cut-order: Titipan and Alerts push drop first, then M11 (performance report) — the M5.1 progress bar/streak/graphs already ship most of the gamification value cheaply.

**How to use this file:** work stories in priority order. Tick each acceptance box **in the same PR that satisfies it** — this is the shared, checkable progress record. Every mobile story lists the **UI states** it must ship; a screen with only a happy path is an unfinished story. State definitions, skeleton specs, and copy tone are in [UI-UX-GUIDELINES.md](UI-UX-GUIDELINES.md). See [../AGENTS.md](../AGENTS.md) for the working agreement.

**Backend dependencies:** several stories need endpoints flagged as CORE.md amendments in `lively-backend/docs/BACKLOG.md` (auth, `GET /elders`, `GET /progress`, `PATCH /family-members/me`, etc.). Those must land in the backend first; coordinate rather than mocking a contract that then drifts.

---

## Epic M0 — Scaffold & design system `P0`

### M0.1 Expo app + navigation shell `P0`
- [x] Expo (managed) + TypeScript + expo-router; runs in Expo Go on a physical device
- [x] Route groups: `(auth)` → login/register; `(app)` tabs: **Home · Chat · Progress · Alerts** + modal stack for setup wizard, medication form, titipan, settings
- [x] Deep-link scheme registered (push opens the alert detail)

**Test:** cold start < 3s to first screen; tab switching keeps state.
**Depends on:** nothing.

### M0.2 Design tokens + base components `P0`
No ad-hoc hex or font sizes in screens — everything draws from tokens.
- [x] Token file: palette (warm primary, urgency tiers per UI-UX §5), type scale (body ≥ 16), spacing (4pt grid), radii, shadows
- [x] Base components: `Button` (default/loading/disabled), `Card`, `TextField` (label/error/helper), `Skeleton` (shimmer primitive), `EmptyState` (visual + title + body + CTA), `ErrorState` (message + retry), `Toast`, `Banner`
- [x] Light theme only, tokens structured so dark is a palette swap

**Test:** a dev gallery screen renders every base component in every state — doubles as the visual QA surface.
**Depends on:** M0.1.

### M0.3 API client + state layer `P0`
- [x] Typed API client reading `BACKEND_API_URL` from app config; attaches JWT; maps the backend error shape → typed errors
- [x] TanStack Query for all server state (caching, `isLoading`/`isError` per query, refetch-on-focus, pull-to-refresh)
- [x] Mock mode `EXPO_PUBLIC_USE_MOCKS=1` serves fixtures matching every endpoint — build all screens offline (venue Wi-Fi risk), swap to real API on Day 2
- [x] Offline detection (NetInfo) feeding the offline banner

**Test:** mock mode renders every screen with zero network; airplane mode → offline banner, cached screens still render. Verified at the data-layer level (`tsc`, `expo export`, mock transport covers every endpoint in lib/api/endpoints.ts); the "every screen" half of this test can only be run once M1+ screens exist and consume these hooks.
**Depends on:** M0.2.

---

## Epic M1 — Auth `P0`

### M1.1 Login + register `P0`
**UI states:** field-level input errors · submit loading (button spinner + disabled) · server error (inline banner, human copy) · success → navigate.
- [x] Email + password with client validation before submit
- [x] Register: name + email + password; duplicate email (backend 409) → "Email ini sudah terdaftar"
- [x] Token in `expo-secure-store`; session restored on cold start (splash → Home if valid)
- [x] Logout clears token + query cache

**Test:** register → kill app → reopen → still logged in; wrong password → friendly error; logout → back to login.
**Depends on:** M0.3, backend B2.1.

---

## Epic M2 — Elder setup wizard `P0`

### M2.1 Multi-step wizard `P0`
Where the family "hires" a companion for Eyang — the emotional core of onboarding. 3 steps, progress indicator, back preserves input.
**UI states:** per-step validation · submit loading (final step) · submit error (retry keeps input) · success moment → Home.
- [x] **Step 1 — About Eyang:** name; honorific (chips: Eyang Uti, Eyang Kakung, Oma, Opa, Nenek, Kakek + free text; required — enforces CORE §3 "never a bare first name"); WhatsApp number with `+62` affordance + E.164 validation
- [x] **Step 2 — Choose companion:** two large persona cards (Mbak Asih / Mas Budi) with avatar, one-line personality, sample greeting using the entered honorific ("Selamat pagi, Eyang Uti!"); selected card visibly elevated
- [x] **Step 3 — Health notes:** multi-select chips (lutut sakit / hipertensi / diabetes / …) + free text; skippable
- [x] Confirm screen → `POST /elders` → success moment ("Mbak Asih akan menyapa Eyang Uti besok pagi") → Home
- [x] Re-enterable from Home's "+ Tambah Eyang"

**Test:** full flow creates an elder on Home; back-nav keeps input; kill API mid-submit → error state, input intact, retry succeeds.
**Depends on:** M1.1, backend B3.1.

---

## Epic M3 — Home dashboard `P0`

### M3.1 Home screen `P0`
**UI states:** skeleton (elder card + 3 status rows shaped) · empty (no elders → warm hero + "Tambah Eyang" CTA) · error + retry · offline banner + cache · pull-to-refresh.
- [x] Elder card: honorific + name, companion avatar + name, "last heard from" relative time
- [x] Today-at-a-glance: morning check-in status, exercise done?, medications (2/3 confirmed)
- [x] Unresolved-alert banner pinned on top (urgency-tiered color, taps to Alerts) — the most important pixel when present
- [x] Quick actions: Chat · Progress · Titipan
- [x] Data: `GET /elders` + unresolved alerts; 60s poll while focused

**Test:** fresh account → empty state; seeded → Eyang Uti card with live status; raise an alert via curl → banner within a poll cycle.
**Depends on:** M0.3, backend B3.3, B7.3.

---

## Epic M4 — Chat Monitor `P0`

### M4.1 Conversation screen `P0`
Read-only window into Eyang ↔ companion — sells "there's a real relationship here."
**UI states:** skeleton (alternating bubble skeletons, correct alignment) · empty ("Belum ada percakapan — {companion} akan menyapa {honorific} besok pagi") · error + retry · offline (cache + banner) · pull-to-refresh · pagination loading (spinner row).
- [ ] Bubbles: elder left/neutral, companion right/brand-tinted; timestamps grouped or on long-press; day separators ("Hari ini", "Kemarin", date)
- [ ] Inverted FlatList, newest at bottom; infinite scroll up via `before`
- [ ] Poll `?after=` every 10s while focused; new messages append with soft scroll-to-bottom only if already at bottom
- [ ] Read-only is explicit: footer "Ini percakapan {honorific} dengan {companion} — kirim pesan lewat Titipan" linking to M7
- [ ] Titipan messages visually distinct ("Titipan dari keluarga" label) if present

**Test:** seeded history renders with separators; curl `POST /bot/inbound` → message appears ≤10s without user action; scroll up pages older; airplane mode shows cache + banner.
**Depends on:** M0.3, backend B4.3.

---

## Epic M5 — Progress screen `P0`

### M5.1 Progress dashboard `P0`
Where the 8→12 chair-test arc — the demo's clinical proof — renders. Also the gamification screen (CORE.md §7, added post-kickoff per mentor/judge feedback): family-facing progress bar + streak + richer graphs, so checking in reads as a shared win, not a chore. See UI-UX-GUIDELINES.md §1 note on keeping this family-facing, not elder-facing.
**UI states:** skeleton (chart block + streak row + list rows) · per-section empty (no chair tests → "Tes kursi pertama {honorific} akan muncul di sini" + a one-line explainer) · error + retry · pull-to-refresh.
- [ ] **Overall progress bar:** single bar/ring from `overall_progress_pct` (0-100), headline number, no numeric target shown to imply a "score to beat" — just "how {honorific} is doing"
- [ ] **Chair-test chart:** line/area of reps over time (`victory-native` or `react-native-gifted-charts`), dots on points, latest called out ("12 kali — naik dari 8!"); y-axis from 0; ≤2 points → big-number cards instead of a silly 2-point line
- [ ] **Engagement streak:** `engagement_streak_days` as the headline streak number ("🔥 5 hari berturut-turut"), plus the existing exercise-specific streak + this-week day dots (done/missed/future) below it
- [ ] **Exercise history graph:** calendar-dot strip from `exercise_history` (last 30 days), same visual language as the streak dots, just longer window
- [ ] **Medication adherence trend (P1, lands with backend B6):** 7-day ring/bar from `medication_adherence`, plus a 30-day trend line from `medication_adherence_trend` + unconfirmed-today list
- [ ] Single `GET /elders/:id/progress` fetch → single skeleton, no waterfall

**Test:** seeded shows 8→12 with callout, progress bar computed correctly, streak matches seed data; fresh elder shows empty explainers and a 0% bar (not an error); curl a new chair test → pull-to-refresh updates chart + bar.
**Depends on:** M0.3, backend B5.3.

---

## Epic M6 — Medication management `P1`

### M6.1 Medication list + add/edit form `P1`
**UI states:** list skeleton (rows) · empty ("Belum ada obat — tambahkan supaya {companion} bisa mengingatkan {honorific}") · form validation · save loading · save error (input intact) · optimistic active-toggle with rollback + toast on failure.
- [ ] List: name, dosage, schedule chips (07:00 · 19:00), today per-slot status (taken / upcoming / unconfirmed), active toggle
- [ ] Add/edit form: name, dosage, time picker adding multiple `HH:MM` chips (min 1), active switch
- [ ] Deactivate = toggle off with confirm sheet ("{companion} akan berhenti mengingatkan obat ini") — no delete
- [ ] Data: backend B6.1

**Test:** add med → list shows upcoming slots; toggle off in airplane mode → rolls back with toast; curl a medication-log → slot flips to taken on refresh.
**Depends on:** M0.3, backend B6.1.

---

## Epic M7 — Titipan composer `P2`

### M7.1 Send a titipan `P2`
**UI states:** send loading · send error (text preserved) · success (toast + pending) · delivered state on later poll.
- [ ] Modal from Home/Chat: explainer ("{companion} akan menyampaikan pesan ini ke {honorific} dengan gayanya sendiri"), multiline input (500 char counter), send button
- [ ] Sent list with status: "Menunggu disampaikan" → "Sudah disampaikan" (via `delivered_at`)

**Test:** send → pending; mark delivered via curl → status flips on next poll; send offline → error, text intact.
**Depends on:** M0.3, backend B8.1.

---

## Epic M8 — Alerts & push `P1`

### M8.1 Push registration `P1`
- [ ] Ask notification permission after elder setup succeeds ("Kami kabari kalau ada apa-apa dengan {honorific}"), not on app open
- [ ] Get Expo push token → `PATCH /family-members/me {push_token}`; re-check on app start
- [ ] Tapping a push deep-links to the alert detail
- [ ] Permission denied → dismissible enable-notifications banner on Alerts; app fully functional via polling

**Test:** curl an `emergency` alert → push arrives → tap → lands on detail.
**Depends on:** M1.1, backend B7.2.

### M8.2 Alerts list + detail `P1`
**UI states:** skeleton (alert rows) · empty (reassuring — "Tidak ada peringatan. {honorific} baik-baik saja") · error + retry · resolve loading · pull-to-refresh.
- [ ] List newest-first, unresolved on top; each row: type icon + urgency color (UI-UX §5), headline copy per type, relative time
- [ ] Type copy — `emergency`: "{honorific} butuh perhatian sekarang"; `pain_mention`: "{honorific} menyebut nyeri"; `no_response`: "{honorific} belum membalas hari ini — mungkin layak ditelepon"; `medication_missed`: "Obat {name} terlewat 2 hari"
- [ ] Detail: full payload (quoted elder message for pain/dizziness — the family sees Eyang's own words), timestamp, actions: **Telepon {honorific}** (tel: link — the real CTA), **Tandai selesai** (resolve), **Tandai darurat** (escalate, P2)
- [ ] Resolved section collapsed below

**Test:** curl each of 6 types → correct copy + color; resolve → moves to resolved; call button opens the dialer with the elder's number.
**Depends on:** M0.3, backend B7.3.

---

## Epic M9 — Settings `P1`

### M9.1 Elder settings `P1`
**UI states:** per-control save loading · save error with rollback · confirm sheets for consequential switches.
- [ ] Change honorific (text + chips), switch companion (persona cards + confirm sheet "Ganti ke {other}? Gaya bicaranya akan berubah"), edit health flags
- [ ] Pause companion: prominent toggle with plain consequence ("{companion} akan berhenti mengirim pesan sampai diaktifkan lagi"); paused elder shows a "Dijeda" chip on Home
- [ ] Account row: email + logout
- [ ] All via `PATCH /elders/:id` (backend B3.2)

**Test:** each change persists across restart; pause → Home chip; backend `POST /bot/inbound` for a paused elder returns `paused:true`.
**Depends on:** M0.3, backend B3.2.

---

## Epic M10 — State hardening & polish pass `P1`

### M10.1 Full-screen state audit `P1`
Day 3 morning. Walk the [UI-UX-GUIDELINES.md](UI-UX-GUIDELINES.md) §2 matrix against every screen.
- [ ] Every screen passes its matrix row: skeleton on first load, EmptyState with CTA, ErrorState with working retry, offline banner + cache, no layout shift skeleton→content
- [ ] No raw error strings, no infinite spinners (every fetch times out → error state), no dead-end screens
- [ ] Copy pass: consistent honorific interpolation everywhere, Indonesian-first tone (UI-UX §4)

### M10.2 Perceived-quality details `P1`
- [ ] Haptics on: alert arrival, resolve, wizard completion
- [ ] Press feedback (opacity/scale) on every touchable; min touch target 44pt
- [ ] Native-stack transitions — no janky custom animation on demo day
- [ ] Home, Chat, Progress rehearsed on the actual demo device

**Test:** the [TESTING.md](TESTING.md) mobile checklist run screen-by-screen on device; a teammate who didn't build it runs the demo script without hitting a broken state.
**Depends on:** all mobile P0/P1 stories.

---

## Epic M11 — Performance report `P1` 🟡 first-in-line to cut
Post-kickoff addition (mentor/judge feedback). A week/month summary card for the family member — the thing you'd screenshot and send to a sibling. M5.1's progress bar/streak/graphs already carry most of the gamification value cheaply; this is the one genuinely new screen, so it drops first if Day 3 runs short (PLAN.md cut-order).

### M11.1 Performance report card `P1`
**UI states:** skeleton (headline + 2 stat rows) · empty (gentle zero-state copy, not an error) · error + retry · pull-to-refresh · period toggle (week/month).
- [ ] Entry point: card on Progress screen ("Lihat ringkasan minggu ini") opening a report view/sheet
- [ ] Renders `GET /elders/:id/report?period=week|month`: headline, consistency %, exercise completion, medication adherence %, chair-test trend, highlights list, areas-needing-support list
- [ ] Copy always leads positive (CORE §7); `areas_needing_support` rendered as gentle suggestions, never a red/alarming style — this is encouragement, not the Alerts screen
- [ ] Week/month toggle refetches with the new `period` param

**Test:** seeded week → headline + highlights match seed data; fresh elder → zero-state copy, not blank/error; toggle to month → different range, no layout jump.
**Depends on:** M5.1, backend `GET /elders/:id/report`.

---

## Traceability — CORE.md → screen

| CORE.md / product need | Stories |
|---|---|
| §3 CompanionConfig — pick + edit persona/honorific/flags | M2.1 (pick), M9.1 (edit) |
| §2 `GET /conversation` — Chat Monitor | M4.1 |
| §2 chair-test + exercise — Progress | M5.1 |
| §2 medications — management + adherence | M6.1, M5.1 |
| §2 alerts (6 types) + §6 escalation copy tiers | M8.1, M8.2 |
| §2 titipan | M7.1 |
| §2 `/progress` · `/report` + §7 progress bar/streak/graphs/report | M5.1, M11.1 |
| Elder CRUD | M2.1, M3.1, M9.1 |
| Auth model (family JWT) | M1.1 |
| Push delivery (SPEC §6 — mobile's concern) | M8.1 |
| Every screen's loading/empty/error/offline states | all M-stories + M10.1, per [UI-UX-GUIDELINES.md](UI-UX-GUIDELINES.md) §2 |
