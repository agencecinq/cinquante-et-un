import { Piece } from 'piecesjs';
// Side-effect import: register `c-variants-picker-option` in this chunk
// before the picker mounts and calls methods on its children.
import './VariantsPickerOption.ts';
import type { VariantsPickerOption } from './VariantsPickerOption.ts';
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

function isVariantsPickerOption(element: Element): element is VariantsPickerOption {
  return typeof (element as VariantsPickerOption).getSelectedValue === 'function';
}

export class VariantsPicker extends Piece {
  private $input: HTMLInputElement | null = null;
  private options: VariantsPickerOption[] = [];
  private variants: Variant[] = [];

  constructor() {
    super('VariantsPicker');
  }

  mount() {
    this.$input = this.domAttr('variant-id');
    this.variants = JSON.parse(this.getAttribute('data-variants') || '[]');

    this.options = Array.from(this.querySelectorAll('c-variants-picker-option')).filter(isVariantsPickerOption);

    this.options.forEach((option) => {
      this.on('option:change', option, this.handleOptionChange);
    });

    this.update();
  }

  handleOptionChange = () => {
    this.updateVariant();
  };

  getSelectedOptions() {
    const selectedOptions: Record<string, string> = {};

    this.options.forEach((option) => {
      const { position } = option;
      const value = option.getSelectedValue();

      if (position && value) {
        selectedOptions[`option${position}`] = value;
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

    this.options.forEach((option) => {
      const { position, inputs } = option;
      if (!inputs) return;

      inputs.forEach((input) => {
        const value = input.value;
        const test = { ...selectedOptions, [`option${position}`]: value };
        const variant = this.find(test);

        option.setInputAvailability(value, variant?.available ?? false);
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

      const $selectedValue = this.domAttr('selected-value');
      if ($selectedValue) {
        $selectedValue.textContent = Object.values(selectedOptions).join(' / ');
      }

      const $price = this.domAttr('price');
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
    this.options.forEach((option) => {
      this.off('option:change', option, this.handleOptionChange);
    });
  }
}

customElements.define('c-variants-picker', VariantsPicker);
