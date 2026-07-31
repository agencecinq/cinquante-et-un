import { Piece } from 'piecesjs';
import { EVENTS } from '@agencecinq/utils';
import { formatCurrency } from '../utils/format-currency.ts';

class Price extends Piece {
  constructor() {
    super('Price');
  }

  mount() {
    this.on(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  handleVariantChange(event: CustomEvent) {
    const { variant, id } = event.detail;

    if (id !== this.getAttribute('data-product-id')) {
      return;
    }

    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      this.innerHTML = `<s>${formatCurrency(variant.compare_at_price, Shopify.money_format)}</s>&nbsp;${formatCurrency(variant.price, Shopify.money_format)}`;
    } else {
      this.innerHTML = formatCurrency(variant.price, Shopify.money_format);
    }
  }

  unmount() {
    this.off(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }
}

customElements.define('c-price', Price);
