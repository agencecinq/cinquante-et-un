import { ApiError, messageFromPayload } from './errors.ts';

type FetchInit = RequestInit & {
  /** Error message used when the response carries none; the status is appended. */
  fallback?: string;
};

/**
 * JSON fetch helper for Shopify Ajax endpoints (`*.js`).
 */
export async function fetchJson<T>(url: string, init: FetchInit = {}): Promise<T> {
  const { fallback = 'Request failed', headers, ...rest } = init;

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      messageFromPayload(payload, `${fallback} (${response.status})`),
      response.status,
      payload,
    );
  }

  return payload as T;
}

/**
 * HTML fetch helper for Section Rendering / Predictive Search.
 */
export async function fetchHtml(url: string, init: FetchInit = {}): Promise<string> {
  const { fallback = 'Request failed', headers, ...rest } = init;

  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'text/html',
      ...headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(`${fallback} (${response.status})`, response.status, text);
  }

  return text;
}
