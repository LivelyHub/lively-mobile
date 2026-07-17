import { apiRequest } from './client';
import type {
  Alert,
  AuthResponse,
  ConversationMessage,
  ConversationQuery,
  CreateElderRequest,
  CreateMedicationRequest,
  CreateTitipanRequest,
  Elder,
  FamilyMember,
  LoginRequest,
  Medication,
  PerformanceReport,
  ProgressResponse,
  RegisterRequest,
  ReportPeriod,
  ResolveAlertRequest,
  TitipanMessage,
  UpdateElderRequest,
  UpdateFamilyMemberRequest,
  UpdateMedicationRequest,
} from './types';

// Auth — ANTICIPATED, see types.ts. `auth: false` because there is no token yet.
export function login(body: LoginRequest) {
  return apiRequest<AuthResponse>('/auth/login', { method: 'POST', body, auth: false });
}

export function register(body: RegisterRequest) {
  return apiRequest<AuthResponse>('/auth/register', { method: 'POST', body, auth: false });
}

// Elders
export function getElders() {
  return apiRequest<Elder[]>('/elders'); // ANTICIPATED list endpoint
}

export function createElder(body: CreateElderRequest) {
  return apiRequest<Elder>('/elders', { method: 'POST', body });
}

export function updateElder(elderId: string, body: UpdateElderRequest) {
  return apiRequest<Elder>(`/elders/${elderId}`, { method: 'PATCH', body });
}

// Conversation
export function getConversation(elderId: string, query: ConversationQuery = {}) {
  return apiRequest<ConversationMessage[]>(`/elders/${elderId}/conversation`, {
    query: query as Record<string, string | number | boolean | undefined>,
  });
}

// Titipan
export function createTitipan(elderId: string, body: CreateTitipanRequest) {
  return apiRequest<TitipanMessage>(`/elders/${elderId}/titipan`, { method: 'POST', body });
}

export function getTitipan(elderId: string) {
  return apiRequest<TitipanMessage[]>(`/elders/${elderId}/titipan`); // ANTICIPATED list
}

// Progress
export function getProgress(elderId: string) {
  return apiRequest<ProgressResponse>(`/elders/${elderId}/progress`); // ANTICIPATED
}

// Performance report (M11.1)
export function getReport(elderId: string, period: ReportPeriod) {
  return apiRequest<PerformanceReport>(`/elders/${elderId}/report`, { query: { period } }); // ANTICIPATED
}

// Medications
export function getMedications(elderId: string) {
  return apiRequest<Medication[]>('/medications', { query: { elder_id: elderId } }); // ANTICIPATED
}

export function createMedication(body: CreateMedicationRequest) {
  return apiRequest<Medication>('/medications', { method: 'POST', body });
}

export function updateMedication(medicationId: string, body: UpdateMedicationRequest) {
  return apiRequest<Medication>(`/medications/${medicationId}`, { method: 'PATCH', body }); // ANTICIPATED
}

// Alerts
export function getAlerts() {
  return apiRequest<Alert[]>('/alerts'); // ANTICIPATED
}

export function resolveAlert(alertId: string, body: ResolveAlertRequest = { resolved: true }) {
  return apiRequest<Alert>(`/alerts/${alertId}`, { method: 'PATCH', body }); // ANTICIPATED
}

// Family member
export function getFamilyMember() {
  return apiRequest<FamilyMember>('/family-members/me'); // ANTICIPATED
}

export function updateFamilyMember(body: UpdateFamilyMemberRequest) {
  return apiRequest<FamilyMember>('/family-members/me', { method: 'PATCH', body }); // ANTICIPATED
}
