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
  health_flags: string[];
  phone_e164: string;
  created_at: string;
  // ANTICIPATED (M9.1 pause toggle) — not yet a documented column in CORE.md §1.
  paused: boolean;
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
}

export interface UpdateElderRequest {
  honorific?: string;
  companion_key?: CompanionKey;
  health_flags?: string[];
  paused?: boolean; // ANTICIPATED, see Elder.paused
}

export interface ConversationQuery {
  after?: string; // cursor: ISO timestamp, poll for new messages
  before?: string; // cursor: ISO timestamp, page older history
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

export interface UpdateFamilyMemberRequest {
  push_token?: string;
  name?: string;
}

export interface ResolveAlertRequest {
  resolved: true;
}
