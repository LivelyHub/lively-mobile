// Types mirror the Postgres columns in CORE.md §1 and the endpoint list in §2.
// Field names are kept snake_case to match the DB/API payload exactly (no local
// re-casing) so this file stays a straight transcription, not an interpretation.
//
// A few endpoints mobile needs (auth, GET /elders, GET progress, alerts list/resolve,
// medications list, family-members/me) are not yet formalized in CORE.md — BACKLOG.md
// flags them as pending backend amendments. Those request/response shapes are marked
// ANTICIPATED below: built from the existing table columns, not invented fields, but
// unconfirmed until the backend lands and CORE.md is updated to match.

export type CompanionKey = 'mbak_asih' | 'mas_budi';

export type Religion = 'islam' | 'kristen' | 'katolik' | 'lainnya';

// ANTICIPATED (WA bot intro message, sent server-side on elder creation) —
// lets mobile show a "message sent" confirmation instead of guessing from silence.
export type WelcomeMessageStatus = 'pending' | 'sent' | 'failed';

export interface Companion {
  id: string;
  key: CompanionKey;
  display_name: string;
  system_prompt_ref: string;
}

export interface Elder {
  id: string;
  family_member_id: string;
  name: string;
  honorific: string;
  companion_id: string;
  // Added during local-connection reconciliation (2026-07-17): the backend
  // returns the persona key directly since it's a fixed two-value enum and
  // mobile resolves display metadata client-side (lib/companions.ts) — no
  // need to guess it from the opaque companion_id.
  companion_key: CompanionKey;
  health_flags: string[];
  phone_e164: string;
  created_at: string;
  paused: boolean;
  // Personalization (companion small-talk steer, added during the setup-wizard
  // personalization pass): chip lists the companion draws on for what to bring
  // up vs. avoid, plus a free-text tone note. Religion picks the right
  // exclamation ("Alhamdulillah" / "Puji Tuhan") instead of a generic one.
  hobbies: string[];
  favorite_topics: string[];
  avoid_topics: string[];
  speech_style: string;
  religion?: Religion;
  // ANTICIPATED, see WelcomeMessageStatus above.
  welcome_message_status: WelcomeMessageStatus;
}

export interface FamilyMember {
  id: string;
  email: string;
  name: string;
  push_token: string | null;
  created_at: string;
}

export type ConversationDirection = 'in' | 'out';

export interface ConversationMessage {
  id: string;
  elder_id: string;
  direction: ConversationDirection;
  body: string;
  created_at: string;
  // ANTICIPATED (M4.1 "Titipan dari keluarga" label) — distinguishes a relayed
  // family message from the companion's own reply within the same 'out' stream.
  is_titipan?: boolean;
}

export type ChairTestSource = 'chat';

export interface ChairTestResult {
  id: string;
  elder_id: string;
  reps: number;
  recorded_at: string;
  source: ChairTestSource;
}

export type LogMethod = 'reply' | 'emoji' | 'photo';

export interface ExerciseLog {
  id: string;
  elder_id: string;
  completed_at: string;
  method: LogMethod;
}

export interface Medication {
  id: string;
  elder_id: string;
  name: string;
  dosage: string;
  schedule_times: string[]; // "HH:MM"
  active: boolean;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  elder_id: string;
  taken_at: string;
  method: LogMethod;
}

export type AlertType =
  | 'missed_days'
  | 'pain_mention'
  | 'dizziness_mention'
  | 'medication_missed'
  | 'no_response'
  | 'emergency';

export interface Alert {
  id: string;
  elder_id: string;
  type: AlertType;
  // Payload shape varies per type (CORE §6); quoted elder words when present.
  payload: {
    quote?: string;
    medication_name?: string;
    days?: number;
    [key: string]: unknown;
  };
  created_at: string;
  resolved_at: string | null;
}

export interface TitipanMessage {
  id: string;
  elder_id: string;
  family_member_id: string;
  body: string;
  delivered_at: string | null;
  created_at: string;
}

// ---- Request/response shapes per CORE.md §2 ----

export interface CreateElderRequest {
  name: string;
  honorific: string;
  companion_key: CompanionKey;
  health_flags: string[];
  phone_e164: string;
  hobbies: string[];
  favorite_topics: string[];
  avoid_topics: string[];
  speech_style: string;
  religion?: Religion;
}

export interface UpdateElderRequest {
  honorific?: string;
  companion_key?: CompanionKey;
  health_flags?: string[];
  paused?: boolean; // ANTICIPATED, see Elder.paused
  hobbies?: string[];
  favorite_topics?: string[];
  avoid_topics?: string[];
  speech_style?: string;
  religion?: Religion;
}

export interface ConversationQuery {
  after?: string; // cursor: message id, poll for new messages
  before?: string; // cursor: message id, page older history
  limit?: number;
}

export interface CreateTitipanRequest {
  body: string;
}

export interface CreateMedicationRequest {
  elder_id: string; // POST /medications is not elder-scoped in the path (CORE.md §2)
  name: string;
  dosage: string;
  schedule_times: string[];
  active?: boolean;
}

export interface UpdateMedicationRequest {
  name?: string;
  dosage?: string;
  schedule_times?: string[];
  active?: boolean;
}

// ---- ANTICIPATED endpoints (CORE.md amendments per BACKLOG.md) ----

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  family_member: FamilyMember;
}

// This-week and history dot statuses shared by the streak row and the 30-day strip.
export type ProgressDayStatus = 'done' | 'missed' | 'future';

export interface ProgressWeekDay {
  date: string; // YYYY-MM-DD (local calendar)
  status: ProgressDayStatus;
}

export interface ChartChairTest {
  reps: number;
  recorded_at: string;
}

export interface ExerciseHistoryDay {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface MedicationAdherence {
  last7d_taken: number;
  last7d_scheduled: number;
  pct: number; // 0-100
}

export interface MedicationAdherenceTrendDay {
  date: string; // YYYY-MM-DD
  taken: number;
  scheduled: number;
}

// Superset response (CORE §7). The four raw arrays are kept verbatim so Home's
// glance rows (components/home/glance.ts) keep working; the rest are computed,
// chart-ready views the Progress dashboard renders directly.
export interface ProgressResponse {
  // Raw arrays (also consumed by Home) — do not remove.
  chair_test_results: ChairTestResult[];
  exercise_logs: ExerciseLog[];
  medications: Medication[];
  medication_logs: MedicationLog[];

  // Computed gamification fields (CORE §7).
  overall_progress_pct: number; // 0-100, unweighted avg of the three sub-scores
  engagement_streak_days: number; // consecutive calendar days with any activity
  exercise: {
    current_streak_days: number;
    this_week: ProgressWeekDay[]; // current Mon-Sun week, day dots
  };
  chair_tests: ChartChairTest[]; // oldest -> newest, last 20
  exercise_history: ExerciseHistoryDay[]; // last 30 days, oldest -> newest
  medication_adherence: MedicationAdherence; // 7-day rollup (P1)
  medication_adherence_trend: MedicationAdherenceTrendDay[]; // last 30 days (P1)
}

// ---- Performance report (M11.1, CORE §7 `GET /elders/:id/report`) ----
// ANTICIPATED: derived from the same raw tables as /progress, rolled up over a
// week or month window. Copy always leads positive; areas_needing_support is
// rendered as gentle suggestions, never an alarm.
export type ReportPeriod = 'week' | 'month';

export interface PerformanceReport {
  period: ReportPeriod;
  range_start: string; // YYYY-MM-DD (local calendar)
  range_end: string; // YYYY-MM-DD
  has_data: boolean; // false -> gentle zero-state, not an error
  headline: string; // positive-leading summary sentence, honorific interpolated
  consistency_pct: number; // days with any activity / days in range
  exercise_completion_pct: number; // exercise days / days in range
  medication_adherence_pct: number; // taken / scheduled over the range
  chair_test_latest: number | null; // latest reps in range
  chair_test_delta: number | null; // reps change across the range (null if <2 tests)
  highlights: string[]; // positive callouts
  areas_needing_support: string[]; // gentle suggestions, never alarming
}

export interface UpdateFamilyMemberRequest {
  push_token?: string;
  name?: string;
}

export interface ResolveAlertRequest {
  resolved: true;
}
