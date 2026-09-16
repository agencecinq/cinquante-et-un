import { Section } from '../types/section.ts';
import { fetchJson, parseHtml } from './http.ts';
import { swapGlobal, swapRoot } from './swapSection.ts';

/**
 * Fetch several sections in a single request and swap them into the DOM.
 * Prefer bundled section rendering on cart mutations when possible.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function renderSections(sections: Section[]): Promise<void> {
  try {
    const ids = sections.map(({ id }) => id).join(',');
    const data = await fetchJson<Record<string, string | null>>(
      `${routes.cart_url}?sections=${ids}`,
      { fallback: 'Failed to fetch sections' },
    );

    for (const section of sections) {
      const markup = data[section.id];
      if (!markup) continue;

      const html = parseHtml(markup);

      if (section.selectors?.length) {
        swapGlobal(html, section.selectors);
      } else {
        swapRoot(html, section.id);
      }
    }
  } catch (error) {
    console.error('Error rendering sections:', error);
  }
}
