import { Section } from '../types/section.ts';

/**
 * Sections re-rendered after every cart mutation. Each `id` must also be the
 * DOM id of the section root, otherwise the section is skipped as off-page.
 * Shopify bundles at most five sections per request.
 */
export const cartSections: Section[] = [
  {
    id: 'cart-drawer',
    selectors: ['.js-cart-header', '.js-cart-items', '.js-cart-footer'],
  },
  {
    id: 'cart',
    selectors: ['.js-cart-items', '.js-cart-footer'],
  },
  {
    id: 'cart-count-bubble',
  },
];
