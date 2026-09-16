import { Piece } from 'piecesjs';
import { EVENTS } from '@agencecinq/utils';
import { errorMessage } from '../api/errors.ts';
import cart from '../store/cart.ts';
import sections from '../utils/sections.ts';
import { show } from '../cinq/toast.ts';
import { CartItem } from '../types/cart.ts';

type VariantChangeDetail = {
  variant?: { available?: boolean };
  id?: string | number;
};

class AddToCartButton extends Piece {
  static get observedAttributes() {
    return ['loading', 'in-stock'];
  }

  $form: HTMLFormElement | null = null;
  $button: HTMLButtonElement | null = null;
  formData: FormData | null = null;

  constructor() {
    super('AddToCartButton');
  }

  mount() {
    const $button = (this.domAttr('button') as HTMLButtonElement) || this.querySelector('button[type="submit"]');
    const $form = this.domAttr('form') as HTMLFormElement;

    if (!$form) {
      throw new Error('AddToCartButton: form element not found');
    }

    if (!$button) {
      throw new Error('AddToCartButton: button element not found');
    }

    this.$button = $button;
    this.$form = $form;

    if (this.getAttribute('data-product-id')) {
      this.on(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
      this.$button.disabled = !this.inStock;
    }

    this.on('submit', this.$form, this.handleSubmit);
  }

  handleVariantChange = (event: Event): void => {
    const { variant, id } = (event as CustomEvent<VariantChangeDetail>).detail ?? {};

    if (!variant || String(id) !== this.getAttribute('data-product-id')) {
      return;
    }

    this.inStock = Boolean(variant.available);
  };

  handleSubmit(event: Event): void {
    event.preventDefault();

    this.formData = new FormData(this.$form!);

    this.fetch();
  }

  async fetch(): Promise<void> {
    this.$button!.disabled = true;
    this.loading = 'true';

    try {
      const items = this.parseItems();
      await cart.add(items, {
        sections: this.sections.map(({ id }) => id),
        sections_url: '/cart',
      });
      this.dispatchEvents();
    } catch (error) {
      show(errorMessage(error));
    } finally {
      this.$button!.disabled = !this.inStock;
      this.loading = 'false';
    }
  }

  parseItems(): CartItem[] {
    const formData = this.formData!;
    const items: CartItem[] = [];

    if (formData.has('items[0][id]')) {
      let index = 0;
      while (formData.has(`items[${index}][id]`)) {
        const item: CartItem = {
          id: formData.get(`items[${index}][id]`) as string,
          quantity: parseInt(formData.get(`items[${index}][quantity]`) as string, 10),
        };

        const properties = this.getProperties(`items[${index}]`);
        if (properties) {
          item.properties = properties;
        }

        items.push(item);
        index += 1;
      }
      return items;
    }

    if (formData.has('id')) {
      const item: CartItem = {
        id: formData.get('id') as string,
        quantity: parseInt(formData.get('quantity') as string, 10) || 1,
      };

      items.push(item);
    }

    return items;
  }

  private getProperties(prefix: string): Record<string, string> | undefined {
    const properties: Record<string, string> = {};
    const needle = `${prefix}[properties][`;

    for (const [key, value] of this.formData!.entries()) {
      if (!key.startsWith(needle) || typeof value !== 'string' || value === '') {
        continue;
      }

      const name = key.slice(needle.length, -1);
      if (name) {
        properties[name] = value;
      }
    }

    return Object.keys(properties).length > 0 ? properties : undefined;
  }

  dispatchEvents() {
    const detail = {
      detail: {
        target: this.$button,
        drawer: 'cart-drawer',
      },
    };

    this.events?.split(',').forEach((type: string) => {
      const event = new CustomEvent(EVENTS[type as keyof typeof EVENTS], detail);
      document.documentElement.dispatchEvent(event);
    });
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === 'loading') {
      if (newValue === 'true') {
        this.style.setProperty('cursor', 'wait');
        this.style.setProperty('opacity', '0.5');
      } else {
        this.style.removeProperty('cursor');
        this.style.removeProperty('opacity');
      }
    }

    if (name === 'in-stock' && this.$button) {
      this.$button.disabled = !this.inStock;
    }
  }

  unmount() {
    if (this.getAttribute('data-product-id')) {
      this.off(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
    }

    this.off('submit', this.$form!, this.handleSubmit);
  }

  get loading() {
    return this.getAttribute('loading') ?? 'false';
  }

  set loading(value: string) {
    this.setAttribute('loading', value);
  }

  get inStock(): boolean {
    return this.hasAttribute('in-stock');
  }

  set inStock(value: boolean) {
    this.toggleAttribute('in-stock', value);
  }

  get events() {
    return this.getAttribute('data-events') || this.getAttribute('events') || 'DRAWER_OPEN';
  }

  get sections() {
    return sections;
  }
}

customElements.define('c-add-to-cart-button', AddToCartButton);
