import { Section } from '../types/section.ts';

/**
 * Fetch a single section and swap matching selectors into the DOM.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
async function renderSectionByID(section: Section): Promise<void> {
  try {
    const response = await fetch(`${routes.cart_url}?section_id=${section.id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch section ${section.id}: ${response.status}`);
    }

    const data = await response.text();
    const html = new DOMParser().parseFromString(data, 'text/html');

    if (!section.selectors) {
      return;
    }

    for (const selector of section.selectors) {
      const $target = document.querySelector(selector);
      const $source = html.querySelector(selector);

      if ($target && $source) {
        $target.replaceWith($source);
      }
    }
  } catch (error) {
    console.error('Error rendering section:', error);
  }
}

export default renderSectionByID;