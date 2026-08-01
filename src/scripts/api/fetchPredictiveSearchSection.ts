/**
 * Fetch predictive search results rendered as a theme section.
 *
 * Uses the Predictive Search API (`/search/suggest`), not the Section Rendering API.
 * The `predictive_search` Liquid object is only available on the suggest endpoint.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/predictive-search
 */

export interface FetchPredictiveSearchSectionOptions {
  query: string;
  sectionId?: string;
  limit?: number;
  signal?: AbortSignal;
}

export async function fetchPredictiveSearchSection({
  query,
  sectionId = 'predictive-search',
  limit = 8,
  signal,
}: FetchPredictiveSearchSectionOptions): Promise<string> {
  // Shopify Predictive Search requires a non-empty `q`.
  if (!query.trim()) {
    return '';
  }

  const params = new URLSearchParams({
    q: query,
    section_id: sectionId,
    'resources[type]': 'product',
    'resources[limit]': String(limit),
    'resources[limit_scope]': 'each',
    'resources[options][unavailable_products]': 'hide',
    'resources[options][fields]': 'title,product_type,variants.title',
  });

  const response = await fetch(
    `${routes.predictive_search_url}?${params.toString()}`,
    {
      signal,
      headers: { Accept: 'text/html' },
    },
  );

  const html = await response.text();

  if (!response.ok) {
    throw new Error(`Predictive search failed (${response.status}): ${html}`);
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const section = doc.querySelector(`#shopify-section-${sectionId}`);

  return section?.innerHTML.trim() ?? '';
}
