import { Cart, CartSectionsOptions } from '../types/cart.ts';
import { applyCartSections } from './applyCartSections.ts';
import { fetchJson } from './http.ts';

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
export async function updateItems(
  payload: UpdateItemsPayload,
  options: CartSectionsOptions = {},
): Promise<Cart & { sections?: Record<string, string> }> {
  return fetchJson<Cart & { sections?: Record<string, string> }>(
    `${routes.cart_update_url}.js`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(applyCartSections({ ...payload }, options)),
      fallback: 'Failed to update cart',
    },
  );
}
