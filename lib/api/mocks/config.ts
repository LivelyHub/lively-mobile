// Mock mode config. EXPO_PUBLIC_USE_MOCKS=1 turns on the mock transport (see
// ../client.ts); EXPO_PUBLIC_MOCK_EMPTY=1 additionally swaps the seeded dataset
// for a fresh-account variant (no elders yet) so empty states are buildable
// without hand-toggling fixture data.
export const MOCK_EMPTY_ACCOUNT = process.env.EXPO_PUBLIC_MOCK_EMPTY === '1';

export const MOCK_DELAY_MIN_MS = 300;
export const MOCK_DELAY_MAX_MS = 600;

export function mockDelay(): Promise<void> {
  const ms = MOCK_DELAY_MIN_MS + Math.random() * (MOCK_DELAY_MAX_MS - MOCK_DELAY_MIN_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
