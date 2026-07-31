/**
 * Line item for Shopify Cart API (`/cart/add.js`).
 * @see https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 */
export type CartItem = {
  id: string | number;
  quantity: number;
  /** Line item properties. Keys prefixed with `_` are hidden from customers. */
  properties?: Record<string, string>;
};

/**
 * Line item as returned by `/cart.js`.
 * @see https://shopify.dev/docs/api/ajax/reference/cart#get-locale-cart-js
 */
export type CartLineItem = {
  key: string;
  variant_id: number;
  product_id: number;
  quantity: number;
  /** Per-unit price after line-level discounts, in cents. */
  final_price: number;
  /** Total price for this line after line-level discounts, in cents. */
  final_line_price: number;
  /** Per-unit price before line-level discounts, in cents. */
  original_price: number;
  /** Total price for this line before line-level discounts, in cents. */
  original_line_price: number;
  properties?: Record<string, string> | null;
};

/**
 * Cart payload returned by `/cart.js`.
 * @see https://shopify.dev/docs/api/ajax/reference/cart#get-locale-cart-js
 */
export type Cart = {
  token: string;
  item_count: number;
  total_price: number;
  /** Sum of line item prices after item-level discounts, before order discounts. */
  items_subtotal_price: number;
  items: CartLineItem[];
};

/**
 * Cart payload optionally augmented with bundled section markup keyed by
 * section id. This is what flows through the cart store pipeline.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
export type CartSnapshot = Cart & { sections?: Record<string, string> };

/**
 * Options accepted by the cart Ajax helpers to opt-in to bundled section
 * rendering.
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
export type CartSectionsOptions = {
  /** Section ids to render. Accepts a comma-separated string or an array. */
  sections?: string | string[];
  /** URL of the page that hosts the sections (defaults to the current path). */
  sections_url?: string;
};

export type ItemsResponse = Record<string, unknown> & {
  sections?: Record<string, string>;
};
