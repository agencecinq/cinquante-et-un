import { Piece } from 'piecesjs';
import { EVENTS } from '@agencecinq/utils';
import { formatCurrency } from '../utils/format-currency.ts';

interface Variant {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  sku: string;
  requires_shipping: boolean;
  taxable: boolean;
  featured_image: string | null;
  available: boolean;
  name: string;
  public_title: string;
  options: string[];
  price: number;
  weight: number;
  compare_at_price: number | null;
  inventory_management: string;
  barcode: string;
  quantity_rule: {
    min: number;
    max: number | null;
    increment: number;
  };
}

export class VariantsPicker extends Piece {
  private $input: HTMLInputElement | null = null;
  private $options: HTMLElement[] = [];
  private variants: Variant[] = [];

  constructor() {
    super('VariantsPicker');
  }

  mount() {
    this.$input = this.domAttr('variant-id') as HTMLInputElement | null;
    this.variants = JSON.parse(this.getAttribute('data-variants') || '[]');
    this.$options = Array.from(this.querySelectorAll('[data-dom="option"]'));

    this.on('change', this, this.handleChange);
    this.update();
  }

  handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (input.type !== 'radio' || !input.matches('[data-dom="option-value"]')) return;

    const $value = input.closest('[data-dom="option"]')?.querySelector('[data-dom="value"]');
    if ($value && input.checked) {
      $value.textContent = input.value;
    }

    this.updateVariant();
  };

  getSelectedOptions() {
    const selectedOptions: Record<string, string> = {};

    this.$options.forEach(($option) => {
      const { position } = $option.dataset;
      const $checked = $option.querySelector<HTMLInputElement>('[data-dom="option-value"]:checked');

      if (position && $checked?.value) {
        selectedOptions[`option${position}`] = $checked.value;
      }
    });

    return selectedOptions;
  }

  find(options: Record<string, string | null>): Variant | undefined {
    return this.variants.find((variant) => {
      return Object.keys(options).every((key) => {
        return variant[key as keyof Variant] === options[key];
      });
    });
  }

  update() {
    const selectedOptions = this.getSelectedOptions();

    this.$options.forEach(($option) => {
      const { position } = $option.dataset;
      if (!position) return;

      $option.querySelectorAll<HTMLInputElement>('[data-dom="option-value"]').forEach((input) => {
        const test = { ...selectedOptions, [`option${position}`]: input.value };
        const variant = this.find(test);

        input.disabled = !(variant?.available ?? false);
      });
    });
  }

  updateVariant() {
    const selectedOptions = this.getSelectedOptions();
    const variant = this.find(selectedOptions);

    if (variant && this.$input) {
      this.$input.value = String(variant.id);

      if (this.hasAttribute('data-update-url')) {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', String(variant.id));
        window.history.replaceState({}, '', url.toString());
      }

      const $selectedValue = this.domAttr('selected-value') as HTMLElement | null;
      if ($selectedValue) {
        $selectedValue.textContent = Object.values(selectedOptions).join(' / ');
      }

      const $price = this.domAttr('price') as HTMLElement | null;
      if ($price) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          $price.innerHTML = `<s>${formatCurrency(variant.compare_at_price, Shopify.money_format)}</s>&nbsp;${formatCurrency(variant.price, Shopify.money_format)}`;
        } else {
          $price.innerHTML = formatCurrency(variant.price, Shopify.money_format);
        }
      }

      if (this.getAttribute('data-price')) {
        this.setAttribute('data-price', String(variant.price));
      }

      this.update();
      this.emit(EVENTS.VARIANT_CHANGE, document.documentElement, {
        variant,
        id: this.getAttribute('data-product-id'),
      });
    }
  }

  price() {
    const selectedOptions = this.getSelectedOptions();
    const variant = this.find(selectedOptions);

    return variant ? variant.price : 0;
  }

  unmount() {
    this.off('change', this, this.handleChange);
  }
}

customElements.define('c-variants-picker', VariantsPicker);
