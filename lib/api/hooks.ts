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
  Medication,
  RegisterRequest,
  ReportPeriod,
  ResolveAlertRequest,
  UpdateElderRequest,
  UpdateFamilyMemberRequest,
  UpdateMedicationRequest,
} from './types';

// Screens consume only these hooks — never call lib/api/endpoints.ts directly,
// so caching/invalidation stays consistent (BACKLOG M0.3).

// ---- Queries ----

// Screens may pass a poll interval (Home polls elders + alerts every 60s while
// focused; refetch pauses automatically when the app is backgrounded via the
// AppState-backed focusManager wired in lib/query).
type PollOptions = { refetchInterval?: number };

export function useElders(options: PollOptions = {}) {
  return useQuery({
    queryKey: queryKeys.elders.list(),
    queryFn: api.getElders,
    refetchInterval: options.refetchInterval,
  });
}

export function useConversation(
  elderId: string,
  params: ConversationQuery = {},
  options: PollOptions = {},
) {
  return useQuery({
    queryKey: [...queryKeys.conversation.all(elderId), params],
    queryFn: () => api.getConversation(elderId, params),
    enabled: Boolean(elderId),
    refetchInterval: options.refetchInterval,
  });
}

export function useProgress(elderId: string) {
  return useQuery({
    queryKey: queryKeys.progress.detail(elderId),
    queryFn: () => api.getProgress(elderId),
    enabled: Boolean(elderId),
  });
}

export function useReport(elderId: string, period: ReportPeriod) {
  return useQuery({
    queryKey: queryKeys.report.detail(elderId, period),
    queryFn: () => api.getReport(elderId, period),
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

export function useAlerts(options: PollOptions = {}) {
  return useQuery({
    queryKey: queryKeys.alerts.all(),
    queryFn: api.getAlerts,
    refetchInterval: options.refetchInterval,
  });
}

export function useTitipanList(elderId: string, options: PollOptions = {}) {
  return useQuery({
    queryKey: queryKeys.titipan.all(elderId),
    queryFn: () => api.getTitipan(elderId),
    enabled: Boolean(elderId),
    refetchInterval: options.refetchInterval,
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

// Optimistic active-toggle (BACKLOG M6.1): onMutate cancels + snapshots + applies
// the patch to the cached list immediately (so a Switch flips with no delay),
// onError rolls the snapshot back, onSettled always reconciles with the server.
// This same optimistic path also covers the add/edit form's save (name/dosage/
// schedule_times) since it patches whatever fields are in `body` — callers that
// want a failure toast (the list's toggle) add their own onError at call time,
// which fires after this hook's rollback per TanStack Query v5 mutate() ordering.
export function useUpdateMedication(elderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ medicationId, body }: { medicationId: string; body: UpdateMedicationRequest }) =>
      api.updateMedication(medicationId, body),
    onMutate: async ({ medicationId, body }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.medications.all(elderId) });
      const previous = queryClient.getQueryData<Medication[]>(queryKeys.medications.all(elderId));
      queryClient.setQueryData<Medication[]>(queryKeys.medications.all(elderId), (old) =>
        old?.map((m) => (m.id === medicationId ? { ...m, ...body } : m)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.medications.all(elderId), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.medications.all(elderId) }),
  });
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateFamilyMemberRequest) => api.updateFamilyMember(body),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.familyMember.me(), data),
  });
}
