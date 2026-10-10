import { Piece } from 'piecesjs';
import { messageFromError } from '../api/errors.ts';
import cart from '../store/cart.ts';
import { show } from '../cinq/toast.ts';
import { AddCartItem } from '../types/cart.ts';
import { VariantBeforeChangeDetail, VariantChangeDetail } from '../types/variant.ts';
import { EVENTS } from '../utils/events.ts';

class AddToCartButton extends Piece {
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

    this.on('submit', this.$form, this.handleSubmit);
    this.on(EVENTS.VARIANT_BEFORE_CHANGE, document.documentElement, this.handleVariantBeforeChange);
    this.on(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  /**
   * While the variant picker loads, the form's `id` still holds the previous
   * variant: block submissions until `VARIANT_CHANGE`. Only buttons with a
   * matching `data-product-id` follow the picker (quick add buttons don't).
   */
  handleVariantBeforeChange = (event: Event): void => {
    const { id } = (event as CustomEvent<VariantBeforeChangeDetail>).detail;

    if (!this.$button || id !== this.productId) return;

    this.setAttribute('aria-busy', 'true');
    this.$button.disabled = true;
  };

  /**
   * Label, `disabled` and `in-stock` come from the element with the same `id` in
   * the rendered section. The form (quantity, properties…) is left untouched.
   * Always leaves the busy state, even when this button isn't in that section.
   */
  handleVariantChange = (event: Event): void => {
    const { html, id } = (event as CustomEvent<VariantChangeDetail>).detail;

    if (!this.$button || id !== this.productId) return;

    const $next = this.id ? html.getElementById(this.id) : null;
    const $nextButton = $next ? (this.domAttr('button', $next) as HTMLButtonElement | null) : null;

    if ($next && $nextButton) {
      this.toggleAttribute('in-stock', $next.hasAttribute('in-stock'));
      this.$button.innerHTML = $nextButton.innerHTML;
    }

    this.$button.disabled = !this.inStock;
    this.removeAttribute('aria-busy');
  };

  handleSubmit(event: Event): void {
    event.preventDefault();

    this.formData = new FormData(this.$form!);

    this.fetch();
  }

  async fetch(): Promise<void> {
    this.$button!.disabled = true;
    this.setAttribute('aria-busy', 'true');

    try {
      const items = this.parseItems();
      await cart.add(items);
      this.dispatchEvents();
    } catch (error) {
      show(messageFromError(error));
    } finally {
      this.$button!.disabled = !this.inStock;
      this.removeAttribute('aria-busy');
    }
  }

  parseItems(): AddCartItem[] {
    const formData = this.formData!;
    const items: AddCartItem[] = [];

    if (formData.has('items[0][id]')) {
      let index = 0;
      while (formData.has(`items[${index}][id]`)) {
        const item: AddCartItem = {
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
      const item: AddCartItem = {
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

  unmount() {
    this.off('submit', this.$form!, this.handleSubmit);
    this.off(EVENTS.VARIANT_BEFORE_CHANGE, document.documentElement, this.handleVariantBeforeChange);
    this.off(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  get productId() {
    return this.getAttribute('data-product-id');
  }

  /** Server-rendered (`in-stock`): re-enables the button after an add, unless sold out. */
  get inStock(): boolean {
    return this.hasAttribute('in-stock');
  }

  get events() {
    return this.getAttribute('data-events') || this.getAttribute('events') || 'DRAWER_OPEN';
  }
}

customElements.define('c-add-to-cart-button', AddToCartButton);
