import { SectionsMarkup } from '../types/section.ts';
import { fetchJson } from './http.ts';

/**
 * Fetch several sections in the cart's Liquid context in a single request.
 * Prefer bundled section rendering on cart mutations when possible.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function fetchSections(ids: string[]): Promise<SectionsMarkup> {
  return fetchJson<SectionsMarkup>(`${routes.cart_url}?sections=${ids.join(',')}`, {
    fallback: 'Failed to fetch sections',
  });
}
