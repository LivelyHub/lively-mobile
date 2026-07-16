// Backend error envelope is not yet pinned down in CORE.md (no error section as of
// this writing) — this parses the common Fastify shape { error, message, fields }
// defensively and falls back to generic text. Revisit once the backend lands and
// CORE.md documents the real envelope.

export type ApiErrorKind =
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'server_error'
  | 'network_error'
  | 'timeout'
  | 'unknown';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorKind;
  readonly fields?: Record<string, string>;

  constructor(message: string, options: { status: number; code: ApiErrorKind; fields?: Record<string, string> }) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.fields = options.fields;
  }
}

// Distinguishable from a normal server error so screens can show the offline
// banner + cached data instead of a full ErrorState (UI-UX §2).
export class NetworkError extends ApiError {
  constructor() {
    super('Tidak ada koneksi internet.', { status: 0, code: 'network_error' });
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super('Permintaan butuh waktu terlalu lama. Coba lagi ya.', { status: 0, code: 'timeout' });
    this.name = 'TimeoutError';
  }
}

function codeFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 422 || status === 400) return 'validation_error';
  if (status >= 500) return 'server_error';
  return 'unknown';
}

export async function parseErrorResponse(response: Response): Promise<ApiError> {
  const status = response.status;
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const record = (body && typeof body === 'object' ? (body as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;
  const code = (typeof record.error === 'string' ? record.error : undefined) as ApiErrorKind | undefined;
  const message =
    (typeof record.message === 'string' && record.message) || 'Terjadi kesalahan. Coba lagi ya.';
  const fields =
    record.fields && typeof record.fields === 'object'
      ? (record.fields as Record<string, string>)
      : undefined;

  return new ApiError(message, { status, code: code ?? codeFromStatus(status), fields });
}
