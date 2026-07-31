import { Section } from '../types/section.ts';

const sections: Section[] = [
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

export default sections;
