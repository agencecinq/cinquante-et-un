import { ItemsResponse, CartItem, CartSectionsOptions } from '../types/cart.ts';

/**
 * Add items to the cart, optionally requesting bundled section rendering.
 *
 * @param {CartItem[]} items - The items to add to the cart.
 * @param {CartSectionsOptions} [options] - Bundled section rendering options.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 *
 * @returns {Promise<ItemsResponse>} A promise that resolves to the cart response.
 */
async function addItems(items: CartItem[], options: CartSectionsOptions = {}): Promise<ItemsResponse> {
  const body: Record<string, unknown> = { items };

  if (options.sections) {
    body.sections = Array.isArray(options.sections) ? options.sections.join(',') : options.sections;
  }

  if (options.sections_url) {
    body.sections_url = options.sections_url;
  }

  const response = await fetch(`${Shopify.routes.root}cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data.message || data.errors || 'Failed to add items to cart';
  }

  return data;
}

export default addItems;