import type { CompanionKey, Religion } from '@/lib/api/types';
import { COMPANION_META, type CompanionMeta } from '@/lib/companions';

// Static content for the setup wizard (M2.1): the honorific presets, the two
// fixed personas (CORE §3), the health-note presets, and the phone helpers that
// compose a local Indonesian number into E.164. Kept out of the screen so the
// step components stay focused on layout.

export const HONORIFIC_OPTIONS = [
  'Eyang Uti',
  'Eyang Kakung',
  'Oma',
  'Opa',
  'Nenek',
  'Kakek',
] as const;

// Persona = shared companion identity (name + avatar, from lib/companions) plus
// the wizard-only copy (personality line + greeting preview).
export type Persona = CompanionMeta & {
  personality: string;
  greeting: (honorific: string) => string;
};

export const PERSONAS: Persona[] = [
  {
    ...COMPANION_META.mbak_asih,
    personality: 'Penyabar dan penuh perhatian, menemani Eyang dengan lembut setiap hari.',
    greeting: (honorific) => `Selamat pagi, ${honorific}! Sudah sarapan belum?`,
  },
  {
    ...COMPANION_META.mas_budi,
    personality: 'Ramah dan penuh semangat, suka mengajak Eyang ngobrol santai dan bergerak.',
    greeting: (honorific) => `Halo, ${honorific}! Gimana kabarnya hari ini? Sudah gerak-gerak ringan belum?`,
  },
];

export function personaByKey(key: CompanionKey): Persona {
  return PERSONAS.find((p) => p.key === key) ?? PERSONAS[0];
}

// Preset health notes: display label the family reads, `code` stored in
// health_flags[] (matches the existing fixture codes like 'knee_pain').
export const HEALTH_PRESETS = [
  { code: 'knee_pain', label: 'Lutut sakit' },
  { code: 'hypertension', label: 'Hipertensi' },
  { code: 'diabetes', label: 'Diabetes' },
  { code: 'gout', label: 'Asam urat' },
  { code: 'high_cholesterol', label: 'Kolesterol' },
  { code: 'insomnia', label: 'Susah tidur' },
] as const;

const HEALTH_LABEL_BY_CODE = new Map<string, string>(HEALTH_PRESETS.map((p) => [p.code, p.label]));

// Custom flags are stored verbatim (their own text); presets map back to a label.
export function healthFlagLabel(code: string): string {
  return HEALTH_LABEL_BY_CODE.get(code) ?? code;
}

// Personalization presets (M-personalize): what the companion can use for small
// talk, what to steer toward, and what to steer away from. Same code/label,
// verbatim-custom pattern as health flags above.
export const HOBBY_PRESETS = [
  { code: 'berkebun', label: 'Berkebun' },
  { code: 'memasak', label: 'Memasak' },
  { code: 'menjahit', label: 'Menjahit/merajut' },
  { code: 'jalan_pagi', label: 'Jalan pagi' },
  { code: 'menonton_tv', label: 'Menonton TV' },
  { code: 'mendengarkan_radio', label: 'Mendengarkan radio' },
  { code: 'momong_cucu', label: 'Momong cucu' },
  { code: 'mengaji', label: 'Mengaji/ibadah' },
] as const;

export const TOPIC_PRESETS = [
  { code: 'cucu', label: 'Cucu' },
  { code: 'keluarga', label: 'Keluarga' },
  { code: 'masakan', label: 'Masakan' },
  { code: 'kenangan_masa_muda', label: 'Kenangan masa muda' },
  { code: 'tanaman', label: 'Tanaman' },
  { code: 'berita', label: 'Berita' },
] as const;

// Sensitive by design: grief/loss and money are the two most common triggers
// families flag, kept as presets so they don't have to be typed out.
export const AVOID_TOPIC_PRESETS = [
  { code: 'almarhum_pasangan', label: 'Almarhum suami/istri' },
  { code: 'kematian', label: 'Kematian/duka' },
  { code: 'uang_warisan', label: 'Uang/warisan' },
  { code: 'penyakit_berat', label: 'Penyakit berat' },
] as const;

function labelFromPresets(presets: readonly { code: string; label: string }[]) {
  const byCode = new Map(presets.map((p) => [p.code, p.label]));
  return (code: string) => byCode.get(code) ?? code;
}

export const hobbyLabel = labelFromPresets(HOBBY_PRESETS);
export const topicLabel = labelFromPresets(TOPIC_PRESETS);
export const avoidTopicLabel = labelFromPresets(AVOID_TOPIC_PRESETS);

export const RELIGION_OPTIONS: { code: Religion; label: string }[] = [
  { code: 'islam', label: 'Islam' },
  { code: 'kristen', label: 'Kristen' },
  { code: 'katolik', label: 'Katolik' },
  { code: 'lainnya', label: 'Lainnya' },
];

// Phone: the user types a local number (may start with 0); we compose +62...
// stripping the leading zero, per the handoff contract.
export function normalizeLocalPhone(input: string): string {
  return input.replace(/\D/g, '').replace(/^0+/, '');
}

export function validatePhone(input: string): string | undefined {
  const local = normalizeLocalPhone(input);
  if (!local) return 'Nomor WhatsApp wajib diisi';
  if (local.length < 8 || local.length > 13) return 'Nomor WhatsApp belum benar';
  return undefined;
}

export function composeE164(input: string): string {
  return `+62${normalizeLocalPhone(input)}`;
}

// Display an E.164 number back as "+62 812-3456-7890"-ish for the confirm screen.
export function formatPhoneDisplay(input: string): string {
  const local = normalizeLocalPhone(input);
  return local ? `+62 ${local}` : '';
}
