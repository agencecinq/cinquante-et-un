import { CartSectionsOptions, CartSnapshot } from '../types/cart.ts';
import { fetchJson } from './http.ts';
import { withCartSections } from './withCartSections.ts';

export type UpdateCartPayload = {
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
export async function updateCart(
  payload: UpdateCartPayload,
  options: CartSectionsOptions = {},
): Promise<CartSnapshot> {
  return fetchJson<CartSnapshot>(`${routes.cart_update_url}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withCartSections(payload, options)),
    fallback: 'Failed to update cart',
  });
}
