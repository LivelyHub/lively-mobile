import { getToken } from '@/lib/auth/token';
import { NetworkError, parseErrorResponse, TimeoutError } from './errors';
import { mockRequest } from './mocks/transport';

// EXPO_PUBLIC_ prefix so Expo inlines these into the client bundle (no app.config
// plumbing needed). CORE.md's shared cross-repo name is BACKEND_API_URL; see
// .env.example for the mapping note.
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL ?? '';
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === '1';

const REQUEST_TIMEOUT_MS = 10_000; // UI-UX §2: no infinite loading, every fetch times out.

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // default true; set false for login/register
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ''), base);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (USE_MOCKS) {
    return mockRequest<T>(path, options);
  }

  const { method = 'GET', body, query, auth = true } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') throw new TimeoutError();
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
