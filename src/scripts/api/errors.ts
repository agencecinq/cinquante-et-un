/**
 * Typed failure from a Shopify Ajax / Section Rendering request.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly payload?: unknown;

  constructor(message: string, status = 0, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Best-effort user-facing message from an unknown thrown value.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }

  return String(error ?? 'Unknown error');
}

export function messageFromPayload(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.description ?? record.errors;
    if (typeof message === 'string' && message.trim()) return message;
    if (message != null) return String(message);
  }
  return fallback;
}
