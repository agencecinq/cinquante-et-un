import { fetchHtml } from './http.ts';

/**
 * Fetch a single section's HTML in the Liquid context of `url`.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function fetchSection(url: string, sectionId: string): Promise<string> {
  const endpoint = new URL(url, window.location.origin);
  endpoint.searchParams.set('section_id', sectionId);

  return fetchHtml(`${endpoint.pathname}${endpoint.search}`, {
    fallback: `Failed to fetch section ${sectionId}`,
  });
}
