import type {
  Alert,
  ChairTestResult,
  Companion,
  ConversationMessage,
  Elder,
  ExerciseLog,
  FamilyMember,
  Medication,
  MedicationLog,
  TitipanMessage,
} from '../types';

// Demo-quality seed data for mock mode. One elder (Eyang Uti / Sumarni), one
// companion (Mbak Asih), a believable conversation arc, a chair-test
// progression, an exercise streak, mixed medication states, two alerts
// (one live, one resolved), and one delivered titipan. Dates are computed
// relative to "now" so the demo always looks current.

function at(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const FAMILY_MEMBER: FamilyMember = {
  id: 'family-1',
  email: 'dimas.prasetyo@gmail.com',
  name: 'Dimas Prasetyo',
  push_token: null,
  created_at: at(60, 9, 0),
};

export const COMPANIONS: Companion[] = [
  {
    id: 'companion-mbak-asih',
    key: 'mbak_asih',
    display_name: 'Mbak Asih',
    system_prompt_ref: 'mbak_asih_v1',
  },
  {
    id: 'companion-mas-budi',
    key: 'mas_budi',
    display_name: 'Mas Budi',
    system_prompt_ref: 'mas_budi_v1',
  },
];

export const ELDER: Elder = {
  id: 'elder-1',
  family_member_id: FAMILY_MEMBER.id,
  name: 'Sumarni',
  honorific: 'Eyang Uti',
  companion_id: 'companion-mbak-asih',
  health_flags: ['knee_pain', 'hypertension'],
  phone_e164: '+6281234567890',
  created_at: at(60, 9, 0),
  paused: false,
};

let idCounter = 1000;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function buildConversation(): ConversationMessage[] {
  const messages: Array<[number, number, number, 'in' | 'out', string, boolean?]> = [
    // [daysAgo, hour, minute, direction, body, isTitipan]
    [3, 6, 45, 'out', 'Selamat pagi, Eyang Uti! Mbak Asih di sini nemenin Eyang hari ini \u{1F60A} Sudah sarapan belum?'],
    [3, 7, 2, 'in', 'Sudah, tadi makan nasi sama telur'],
    [3, 7, 5, 'out', 'Wah enak itu Eyang! Jangan lupa habis ini olahraga kursi ya, biar kaki makin kuat'],
    [3, 7, 10, 'in', 'Iya nanti abis solat dzuhur'],
    [3, 13, 20, 'out', 'Eyang, sudah olahraga kursi kan tadi? Berapa kali angkat badannya?'],
    [3, 13, 30, 'in', 'Tadi delapan kali mbak, capek juga'],
    [3, 13, 32, 'out', 'Bagus banget Eyang, delapan kali! Pelan-pelan aja yang penting rutin'],
    [2, 6, 40, 'out', 'Selamat pagi Eyang Uti, gimana tidurnya semalam?'],
    [2, 6, 50, 'in', 'Lumayan, agak susah tidur soalnya lutut nyeri'],
    [2, 6, 51, 'out', 'Waduh, lututnya kenapa Eyang? Cerita dong'],
    [2, 6, 55, 'in', 'Kaki Eyang pegal sekali dari tadi pagi, susah jalan'],
    [2, 6, 57, 'out', 'Baik Eyang, nanti Mbak kabari ke Dimas ya biar dicek. Eyang istirahat dulu, jangan dipaksa jalan jauh'],
    [1, 7, 0, 'out', 'Pagi Eyang Uti! Obat darah tingginya sudah diminum belum tadi pagi?'],
    [1, 7, 15, 'in', 'Sudah mbak, abis makan'],
    [1, 7, 16, 'out', 'Sip, sehat terus ya Eyang \u{1F64F}'],
    [1, 7, 20, 'in', 'Aamiin'],
    [1, 14, 0, 'out', 'Eyang, hari ini olahraga kursinya sepuluh kali ya tadi?'],
    [1, 14, 10, 'in', 'Iya sepuluh kali tadi siang'],
    [1, 14, 12, 'out', 'Naik dari kemarin nih Eyang, hebat!'],
    [0, 6, 40, 'out', 'Selamat pagi Eyang Uti! Semangat hari ini ya'],
    [0, 6, 50, 'in', 'Pagi mbak, iya semangat'],
    [0, 7, 5, 'out', 'Obat pagi sudah diminum kan Eyang?'],
    [0, 7, 12, 'in', 'Sudah tadi'],
    [0, 7, 13, 'out', 'Mantap. Nanti siang jangan lupa olahraga kursinya ya'],
    [0, 10, 30, 'out', 'Titipan dari Dimas: "Sehat-sehat terus ya Bu, minggu depan aku pulang kok"'],
  ];

  return messages.map(([daysAgo, hour, minute, direction, body, isTitipan]) => ({
    id: nextId('msg'),
    elder_id: ELDER.id,
    direction,
    body,
    created_at: at(daysAgo, hour, minute),
    is_titipan: isTitipan,
  }));
}

export function buildChairTestResults(): ChairTestResult[] {
  return [
    { id: nextId('chair'), elder_id: ELDER.id, reps: 8, recorded_at: at(21, 13, 30), source: 'chat' },
    { id: nextId('chair'), elder_id: ELDER.id, reps: 10, recorded_at: at(11, 14, 10), source: 'chat' },
    { id: nextId('chair'), elder_id: ELDER.id, reps: 12, recorded_at: at(1, 14, 10), source: 'chat' },
  ];
}

export function buildExerciseLogs(): ExerciseLog[] {
  return [6, 5, 4, 3, 2, 1, 0].map((daysAgo) => ({
    id: nextId('exercise'),
    elder_id: ELDER.id,
    completed_at: at(daysAgo, 13, 30),
    method: daysAgo % 3 === 0 ? 'emoji' : 'reply',
  }));
}

export function buildMedications(): Medication[] {
  return [
    {
      id: 'med-amlodipine',
      elder_id: ELDER.id,
      name: 'Amlodipine',
      dosage: '5mg',
      schedule_times: ['07:00'],
      active: true,
      created_at: at(60, 9, 0),
    },
    {
      id: 'med-metformin',
      elder_id: ELDER.id,
      name: 'Metformin',
      dosage: '500mg',
      schedule_times: ['07:00', '19:00'],
      active: true,
      created_at: at(60, 9, 0),
    },
    {
      id: 'med-vitamind',
      elder_id: ELDER.id,
      name: 'Vitamin D',
      dosage: '1000 IU',
      schedule_times: ['08:00'],
      active: true,
      created_at: at(30, 9, 0),
    },
  ];
}

export function buildMedicationLogs(): MedicationLog[] {
  return [
    // Amlodipine: confirmed today
    { id: nextId('medlog'), medication_id: 'med-amlodipine', elder_id: ELDER.id, taken_at: at(0, 7, 10), method: 'reply' },
    // Metformin: morning dose confirmed, evening dose still unconfirmed today
    { id: nextId('medlog'), medication_id: 'med-metformin', elder_id: ELDER.id, taken_at: at(0, 7, 12), method: 'reply' },
    { id: nextId('medlog'), medication_id: 'med-metformin', elder_id: ELDER.id, taken_at: at(1, 19, 5), method: 'emoji' },
    // Vitamin D: no log today at all (unconfirmed)
  ];
}

export function buildAlerts(): Alert[] {
  return [
    {
      id: 'alert-pain',
      elder_id: ELDER.id,
      type: 'pain_mention',
      payload: { quote: 'Kaki Eyang pegal sekali dari tadi pagi, susah jalan' },
      created_at: at(2, 6, 55),
      resolved_at: null,
    },
    {
      id: 'alert-no-response',
      elder_id: ELDER.id,
      type: 'no_response',
      payload: {},
      created_at: at(9, 20, 0),
      resolved_at: at(8, 10, 0),
    },
  ];
}

export function buildTitipan(): TitipanMessage[] {
  return [
    {
      id: 'titipan-1',
      elder_id: ELDER.id,
      family_member_id: FAMILY_MEMBER.id,
      body: 'Sehat-sehat terus ya Bu, minggu depan aku pulang kok',
      delivered_at: at(0, 10, 30),
      created_at: at(0, 8, 0),
    },
  ];
}
