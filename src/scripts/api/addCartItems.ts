import { AddCartItemsResponse, CartItem, CartSectionsOptions } from '../types/cart.ts';
import { fetchJson } from './http.ts';
import { withCartSections } from './withCartSections.ts';

/**
 * Add items to the cart, optionally requesting bundled section rendering.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 */
export async function addCartItems(
  items: CartItem[],
  options: CartSectionsOptions = {},
): Promise<AddCartItemsResponse> {
  return fetchJson<AddCartItemsResponse>(`${routes.cart_add_url}.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withCartSections({ items }, options)),
    // User-facing via Toast when Shopify returns no `message`. Candidate for i18n later.
    fallback: 'Failed to add items to cart',
  });
}
