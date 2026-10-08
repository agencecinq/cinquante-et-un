import { CartSectionsOptions } from '../types/cart.ts';

/** Shopify bundled section rendering accepts at most five section ids. */
export const MAX_CART_SECTIONS = 5;

/**
 * Return a copy of a cart Ajax request body with bundled section-rendering
 * options applied.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
export function withCartSections<T extends object>(
  body: T,
  options: CartSectionsOptions = {},
): T & { sections?: string; sections_url?: string } {
  const result: T & { sections?: string; sections_url?: string } = { ...body };

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

    if (ids.length) result.sections = ids.slice(0, MAX_CART_SECTIONS).join(',');
  }

  if (options.sections_url) {
    result.sections_url = options.sections_url;
  }

  return result;
}
