import { CartSectionsOptions } from '../types/cart.ts';

/** Shopify bundled section rendering accepts at most five section ids. */
export const MAX_CART_SECTIONS = 5;

/**
 * Apply bundled section-rendering options onto a cart Ajax request body.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
export function applyCartSections(
  body: Record<string, unknown>,
  options: CartSectionsOptions = {},
): Record<string, unknown> {
  if (options.sections) {
    const ids = (
      Array.isArray(options.sections) ? options.sections : options.sections.split(',')
    )
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length > MAX_CART_SECTIONS) {
      console.warn(
        `[cart] Shopify accepts at most ${MAX_CART_SECTIONS} sections per request; got ${ids.length}.`,
      );
    }

    body.sections = ids.slice(0, MAX_CART_SECTIONS).join(',');
  }

  if (options.sections_url) {
    body.sections_url = options.sections_url;
  }

  return body;
}
