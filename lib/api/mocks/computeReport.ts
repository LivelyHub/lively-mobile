import type {
  ChairTestResult,
  ExerciseLog,
  Medication,
  MedicationLog,
  PerformanceReport,
  ReportPeriod,
} from '../types';

// Stands in for the backend's GET /elders/:id/report (M11.1, CORE §7). Rolls the
// same four raw tables up over a 7- or 30-day window. Copy always leads positive;
// areas_needing_support is phrased as gentle suggestions, never an alarm.

type RawReport = {
  chair_test_results: ChairTestResult[];
  exercise_logs: ExerciseLog[];
  medications: Medication[];
  medication_logs: MedicationLog[];
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function computeReport(
  raw: RawReport,
  period: ReportPeriod,
  honorific: string,
): PerformanceReport {
  const days = period === 'week' ? 7 : 30;
  const today = startOfDay(new Date());
  const start = addDays(today, -(days - 1));
  const inRange = (iso: string) => {
    const t = startOfDay(new Date(iso)).getTime();
    return t >= start.getTime() && t <= today.getTime();
  };
  const periodWord = period === 'week' ? 'minggu' : 'bulan';

  const exerciseDays = new Set(
    raw.exercise_logs.filter((l) => inRange(l.completed_at)).map((l) => dayKey(new Date(l.completed_at))),
  );
  const medDays = new Set(
    raw.medication_logs.filter((l) => inRange(l.taken_at)).map((l) => dayKey(new Date(l.taken_at))),
  );
  const chairInRange = raw.chair_test_results
    .filter((c) => inRange(c.recorded_at))
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  const activeDays = new Set<string>([...exerciseDays, ...medDays, ...chairInRange.map((c) => dayKey(new Date(c.recorded_at)))]);

  // Medication adherence over the window.
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
    if (!inRange(log.taken_at)) continue;
    const key = dayKey(new Date(log.taken_at));
    logsByDay.set(key, (logsByDay.get(key) ?? 0) + 1);
  }
  let taken = 0;
  let scheduled = 0;
  for (let i = 0; i < days; i += 1) {
    const d = addDays(today, -i);
    const sched = scheduledOn(d);
    taken += Math.min(logsByDay.get(dayKey(d)) ?? 0, sched);
    scheduled += sched;
  }

  const consistency_pct = pct(activeDays.size, days);
  const exercise_completion_pct = pct(exerciseDays.size, days);
  const medication_adherence_pct = pct(taken, scheduled);

  const chairFirst = chairInRange[0]?.reps ?? null;
  const chairLatest = chairInRange.length ? chairInRange[chairInRange.length - 1].reps : null;
  const chair_test_delta =
    chairInRange.length >= 2 && chairFirst !== null && chairLatest !== null ? chairLatest - chairFirst : null;

  const has_data = activeDays.size > 0;

  // Headline — always positive-leading.
  let headline: string;
  if (!has_data) {
    headline = `Belum cukup data ${periodWord} ini. Ringkasan akan muncul setelah ${honorific} mulai beraktivitas.`;
  } else if (consistency_pct >= 80) {
    headline = `${honorific} sangat konsisten ${periodWord} ini, aktif ${activeDays.size} dari ${days} hari.`;
  } else if (consistency_pct >= 50) {
    headline = `${honorific} cukup aktif ${periodWord} ini, ${activeDays.size} dari ${days} hari.`;
  } else {
    headline = `${honorific} sudah mulai bergerak ${periodWord} ini. Setiap hari aktif itu berarti.`;
  }

  const highlights: string[] = [];
  if (chair_test_delta !== null && chair_test_delta > 0) {
    highlights.push(`Tes kursi naik dari ${chairFirst} ke ${chairLatest} kali, kekuatan kaki membaik.`);
  }
  if (exercise_completion_pct >= 60) {
    highlights.push(`Rajin latihan kursi, ${exerciseDays.size} dari ${days} hari.`);
  }
  if (scheduled > 0 && medication_adherence_pct >= 85) {
    highlights.push(`Obat diminum teratur (${medication_adherence_pct}%).`);
  }
  if (highlights.length === 0 && has_data) {
    highlights.push(`${honorific} tetap terhubung dengan pendamping setiap hari.`);
  }

  const areas_needing_support: string[] = [];
  if (scheduled > 0 && medication_adherence_pct < 70) {
    areas_needing_support.push('Beberapa dosis obat terlewat. Pengingat tambahan mungkin membantu.');
  }
  if (exercise_completion_pct < 40 && has_data) {
    areas_needing_support.push('Latihan kursi sempat jarang. Tidak apa-apa, pelan-pelan saja.');
  }
  if (chair_test_delta !== null && chair_test_delta < 0) {
    areas_needing_support.push('Tes kursi sedikit menurun. Wajar naik-turun, tetap semangat menemani.');
  }

  return {
    period,
    range_start: dayKey(start),
    range_end: dayKey(today),
    has_data,
    headline,
    consistency_pct,
    exercise_completion_pct,
    medication_adherence_pct,
    chair_test_latest: chairLatest,
    chair_test_delta,
    highlights,
    areas_needing_support,
  };
}
