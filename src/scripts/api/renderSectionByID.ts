import { fetchSectionByID } from './fetchSectionByID.ts';
import { Section } from '../types/section.ts';
import { swapGlobal, swapRoot } from './swapSection.ts';

/**
 * Fetch a single section in the Liquid context of `url` and swap matching
 * selectors into the DOM. Defaults to the cart URL (legacy cart refresh).
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export async function renderSectionByID(
  section: Section,
  url: string = routes.cart_url,
): Promise<void> {
  try {
    const html = await fetchSectionByID(url, section.id);

    if (section.selectors?.length) {
      swapGlobal(html, section.selectors);
      return;
    }

    swapRoot(html, section.id);
  } catch (error) {
    console.error('Error rendering section:', error);
  }
}
