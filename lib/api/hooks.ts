import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { setToken } from '@/lib/auth/token';
import * as api from './endpoints';
import { queryKeys } from './keys';
import type {
  ConversationQuery,
  CreateElderRequest,
  CreateMedicationRequest,
  CreateTitipanRequest,
  LoginRequest,
  RegisterRequest,
  ResolveAlertRequest,
  UpdateElderRequest,
  UpdateFamilyMemberRequest,
  UpdateMedicationRequest,
} from './types';

// Screens consume only these hooks — never call lib/api/endpoints.ts directly,
// so caching/invalidation stays consistent (BACKLOG M0.3).

// ---- Queries ----

export function useElders() {
  return useQuery({ queryKey: queryKeys.elders.list(), queryFn: api.getElders });
}

export function useConversation(elderId: string, params: ConversationQuery = {}) {
  return useQuery({
    queryKey: [...queryKeys.conversation.all(elderId), params],
    queryFn: () => api.getConversation(elderId, params),
    enabled: Boolean(elderId),
  });
}

export function useProgress(elderId: string) {
  return useQuery({
    queryKey: queryKeys.progress.detail(elderId),
    queryFn: () => api.getProgress(elderId),
    enabled: Boolean(elderId),
  });
}

export function useMedications(elderId: string) {
  return useQuery({
    queryKey: queryKeys.medications.all(elderId),
    queryFn: () => api.getMedications(elderId),
    enabled: Boolean(elderId),
  });
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts.all(), queryFn: api.getAlerts });
}

export function useTitipanList(elderId: string) {
  return useQuery({
    queryKey: queryKeys.titipan.all(elderId),
    queryFn: () => api.getTitipan(elderId),
    enabled: Boolean(elderId),
  });
}

export function useFamilyMember() {
  return useQuery({ queryKey: queryKeys.familyMember.me(), queryFn: api.getFamilyMember });
}

// ---- Mutations ----

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => api.login(body),
    onSuccess: async (data) => {
      await setToken(data.token);
      queryClient.setQueryData(queryKeys.familyMember.me(), data.family_member);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => api.register(body),
    onSuccess: async (data) => {
      await setToken(data.token);
      queryClient.setQueryData(queryKeys.familyMember.me(), data.family_member);
    },
  });
}

export function useCreateElder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateElderRequest) => api.createElder(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.elders.all() }),
  });
}

export function useUpdateElder(elderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateElderRequest) => api.updateElder(elderId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.elders.all() }),
  });
}

export function useSendTitipan(elderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTitipanRequest) => api.createTitipan(elderId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.titipan.all(elderId) }),
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, body }: { alertId: string; body?: ResolveAlertRequest }) =>
      api.resolveAlert(alertId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all() }),
  });
}

export function useCreateMedication(elderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMedicationRequest) => api.createMedication(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.medications.all(elderId) }),
  });
}

export function useUpdateMedication(elderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medicationId, body }: { medicationId: string; body: UpdateMedicationRequest }) =>
      api.updateMedication(medicationId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.medications.all(elderId) }),
  });
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFamilyMemberRequest) => api.updateFamilyMember(body),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.familyMember.me(), data),
  });
}
