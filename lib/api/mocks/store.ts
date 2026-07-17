import type {
  Alert,
  ChairTestResult,
  Companion,
  ConversationMessage,
  CreateElderRequest,
  CreateMedicationRequest,
  CreateTitipanRequest,
  Elder,
  ExerciseLog,
  FamilyMember,
  Medication,
  MedicationLog,
  PerformanceReport,
  ProgressResponse,
  ReportPeriod,
  TitipanMessage,
  UpdateElderRequest,
  UpdateFamilyMemberRequest,
  UpdateMedicationRequest,
} from '../types';
import { computeProgress } from './computeProgress';
import { computeReport } from './computeReport';
import { MOCK_EMPTY_ACCOUNT } from './config';
import * as fixtures from './fixtures';

// Single in-memory mutable store backing mock mode, so mutations feel real
// within a session (create elder appears in the list, resolve alert moves it,
// etc.) without needing a real backend. Reset only by reloading the app.

let idCounter = 1;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

class MockStore {
  familyMember: FamilyMember;
  companions: Companion[];
  elders: Elder[];
  conversationsByElder: Map<string, ConversationMessage[]>;
  chairTestsByElder: Map<string, ChairTestResult[]>;
  exerciseLogsByElder: Map<string, ExerciseLog[]>;
  medicationsByElder: Map<string, Medication[]>;
  medicationLogsByElder: Map<string, MedicationLog[]>;
  alerts: Alert[];
  titipanByElder: Map<string, TitipanMessage[]>;

  constructor() {
    this.companions = fixtures.COMPANIONS;

    if (MOCK_EMPTY_ACCOUNT) {
      this.familyMember = { ...fixtures.FAMILY_MEMBER, name: 'Akun Baru' };
      this.elders = [];
      this.conversationsByElder = new Map();
      this.chairTestsByElder = new Map();
      this.exerciseLogsByElder = new Map();
      this.medicationsByElder = new Map();
      this.medicationLogsByElder = new Map();
      this.alerts = [];
      this.titipanByElder = new Map();
      return;
    }

    this.familyMember = fixtures.FAMILY_MEMBER;
    this.elders = [fixtures.ELDER];
    this.conversationsByElder = new Map([[fixtures.ELDER.id, fixtures.buildConversation()]]);
    this.chairTestsByElder = new Map([[fixtures.ELDER.id, fixtures.buildChairTestResults()]]);
    this.exerciseLogsByElder = new Map([[fixtures.ELDER.id, fixtures.buildExerciseLogs()]]);
    this.medicationsByElder = new Map([[fixtures.ELDER.id, fixtures.buildMedications()]]);
    this.medicationLogsByElder = new Map([[fixtures.ELDER.id, fixtures.buildMedicationLogs()]]);
    this.alerts = fixtures.buildAlerts();
    this.titipanByElder = new Map([[fixtures.ELDER.id, fixtures.buildTitipan()]]);
  }

  login(): FamilyMember {
    return this.familyMember;
  }

  register(name: string, email: string): FamilyMember {
    this.familyMember = { ...this.familyMember, name, email };
    return this.familyMember;
  }

  getElders(): Elder[] {
    return this.elders;
  }

  createElder(input: CreateElderRequest): Elder {
    const companion = this.companions.find((c) => c.key === input.companion_key) ?? this.companions[0];
    const elder: Elder = {
      id: nextId('elder'),
      family_member_id: this.familyMember.id,
      name: input.name,
      honorific: input.honorific,
      companion_id: companion.id,
      health_flags: input.health_flags,
      phone_e164: input.phone_e164,
      created_at: new Date().toISOString(),
      paused: false,
    };
    this.elders = [...this.elders, elder];
    this.conversationsByElder.set(elder.id, []);
    this.chairTestsByElder.set(elder.id, []);
    this.exerciseLogsByElder.set(elder.id, []);
    this.medicationsByElder.set(elder.id, []);
    this.medicationLogsByElder.set(elder.id, []);
    this.titipanByElder.set(elder.id, []);
    return elder;
  }

  updateElder(elderId: string, patch: UpdateElderRequest): Elder {
    const elder = this.elders.find((e) => e.id === elderId);
    if (!elder) throw new Error(`mock: elder ${elderId} not found`);
    if (patch.honorific !== undefined) elder.honorific = patch.honorific;
    if (patch.health_flags !== undefined) elder.health_flags = patch.health_flags;
    if (patch.paused !== undefined) elder.paused = patch.paused;
    if (patch.companion_key !== undefined) {
      const companion = this.companions.find((c) => c.key === patch.companion_key);
      if (companion) elder.companion_id = companion.id;
    }
    this.elders = this.elders.map((e) => (e.id === elderId ? elder : e));
    return elder;
  }

  getConversation(elderId: string): ConversationMessage[] {
    return this.conversationsByElder.get(elderId) ?? [];
  }

  createTitipan(elderId: string, body: CreateTitipanRequest): TitipanMessage {
    const titipan: TitipanMessage = {
      id: nextId('titipan'),
      elder_id: elderId,
      family_member_id: this.familyMember.id,
      body: body.body,
      delivered_at: null,
      created_at: new Date().toISOString(),
    };
    const list = this.titipanByElder.get(elderId) ?? [];
    this.titipanByElder.set(elderId, [...list, titipan]);
    return titipan;
  }

  getTitipan(elderId: string): TitipanMessage[] {
    return this.titipanByElder.get(elderId) ?? [];
  }

  getProgress(elderId: string): ProgressResponse {
    // Superset per CORE §7: the raw arrays Home reads plus computed chart fields.
    // computeProgress mirrors the backend's read-time derivation.
    return computeProgress({
      chair_test_results: this.chairTestsByElder.get(elderId) ?? [],
      exercise_logs: this.exerciseLogsByElder.get(elderId) ?? [],
      medications: this.medicationsByElder.get(elderId) ?? [],
      medication_logs: this.medicationLogsByElder.get(elderId) ?? [],
    });
  }

  getReport(elderId: string, period: ReportPeriod): PerformanceReport {
    const elder = this.elders.find((e) => e.id === elderId);
    return computeReport(
      {
        chair_test_results: this.chairTestsByElder.get(elderId) ?? [],
        exercise_logs: this.exerciseLogsByElder.get(elderId) ?? [],
        medications: this.medicationsByElder.get(elderId) ?? [],
        medication_logs: this.medicationLogsByElder.get(elderId) ?? [],
      },
      period,
      elder?.honorific ?? 'Eyang',
    );
  }

  getMedications(elderId: string): Medication[] {
    return this.medicationsByElder.get(elderId) ?? [];
  }

  createMedication(body: CreateMedicationRequest): Medication {
    const medication: Medication = {
      id: nextId('med'),
      elder_id: body.elder_id,
      name: body.name,
      dosage: body.dosage,
      schedule_times: body.schedule_times,
      active: body.active ?? true,
      created_at: new Date().toISOString(),
    };
    const list = this.medicationsByElder.get(body.elder_id) ?? [];
    this.medicationsByElder.set(body.elder_id, [...list, medication]);
    return medication;
  }

  updateMedication(medicationId: string, patch: UpdateMedicationRequest): Medication {
    for (const [elderId, list] of this.medicationsByElder) {
      const medication = list.find((m) => m.id === medicationId);
      if (medication) {
        Object.assign(medication, patch);
        this.medicationsByElder.set(
          elderId,
          list.map((m) => (m.id === medicationId ? medication : m)),
        );
        return medication;
      }
    }
    throw new Error(`mock: medication ${medicationId} not found`);
  }

  getAlerts(): Alert[] {
    return this.alerts;
  }

  resolveAlert(alertId: string): Alert {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error(`mock: alert ${alertId} not found`);
    alert.resolved_at = new Date().toISOString();
    this.alerts = this.alerts.map((a) => (a.id === alertId ? alert : a));
    return alert;
  }

  updateFamilyMember(patch: UpdateFamilyMemberRequest): FamilyMember {
    this.familyMember = { ...this.familyMember, ...patch };
    return this.familyMember;
  }
}

export const mockStore = new MockStore();
