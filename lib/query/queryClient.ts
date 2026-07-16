import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/errors';

// Don't retry 4xx client errors (bad input, auth, not found won't fix itself);
// retry once on network/server errors per UI-UX §2 defaults.
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
