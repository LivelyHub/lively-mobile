import type { ConversationMessage } from '@/lib/api/types';
import { calendarDaysAgo, formatShortDate, isToday } from '@/lib/time';

export type ChatItem =
  | { kind: 'separator'; id: string; label: string }
  | {
      kind: 'message';
      id: string;
      message: ConversationMessage;
      showTime: boolean; // last of a same-direction, same-minute cluster
      startsGroup: boolean; // opens a new direction group (drives spacing above)
    };

function dayLabel(iso: string): string {
  if (isToday(iso)) return 'Hari ini';
  if (calendarDaysAgo(iso) === 1) return 'Kemarin';
  return formatShortDate(iso);
}

function sameMinute(a: string, b: string): boolean {
  return Math.floor(new Date(a).getTime() / 60_000) === Math.floor(new Date(b).getTime() / 60_000);
}

// Build a CHRONOLOGICAL (oldest -> newest) list: a day separator before the first
// message of each calendar day, then that day's messages. The screen reverses the
// whole array for the inverted FlatList (data[0] renders at the bottom), so reading
// the screen top-to-bottom yields oldest-day separator, that day's messages, the
// next day's separator, and so on, with the newest message pinned to the bottom.
// Building chronologically first and reversing once keeps the separator ordering
// obvious instead of reasoning about boundaries in reverse.
export function buildChatItems(messages: ConversationMessage[]): ChatItem[] {
  const items: ChatItem[] = [];
  let prevDayKey: number | null = null;

  messages.forEach((message, i) => {
    const dayKey = calendarDaysAgo(message.created_at);
    const newDay = dayKey !== prevDayKey;
    if (newDay) {
      items.push({ kind: 'separator', id: `sep-${message.id}`, label: dayLabel(message.created_at) });
    }
    prevDayKey = dayKey;

    const prev = messages[i - 1];
    const next = messages[i + 1];
    const startsGroup = newDay || !prev || prev.direction !== message.direction;
    const endsCluster =
      !next ||
      next.direction !== message.direction ||
      calendarDaysAgo(next.created_at) !== dayKey ||
      !sameMinute(next.created_at, message.created_at);

    items.push({
      kind: 'message',
      id: message.id,
      message,
      showTime: endsCluster,
      startsGroup,
    });
  });

  return items;
}
