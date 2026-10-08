import { fetchJson } from './http.ts';

/**
 * Fetch several sections in the cart's Liquid context in a single request.
 * Returns markup keyed by section id (`null` when a section failed to render).
 * Prefer bundled section rendering on cart mutations when possible.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function fetchSections(ids: string[]): Promise<Record<string, string | null>> {
  return fetchJson<Record<string, string | null>>(
    `${routes.cart_url}?sections=${ids.join(',')}`,
    { fallback: 'Failed to fetch sections' },
  );
}
