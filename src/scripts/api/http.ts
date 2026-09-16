import { ApiError, messageFromPayload } from './errors.ts';

type JsonInit = RequestInit & {
  /** Default error message when the response body has no Shopify `message`. */
  fallback?: string;
};

/**
 * JSON fetch helper for Shopify Ajax endpoints (`*.js`).
 */
export async function fetchJson<T>(url: string, init: JsonInit = {}): Promise<T> {
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
export async function fetchHtml(url: string, init: RequestInit = {}): Promise<string> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'text/html',
      ...init.headers,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status, text);
  }

  return text;
}

export function parseHtml(markup: string): Document {
  return new DOMParser().parseFromString(markup, 'text/html');
}
