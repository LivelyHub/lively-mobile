import type {
  ChairTestResult,
  ExerciseLog,
  Medication,
  MedicationLog,
  ProgressResponse,
  ProgressWeekDay,
} from '../types';

// Stands in for the backend's GET /progress computation (CORE §7). The real
// backend derives these fields server-side from the same four raw tables; mock
// mode reproduces that here so the screen just renders the response. Keep the
// benchmarks in sync with the backend.
const CHAIR_BENCHMARK_REPS = 15;
const EXERCISE_STREAK_BENCHMARK_DAYS = 7;
const CHAIR_CHART_CAP = 20;
const EXERCISE_HISTORY_DAYS = 30;
const MED_TREND_DAYS = 30;
const ADHERENCE_WINDOW_DAYS = 7;

type RawProgress = {
  chair_test_results: ChairTestResult[];
  exercise_logs: ExerciseLog[];
  medications: Medication[];
  medication_logs: MedicationLog[];
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}

// Consecutive calendar days ending today (or yesterday, if today has no activity
// yet) present in the set. The grace day keeps the streak from reading 0 just
// because the elder has not been active in the still-unfinished current day.
function streakEndingToday(activeDays: Set<string>): number {
  let cursor = startOfDay(new Date());
  if (!activeDays.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeProgress(raw: RawProgress): ProgressResponse {
  const today = startOfDay(new Date());

  const exerciseDays = new Set(raw.exercise_logs.map((l) => dayKey(new Date(l.completed_at))));
  const medDays = new Set(raw.medication_logs.map((l) => dayKey(new Date(l.taken_at))));
  const chairDays = new Set(raw.chair_test_results.map((c) => dayKey(new Date(c.recorded_at))));
  const engagementDays = new Set<string>([...exerciseDays, ...medDays, ...chairDays]);

  const chair_tests = [...raw.chair_test_results]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .slice(-CHAIR_CHART_CAP)
    .map((c) => ({ reps: c.reps, recorded_at: c.recorded_at }));

  const exercise_current_streak = streakEndingToday(exerciseDays);
  const engagement_streak_days = streakEndingToday(engagementDays);

  // Current calendar week, Monday -> Sunday. Days after today read as 'future'.
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = addDays(today, -mondayOffset);
  const this_week: ProgressWeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    const key = dayKey(d);
    let status: ProgressWeekDay['status'];
    if (d.getTime() > today.getTime()) status = 'future';
    else status = exerciseDays.has(key) ? 'done' : 'missed';
    return { date: key, status };
  });

  const exercise_history = Array.from({ length: EXERCISE_HISTORY_DAYS }, (_, i) => {
    const d = addDays(today, -(EXERCISE_HISTORY_DAYS - 1 - i));
    const key = dayKey(d);
    return { date: key, completed: exerciseDays.has(key) };
  });

  const activeMeds = raw.medications.filter((m) => m.active);
  const scheduledOn = (d: Date): number => {
    const nextDayStart = addDays(startOfDay(d), 1).getTime();
    let count = 0;
    for (const med of activeMeds) {
      if (new Date(med.created_at).getTime() < nextDayStart) count += med.schedule_times.length;
    }
    return count;
  };

  const logsByDay = new Map<string, number>();
  for (const log of raw.medication_logs) {
    const key = dayKey(new Date(log.taken_at));
    logsByDay.set(key, (logsByDay.get(key) ?? 0) + 1);
  }

  const medication_adherence_trend = Array.from({ length: MED_TREND_DAYS }, (_, i) => {
    const d = addDays(today, -(MED_TREND_DAYS - 1 - i));
    const key = dayKey(d);
    const scheduled = scheduledOn(d);
    const taken = Math.min(logsByDay.get(key) ?? 0, scheduled);
    return { date: key, taken, scheduled };
  });

  let last7d_taken = 0;
  let last7d_scheduled = 0;
  for (let i = 0; i < ADHERENCE_WINDOW_DAYS; i += 1) {
    const d = addDays(today, -i);
    const scheduled = scheduledOn(d);
    last7d_taken += Math.min(logsByDay.get(dayKey(d)) ?? 0, scheduled);
    last7d_scheduled += scheduled;
  }
  const medPct = last7d_scheduled > 0 ? Math.round((last7d_taken / last7d_scheduled) * 100) : 0;

  const latestReps = chair_tests.length ? chair_tests[chair_tests.length - 1].reps : 0;
  const chairScore = clampPct((latestReps / CHAIR_BENCHMARK_REPS) * 100);
  const exerciseScore = clampPct((exercise_current_streak / EXERCISE_STREAK_BENCHMARK_DAYS) * 100);
  const medScore = last7d_scheduled > 0 ? clampPct((last7d_taken / last7d_scheduled) * 100) : 0;
  const overall_progress_pct = Math.round((chairScore + exerciseScore + medScore) / 3);

  return {
    chair_test_results: raw.chair_test_results,
    exercise_logs: raw.exercise_logs,
    medications: raw.medications,
    medication_logs: raw.medication_logs,
    overall_progress_pct,
    engagement_streak_days,
    exercise: { current_streak_days: exercise_current_streak, this_week },
    chair_tests,
    exercise_history,
    medication_adherence: { last7d_taken, last7d_scheduled, pct: medPct },
    medication_adherence_trend,
  };
}
