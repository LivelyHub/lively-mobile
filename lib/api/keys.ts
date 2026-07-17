// Query key factory. Keep keys hierarchical so invalidating `elders.all()` also
// covers `elders.detail(id)` etc. Screens must only import from here, never
// hand-roll a key array, so invalidation stays consistent across the app.

export const queryKeys = {
  elders: {
    all: () => ['elders'] as const,
    list: () => [...queryKeys.elders.all(), 'list'] as const,
    detail: (elderId: string) => [...queryKeys.elders.all(), 'detail', elderId] as const,
  },
  conversation: {
    all: (elderId: string) => ['conversation', elderId] as const,
  },
  progress: {
    detail: (elderId: string) => ['progress', elderId] as const,
  },
  report: {
    detail: (elderId: string, period: string) => ['report', elderId, period] as const,
  },
  medications: {
    all: (elderId: string) => ['medications', elderId] as const,
  },
  alerts: {
    all: () => ['alerts'] as const,
  },
  titipan: {
    all: (elderId: string) => ['titipan', elderId] as const,
  },
  familyMember: {
    me: () => ['familyMember', 'me'] as const,
  },
} as const;
