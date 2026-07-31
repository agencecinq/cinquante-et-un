import { Cart } from '../types/cart.ts';

/**
 * Get the current cart.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#get-locale-cart-js
 *
 * @returns {Promise<Cart>} A promise that resolves to the current cart.
 */
async function getCart(): Promise<Cart> {
  const response = await fetch(`${Shopify.routes.root}cart.js`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw data.message || data.errors || 'Failed to fetch cart';
  }

  return data;
}

export default getCart;
