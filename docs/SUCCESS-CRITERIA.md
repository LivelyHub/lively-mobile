# lively-mobile — Success Criteria

> What "done" means for the app at three levels: per epic (§1), for the demo (§2), and for submission (§3). Story-level acceptance boxes live in [BACKLOG.md](BACKLOG.md). "Verified" = the [TESTING.md](TESTING.md) procedure was actually run on a physical device.

## 1. Definition of Done per epic

| Epic | Done when |
|---|---|
| **M0 Scaffold** | Runs in Expo Go on a device; the component gallery shows every base component in every state; mock mode renders all screens with zero network. |
| **M1 Auth** | Register → kill app → reopen lands on Home; wrong password shows friendly copy; logout returns to login and clears cache. |
| **M2 Setup wizard** | The full 3-step flow creates a real elder; back-nav preserves input; mid-submit API failure keeps input and retry succeeds; the success moment shows. |
| **M3 Home** | Empty, skeleton, populated, error, and offline states all reachable and correct; the alert banner appears within one poll of a curl-raised alert. |
| **M4 Chat Monitor** | Seeded history renders with day separators; a live message appears ≤10s; infinite scroll pages older; all 6 UI states verified. |
| **M5 Progress** | The 8→12 arc renders with the callout; progress bar and engagement streak match the seeded data's `overall_progress_pct`/`engagement_streak_days`; ≤2 data points fall back to number cards; a fresh elder shows explainer empty states, bar at 0%. |
| **M6 Medications** | Add/edit/deactivate works; the optimistic toggle rolls back with a toast when offline; slot status reflects bot logs. |
| **M7 Titipan** | Send → pending → delivered flip verified; offline send preserves text. |
| **M8 Alerts & push** | Push permission asked post-setup; tapping a push deep-links to detail; all 6 types show correct copy + urgency color; the call button opens the dialer. |
| **M9 Settings** | Companion switch, honorific edit, and pause all persist and propagate (pause visible in the backend's bot inbound response). |
| **M10 Hardening** | The full state audit passes screen-by-screen; a teammate who didn't build the app runs the whole demo script without hitting a broken state. |
| **M11 Performance report** | Week/month toggle both render seeded data correctly; headline and highlights read positive; a fresh elder gets gentle zero-state copy, not an error. First cut if Day 3 runs short. |

## 2. Demo-day success script (the "magic moment")

The demo passes if this runs end-to-end in front of judges without a debugger. Rehearse it whole, twice, on Day 3. Operator curl commands (standing in for `lively-bot`) are in `lively-backend/docs/TESTING.md` §3.

1. **Setup (30s):** Register → setup wizard → "hire" Mbak Asih for Eyang Uti, honorific chip, knee-pain flag → success moment.
2. **The relationship (45s):** Chat Monitor shows seeded weeks of warm daily conversation — scrolling up tells the story of an ongoing relationship, not a chatbot demo.
3. **Clinical proof (30s):** Progress — chair-stand chart climbing 8→12 with the "naik dari 8!" callout, the progress bar, and streak dots. The pitch line: fall-risk measurably decreasing over WhatsApp, and it reads as a win the family checks in on, not a compliance report.
4. **Live loop (30s):** Operator sends a message as Eyang (or curls `POST /bot/inbound`) → it appears in Chat Monitor on the judge's phone within seconds. Proof it's live, not mocked.
5. **The moment that sells it (30s):** Operator sends "aduh, lutut saya sakit sekali, pusing juga" → `pain_mention` alert → **push lands on the judge-visible phone** → tap → alert detail quoting Eyang's own words → "Telepon Eyang Uti" button. The whole value proposition in one notification.
6. **Family voice (15s, if M7 shipped):** Send a titipan; show it flowing into the conversation.

**Success =** zero broken states on screen, push arrives ≤10s, every screen the judges see has real data, and the phone never shows a spinner longer than ~2s.

**Fallbacks pre-staged:** phone hotspot instead of venue Wi-Fi; the Home alert banner (60s poll) covers for a failed push; a second seeded account on the backup phone if live registration breaks; a mock-mode build on the backup phone if the backend dies.

## 3. Submission gate (SPEC §8)

- [ ] **Working demo** — the Expo app on a device, the demo script above passing against the deployed backend
- [ ] **Public repo** — README, LICENSE, `.gitignore`; no secrets committed (no API keys, no `BACKEND_API_URL` pointing at anything sensitive)
- [ ] **Pitch deck** — 🔴 owner TBD (SPEC §8); confirm who hosts it by Day 2 evening
- [ ] Submitted **with margin** before 2026-07-18 (exact time 🔴 TBD — record here once known: ______)
