import { ApiError } from './errors.ts';
import { fetchHtml, parseHtml } from './http.ts';

/**
 * Fetch a single section's HTML in the Liquid context of `url`.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function fetchSectionByID(url: string, sectionId: string): Promise<Document> {
  const endpoint = new URL(url, window.location.origin);
  endpoint.searchParams.set('section_id', sectionId);

  try {
    const markup = await fetchHtml(`${endpoint.pathname}${endpoint.search}`);
    return parseHtml(markup);
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ApiError(
        `Failed to fetch section ${sectionId}: ${error.status}`,
        error.status,
        error.payload,
      );
    }
    throw error;
  }
}
