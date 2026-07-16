# lively-mobile — UI/UX Guidelines

> The bar every screen must clear. §2's state matrix is enforceable: each cell is a test case in [TESTING.md](TESTING.md) §1, and story [M10.1](BACKLOG.md) is the audit. The rest defines how Lively should feel: warm, calm, trustworthy, because the subject is someone's aging parent.

## 1. Product feeling

The user is an adult child worried about a parent far away. Every choice serves two emotions:
- **Reassurance by default** — when nothing is wrong, the app radiates "Eyang is okay." Calm colors, gentle copy, no alarmist red outside genuine alerts.
- **Clarity in the bad moment** — when an alert fires: zero ambiguity about what happened, in Eyang's own words, and one obvious action (call).

Corollaries: no dark patterns, no gamifying a parent's health, honorifics everywhere (CORE §3 — the companion never uses a bare first name, and neither does the app).

**Scope of "no gamifying":** the elder never sees the app — Lively's whole thesis is that elders adopt nothing (SPEC §3). So the progress bar, engagement streak, and graphs on the Progress screen (CORE §7, added post-kickoff per mentor/judge feedback) are not gamifying the elder's health; they're a warm status readout for the family member who *is* the user. Keep it that way: no leaderboards, no badges, no "beat yesterday's score" framing, no competitive language, no number pushed to the elder over WhatsApp. The bar/streak communicate "here's how {honorific} is doing," full stop — same reassurance-by-default register as the rest of the app.

## 2. The state matrix (enforceable)

Every screen implements every applicable state. "—" = not applicable. This table is the M10.1 audit sheet.

| Screen | Skeleton | Empty | Error + Retry | Offline | Pull-to-refresh | Live update |
|---|---|---|---|---|---|---|
| Login / Register | — | — | inline banner | disable submit + banner | — | — |
| Setup wizard | — | — | keep input, retry | block submit, banner | — | — |
| Home | elder card + 3 status rows | "Tambah Eyang" hero | full-screen ErrorState | banner + cache | ✅ | 60s poll |
| Chat Monitor | 5 alternating bubble skeletons | companion-will-greet copy | full-screen ErrorState | banner + cached messages | ✅ | 10s `?after=` poll |
| Progress | chart block + streak row + progress bar | per-section explainers | full-screen ErrorState | banner + cache | ✅ | on refresh |
| Performance report | headline + 2 stat-row skeletons | gentle zero-state copy | full-screen ErrorState | banner + cache | ✅ | on refresh / period toggle |
| Medications | 3 list-row skeletons | add-first-med CTA | full-screen ErrorState | banner + cache; toggle rolls back | ✅ | on refresh |
| Alerts | 3 alert-row skeletons | "semua baik-baik saja" | full-screen ErrorState | banner + cache | ✅ | 60s poll + push |
| Alert detail | row skeletons | — | ErrorState | cache | — | — |
| Titipan | — | explainer above composer | keep text, retry | block send, keep text | — | delivered flip on poll |
| Settings | field skeletons | — | per-control rollback + toast | disable controls | — | — |

### State rules

**Loading / skeleton**
- Skeleton over spinner for any content area. Spinners only inside buttons and pagination rows.
- Skeletons are shaped like the real content (bubble-shaped in chat, chart-block on Progress) so there is **zero layout shift** on arrival: same dimensions, same positions.
- One subtle shimmer (opacity 0.4→0.7, ~1.2s loop), synchronized across the screen. Prefer one aggregate fetch → one skeleton (Progress uses `GET /progress`).
- Load under 200ms may skip the skeleton (avoid a flash). Any fetch over 10s times out into the error state; no infinite shimmer.

**Empty**
- Never a blank list. Always: a soft visual (emoji-scale illustration is enough) + a one-line reason + a CTA when the user can act. Empty states carry the product's warmth; they are first-run screens.
  - Chat: "Belum ada percakapan — Mbak Asih akan menyapa Eyang Uti besok pagi"
  - Alerts: "Tidak ada peringatan. Eyang Uti baik-baik saja" (reassurance, not absence)
  - Progress: "Tes kursi pertama Eyang Uti akan muncul di sini" + a one-liner on what the chair test measures; progress bar shows 0% with the same forward-looking tone, never "0% — no activity" alarm framing
  - Performance report: "Belum cukup data minggu ini — ringkasan akan muncul setelah {honorific} mulai beraktivitas" (forward-looking, not a judgment)
- Distinguish "no data yet" (warm, forward-looking) from "filtered to nothing" (offer to clear the filter).

**Error**
- Human copy, never raw errors: "Tidak bisa terhubung. Coba lagi ya." + a Retry that visibly refetches (button spins).
- Field-level errors inline under the field (from the backend's `fields` detail); screen-level errors as a banner or full-screen ErrorState depending on whether content is showing.
- An error on a screen with cached content = a banner over stale content, not a full-screen takeover.

**Offline**
- A persistent slim banner ("Tidak ada koneksi — menampilkan data terakhir") the moment NetInfo drops; auto-dismiss with a brief "Terhubung kembali" on recovery.
- Cached (TanStack Query) content stays visible. Offline mutations fail fast with a toast + preserved input; no silent queues at hackathon scope.

**Success / confirmation**
- Mutations confirm: a toast for small things (med saved), an inline state flip for statuses (titipan → delivered), a full success moment only for wizard completion (the emotional beat).
- Optimistic updates only where rollback is trivial and specified (the medication toggle). Everything else: button-spinner → server confirms → UI updates.

## 3. Design language

**Palette** (tokens in M0.2; these are the roles, final hex tuned there):

| Token | Role | Direction |
|---|---|---|
| `primary` | brand, CTAs, companion bubbles | warm terracotta/coral, caring and Indonesian-warm, not clinical blue |
| `surface` / `background` | cards / canvas | warm off-white, soft shadows |
| `text` / `text-muted` | body / secondary | near-black warm gray; muted ≥ 4.5:1 contrast |
| `success` | streaks, confirmations, "all good" | calm green |
| `warning` | unconfirmed meds, `no_response` | amber |
| `danger` | `emergency`, `pain_mention` | red, **reserved exclusively for alerts** so it never cries wolf |

**Typography:** system font (SF / Roboto), no custom-font loading risk. Scale: 28 screen title / 20 section / 16 body (minimum; nothing under 13, and 13 only for timestamps) / 16 button. Line-height 1.4+. Users skew 35–55 and stressed; when in doubt, bigger.

**Spacing & shape:** 4pt grid (4/8/12/16/24/32). Cards radius 16, buttons 12, chat bubbles 18 with a 4 tail corner. One shadow level for cards, flat otherwise.

**Copy tone:** Indonesian-first, warm-informal-respectful (the register you use with family about their parent). Honorific interpolated everywhere. Sparing, purposeful emoji (one per message max). No clinical jargon: "tes kursi" with a plain explanation, not "30-second chair stand assessment."

## 4. Interaction patterns

- **Touch targets** ≥ 44pt; list rows ≥ 56pt. Press feedback (opacity 0.7 or scale 0.98) on every touchable.
- **Pull-to-refresh** on all data screens (matrix above), RefreshControl tinted `primary`.
- **Buttons** disabled-with-spinner while submitting: never double-submittable, never a dead disabled button with no reason.
- **Confirm sheets** (not modal-on-modal) for consequential actions (switch companion, pause, deactivate medication), copy stating the consequence plainly.
- **Haptics:** light on success, warning-pattern on alert arrival. Sparingly.
- **Navigation:** native-stack defaults, tabs always reachable, no custom transition animations (demo-day jank risk). Push deep-links to alert detail.
- **Chat specifics:** inverted list, auto-scroll to newest only when already at bottom (never yank a user mid-scroll-up), day separators, a "new messages" pill when scrolled up and new arrives.

## 5. Alert urgency tiers

One visual system across push copy, the Home banner, and the Alerts list:

| Tier | Types | Color | Push | Copy register |
|---|---|---|---|---|
| Urgent | `emergency`, `pain_mention`, `dizziness_mention` | `danger` | max priority, sound | direct, actionable: "Eyang Uti menyebut nyeri — lihat pesannya" |
| Attention | `medication_missed`, `no_response` | `warning` | default priority | gentle nudge: "Eyang Uti belum membalas hari ini — mungkin layak ditelepon" (CORE §6 framing) |
| Info | `missed_days` | `text-muted` | default | neutral: "Eyang Uti melewatkan latihan 2 hari" |

Alert detail always shows Eyang's quoted words when the payload has them, and **Telepon {honorific}** is the primary (filled) action; resolve is secondary. Tiers differ by icon + text too, never color alone.

## 6. Accessibility (hackathon-realistic)

- All color pairs ≥ 4.5:1; urgency tiers also differ by icon + text.
- Screens survive OS font scaling at 130% without truncation (test per [TESTING.md](TESTING.md) §1).
- `accessibilityLabel` on icon-only buttons; the Progress chart gets a text summary ("Naik dari 8 ke 12 dalam 3 minggu") so the data isn't chart-only.
- Respect reduce-motion: shimmer and celebration animations check `AccessibilityInfo.isReduceMotionEnabled`.
