import { Cart, CartSectionsOptions } from '../types/cart.ts';

export type UpdateItemsPayload = {
  updates?: Record<string, number> | number[];
  note?: string;
  attributes?: Record<string, string>;
};

/**
 * Update multiple cart lines (and optionally cart-level metadata) in a single
 * round trip. Returns the full updated cart, optionally with bundled sections.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-update-js
 */
async function updateItems(
  payload: UpdateItemsPayload,
  options: CartSectionsOptions = {},
): Promise<Cart & { sections?: Record<string, string> }> {
  const body: Record<string, unknown> = { ...payload };

  if (options.sections) {
    body.sections = Array.isArray(options.sections) ? options.sections.join(',') : options.sections;
  }

  if (options.sections_url) {
    body.sections_url = options.sections_url;
  }

  const response = await fetch(`${Shopify.routes.root}cart/update.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data.message || data.errors || 'Failed to update cart';
  }

  return data;
}

export default updateItems;
