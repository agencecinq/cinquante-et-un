import { Section } from '../types/section.ts';

/**
 * Fetch several sections in a single request and swap them into the DOM.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
async function renderSections(sections: Section[]): Promise<void> {
  try {
    const ids = sections.map(({ id }) => id).join(',');
    const response = await fetch(`${routes.cart_url}?sections=${ids}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch sections: ${response.status}`);
    }

    const data: Record<string, string> = await response.json();

    for (const section of sections) {
      const markup = data[section.id];

      if (!markup) {
        continue;
      }

      const html = new DOMParser().parseFromString(markup, 'text/html');

      if (section.selectors) {
        for (const selector of section.selectors) {
          const $target = document.querySelector(selector);
          const $source = html.querySelector(selector);

          if ($target && $source) {
            $target.replaceWith($source);
          }
        }
      } else {
        const $target = document.querySelector(`#${section.id}`);
        const $source = html.querySelector(`#${section.id}`);

        if ($target && $source) {
          $target.replaceWith($source);
        }
      }
    }
  } catch (error) {
    console.error('Error rendering sections:', error);
  }
}

export default renderSections;