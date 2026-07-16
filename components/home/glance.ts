import { Ionicons } from '@expo/vector-icons';

import type { ConversationMessage, ProgressResponse } from '@/lib/api/types';
import { isToday } from '@/lib/time';

// "Today at a glance" is derived, not a first-class API field: the elder payload
// has no daily-status rollup, so compute each row from the conversation and
// progress data the contract does expose. Kept pure and separate from the view.
export type GlanceTone = 'positive' | 'neutral' | 'attention';

export type GlanceRowData = {
  key: 'greeting' | 'exercise' | 'medication';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  tone: GlanceTone;
};

// Latest incoming (elder's own) message time, for the card's "last heard from".
export function lastHeardFrom(conversation: ConversationMessage[]): string | null {
  let latest: string | null = null;
  for (const message of conversation) {
    if (message.direction === 'in' && (latest === null || message.created_at > latest)) {
      latest = message.created_at;
    }
  }
  return latest;
}

export function buildGlanceRows(
  conversation: ConversationMessage[],
  progress: ProgressResponse,
): GlanceRowData[] {
  const greetedToday = conversation.some(
    (m) => m.direction === 'in' && isToday(m.created_at),
  );

  const exercisedToday = progress.exercise_logs.some((log) => isToday(log.completed_at));

  const activeMeds = progress.medications.filter((m) => m.active);
  const confirmedMeds = activeMeds.filter((med) =>
    progress.medication_logs.some((log) => log.medication_id === med.id && isToday(log.taken_at)),
  ).length;

  let medValue: string;
  let medTone: GlanceTone;
  if (activeMeds.length === 0) {
    medValue = 'Belum ada obat';
    medTone = 'neutral';
  } else if (confirmedMeds === activeMeds.length) {
    medValue = `${confirmedMeds}/${activeMeds.length} dikonfirmasi`;
    medTone = 'positive';
  } else {
    medValue = `${confirmedMeds}/${activeMeds.length} dikonfirmasi`;
    medTone = 'attention';
  }

  return [
    {
      key: 'greeting',
      icon: 'chatbubble-ellipses-outline',
      label: 'Sapaan pagi',
      value: greetedToday ? 'Sudah menyapa' : 'Belum ada kabar',
      tone: greetedToday ? 'positive' : 'neutral',
    },
    {
      key: 'exercise',
      icon: 'fitness-outline',
      label: 'Olahraga kursi',
      value: exercisedToday ? 'Sudah' : 'Belum',
      tone: exercisedToday ? 'positive' : 'neutral',
    },
    {
      key: 'medication',
      icon: 'medkit-outline',
      label: 'Obat hari ini',
      value: medValue,
      tone: medTone,
    },
  ];
}
