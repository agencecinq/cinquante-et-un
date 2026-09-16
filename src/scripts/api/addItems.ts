import { ItemsResponse, CartItem, CartSectionsOptions } from '../types/cart.ts';
import { applyCartSections } from './applyCartSections.ts';
import { fetchJson } from './http.ts';

/**
 * Add items to the cart, optionally requesting bundled section rendering.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 */
export async function addItems(
  items: CartItem[],
  options: CartSectionsOptions = {},
): Promise<ItemsResponse> {
  return fetchJson<ItemsResponse>(`${routes.cart_add_url}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(applyCartSections({ items }, options)),
    // User-facing via Toast when Shopify returns no `message`. Candidate for i18n later.
    fallback: 'Failed to add items to cart',
  });
}
