import type { CompanionKey } from '@/lib/api/types';
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
