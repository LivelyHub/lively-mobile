import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/tokens';
import type { Alert, AlertType } from '@/lib/api/types';

// One visual system for alerts across the Home banner and the Alerts list
// (UI-UX §5). Tiers differ by icon + text too, never color alone.
export type AlertTone = 'danger' | 'warning' | 'info';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TONE_BY_TYPE: Record<AlertType, AlertTone> = {
  emergency: 'danger',
  pain_mention: 'danger',
  dizziness_mention: 'danger',
  medication_missed: 'warning',
  no_response: 'warning',
  missed_days: 'info',
};

const ICON_BY_TYPE: Record<AlertType, IconName> = {
  emergency: 'warning',
  pain_mention: 'medkit',
  dizziness_mention: 'pulse',
  medication_missed: 'medical',
  no_response: 'chatbubble-ellipses',
  missed_days: 'fitness',
};

export const TONE_STYLE: Record<AlertTone, { background: string; accent: string }> = {
  danger: { background: colors.dangerSoft, accent: colors.danger },
  warning: { background: colors.warningSoft, accent: colors.warning },
  info: { background: colors.hairline, accent: colors.textMuted },
};

// Urgency rank for sorting the most important alert to the top of Home.
const TONE_RANK: Record<AlertTone, number> = { danger: 0, warning: 1, info: 2 };

export function alertTone(type: AlertType): AlertTone {
  return TONE_BY_TYPE[type];
}

export function alertIcon(type: AlertType): IconName {
  return ICON_BY_TYPE[type];
}

export function alertHeadline(alert: Alert, honorific: string): string {
  const h = honorific;
  switch (alert.type) {
    case 'emergency':
      return `${h} butuh perhatian sekarang`;
    case 'pain_mention':
      return `${h} menyebut nyeri, lihat pesannya`;
    case 'dizziness_mention':
      return `${h} merasa pusing, lihat pesannya`;
    case 'medication_missed': {
      const name = alert.payload.medication_name ?? 'obat';
      const days = alert.payload.days;
      return days ? `Obat ${name} terlewat ${days} hari` : `Obat ${name} terlewat`;
    }
    case 'no_response':
      return `${h} belum membalas hari ini, mungkin layak ditelepon`;
    case 'missed_days': {
      const days = alert.payload.days ?? 2;
      return `${h} melewatkan latihan ${days} hari`;
    }
    default:
      return `Ada kabar tentang ${h}`;
  }
}

// Most-urgent-first: by tone rank, then most recent.
export function sortAlertsByUrgency(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const rank = TONE_RANK[alertTone(a.type)] - TONE_RANK[alertTone(b.type)];
    if (rank !== 0) return rank;
    return b.created_at.localeCompare(a.created_at);
  });
}

// A short human tier label shown on the detail screen next to the icon.
export const TONE_LABEL: Record<AlertTone, string> = {
  danger: 'Perlu perhatian segera',
  warning: 'Sebaiknya diperhatikan',
  info: 'Sekadar kabar',
};

// The explanatory line on the alert detail screen: what happened, in plain
// Indonesian. Quoted elder words (pain/dizziness/emergency) are rendered
// separately by the detail screen as a blockquote, so this stays contextual.
export function alertDetailBody(alert: Alert, honorific: string): string {
  const h = honorific;
  switch (alert.type) {
    case 'emergency':
      return `${h} mengirim pesan yang butuh perhatian segera. Sebaiknya hubungi ${h} sekarang.`;
    case 'pain_mention':
      return `${h} menyebut rasa nyeri saat mengobrol dengan pendamping. Mungkin baik untuk menelepon dan menanyakan kabarnya.`;
    case 'dizziness_mention':
      return `${h} menyebut rasa pusing saat mengobrol. Menelepon sebentar bisa menenangkan dan memastikan ${h} baik-baik saja.`;
    case 'medication_missed': {
      const name = alert.payload.medication_name ?? 'obat';
      const days = alert.payload.days;
      return days
        ? `Obat ${name} belum dikonfirmasi selama ${days} hari terakhir. Pendamping sudah mengingatkan, tapi mungkin perlu diperiksa.`
        : `Obat ${name} belum dikonfirmasi. Pendamping sudah mengingatkan ${h}.`;
    }
    case 'no_response':
      return `${h} belum membalas sapaan pendamping hari ini. Belum tentu ada apa-apa, tapi menelepon sebentar tidak ada salahnya.`;
    case 'missed_days': {
      const days = alert.payload.days ?? 2;
      return `${h} melewatkan latihan kursi ${days} hari terakhir. Ini hanya catatan ringan, bukan hal yang mendesak.`;
    }
    default:
      return `Ada kabar tentang ${h}.`;
  }
}
