import type { RequestOptions } from '../client';
import type {
  CreateElderRequest,
  CreateMedicationRequest,
  CreateTitipanRequest,
  RegisterRequest,
  UpdateElderRequest,
  UpdateFamilyMemberRequest,
  UpdateMedicationRequest,
} from '../types';
import { mockDelay } from './config';
import { mockStore } from './store';

// Routes apiRequest() calls to the in-memory store instead of the network when
// EXPO_PUBLIC_USE_MOCKS=1. Path patterns mirror lib/api/endpoints.ts exactly.

function match(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const part = patternParts[i];
    if (part.startsWith(':')) {
      params[part.slice(1)] = pathParts[i];
    } else if (part !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export async function mockRequest<T>(path: string, options: RequestOptions): Promise<T> {
  await mockDelay();

  const method = options.method ?? 'GET';
  const body = options.body;
  const query = options.query ?? {};
  let params: Record<string, string> | null;

  if (method === 'POST' && match('/auth/login', path)) {
    return { token: 'mock-token', family_member: mockStore.login() } as unknown as T;
  }
  if (method === 'POST' && match('/auth/register', path)) {
    const req = body as RegisterRequest;
    return { token: 'mock-token', family_member: mockStore.register(req.name, req.email) } as unknown as T;
  }
  if (method === 'GET' && match('/elders', path)) {
    return mockStore.getElders() as unknown as T;
  }
  if (method === 'POST' && match('/elders', path)) {
    return mockStore.createElder(body as CreateElderRequest) as unknown as T;
  }
  if (method === 'PATCH' && (params = match('/elders/:id', path))) {
    return mockStore.updateElder(params.id, body as UpdateElderRequest) as unknown as T;
  }
  if (method === 'GET' && (params = match('/elders/:id/conversation', path))) {
    let messages = mockStore.getConversation(params.id);
    if (query.after) messages = messages.filter((m) => m.created_at > String(query.after));
    if (query.before) messages = messages.filter((m) => m.created_at < String(query.before));
    return messages as unknown as T;
  }
  if (method === 'POST' && (params = match('/elders/:id/titipan', path))) {
    return mockStore.createTitipan(params.id, body as CreateTitipanRequest) as unknown as T;
  }
  if (method === 'GET' && (params = match('/elders/:id/titipan', path))) {
    return mockStore.getTitipan(params.id) as unknown as T;
  }
  if (method === 'GET' && (params = match('/elders/:id/progress', path))) {
    return mockStore.getProgress(params.id) as unknown as T;
  }
  if (method === 'GET' && match('/medications', path)) {
    return mockStore.getMedications(String(query.elder_id ?? '')) as unknown as T;
  }
  if (method === 'POST' && match('/medications', path)) {
    return mockStore.createMedication(body as CreateMedicationRequest) as unknown as T;
  }
  if (method === 'PATCH' && (params = match('/medications/:id', path))) {
    return mockStore.updateMedication(params.id, body as UpdateMedicationRequest) as unknown as T;
  }
  if (method === 'GET' && match('/alerts', path)) {
    return mockStore.getAlerts() as unknown as T;
  }
  if (method === 'PATCH' && (params = match('/alerts/:id', path))) {
    return mockStore.resolveAlert(params.id) as unknown as T;
  }
  if (method === 'GET' && match('/family-members/me', path)) {
    return mockStore.familyMember as unknown as T;
  }
  if (method === 'PATCH' && match('/family-members/me', path)) {
    return mockStore.updateFamilyMember(body as UpdateFamilyMemberRequest) as unknown as T;
  }

  throw new Error(`mock transport: no handler for ${method} ${path}`);
}
