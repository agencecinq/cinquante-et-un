import { Piece } from 'piecesjs';
import { EVENTS } from '../utils/events.ts';
import { VariantBeforeChangeDetail, VariantChangeDetail } from '../types/variant.ts';

/**
 * Product price block. Busy (`aria-busy`) while a variant loads; on
 * `EVENTS.VARIANT_CHANGE`, takes its content from the element with the same
 * `id` in the rendered section, so compare-at, unit price and labels stay
 * Liquid's (`price.html`). Follows the product in `data-product-id`; needs an
 * id unique per section, e.g. `ProductPrice-{{ section.id }}`.
 */
class ProductPrice extends Piece {
  constructor() {
    super('ProductPrice');
  }

  mount() {
    this.on(EVENTS.VARIANT_BEFORE_CHANGE, document.documentElement, this.handleVariantBeforeChange);
    this.on(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  handleVariantBeforeChange = (event: Event) => {
    const { id } = (event as CustomEvent<VariantBeforeChangeDetail>).detail;

    if (id === this.productId) this.setAttribute('aria-busy', 'true');
  };

  handleVariantChange = (event: Event) => {
    const { html, id } = (event as CustomEvent<VariantChangeDetail>).detail;

    if (id !== this.productId) return;

    const $next = this.id ? html.getElementById(this.id) : null;
    if ($next) this.innerHTML = $next.innerHTML;

    this.removeAttribute('aria-busy');
  };

  unmount() {
    this.off(EVENTS.VARIANT_BEFORE_CHANGE, document.documentElement, this.handleVariantBeforeChange);
    this.off(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  get productId() {
    return this.getAttribute('data-product-id');
  }
}

customElements.define('c-product-price', ProductPrice);
