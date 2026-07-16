// Indonesian relative-time and date helpers. Shared so Home, Chat, and Progress
// phrase timestamps the same way. All comparisons are local-calendar based.

const MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return startOfDay(d) === startOfDay(now);
}

export function calendarDaysAgo(iso: string): number {
  const then = startOfDay(new Date(iso));
  const today = startOfDay(new Date());
  return Math.round((today - then) / 86_400_000);
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]}`;
}

// "Baru saja" / "5 menit lalu" / "2 jam lalu" / "Kemarin" / "3 hari lalu" / "12 Jul".
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  if (diffMs < 0) return 'Baru saja';

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;

  const days = calendarDaysAgo(iso);
  if (days === 0) {
    const hours = Math.floor(minutes / 60);
    return `${hours} jam lalu`;
  }
  if (days === 1) return 'Kemarin';
  if (days < 7) return `${days} hari lalu`;
  return formatShortDate(iso);
}
