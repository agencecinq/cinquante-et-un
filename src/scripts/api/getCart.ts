import { Cart } from '../types/cart.ts';
import { fetchJson } from './http.ts';

/**
 * Get the current cart.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#get-locale-cart-js
 */
export async function getCart(): Promise<Cart> {
  return fetchJson<Cart>(`${routes.cart_url}.js`, {
    // User-facing via Toast when Shopify returns no `message`. Candidate for i18n later.
    fallback: 'Failed to fetch cart',
  });
}
