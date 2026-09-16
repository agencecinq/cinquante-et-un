import { parseHtml } from './http.ts';
import { swapRoot, swapScoped } from './swapSection.ts';

/**
 * Swap a section returned by Shopify's "bundled" section rendering
 * (the `sections` field from the cart Ajax responses).
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
export function renderBundledSection(
  data: string,
  id: string,
  selectors: string[] | null = null,
): void {
  if (!data) return;

  const html = parseHtml(data);
  const rootSelector = id.startsWith('#') ? id : `#${id}`;
  const source = html.querySelector(rootSelector);

  if (!source) return;

  if (selectors?.length) {
    const liveRoot = document.querySelector(rootSelector);
    // Section may be absent on the current page (e.g. `#cart` outside `/cart`).
    if (!liveRoot) return;

    swapScoped(liveRoot, source, selectors);
    return;
  }

  swapRoot(html, rootSelector);
}
