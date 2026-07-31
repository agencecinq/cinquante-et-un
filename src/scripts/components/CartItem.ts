import { Piece } from 'piecesjs';
import cart from '../store/cart.ts';
import sections from '../utils/sections.ts';

class CartItem extends Piece {
  static observedAttributes = ['loading'];

  $input!: HTMLInputElement;
  $remove!: HTMLButtonElement;

  constructor() {
    super('CartItem');
    this.setAttribute('loading', 'false');
  }

  mount() {
    this.$input = this.domAttr('input') as HTMLInputElement;
    this.$remove = this.domAttr('remove') as HTMLButtonElement;

    this.on('change', this.$input, this.handleChange);
    this.on('click', this.$remove, this.handleClick);
  }

  handleClick(event: Event): void {
    event.preventDefault();
    this.fetch(0);
  }

  handleChange(event: Event): void {
    event.preventDefault();
    this.fetch(parseInt(this.$input.value, 10) || 0);
  }

  async fetch(quantity: number) {
    this.loading = 'true';

    try {
      await cart.update(
        { [this.itemId]: quantity },
        {
          sections: this.sections.map(({ id }) => id),
          sections_url: window.location.pathname,
        },
      );
    } catch (error) {
      this.call('toggle', { content: error }, 'Toast');
    } finally {
      this.loading = 'false';
    }
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
  }

  unmount() {
    this.off('change', this.$input, this.handleChange);
    this.off('click', this.$remove, this.handleClick);
  }

  get itemId() {
    return this.dataset.itemId || '';
  }

  get loading() {
    return this.getAttribute('loading') ?? 'false';
  }

  set loading(value: string) {
    this.setAttribute('loading', value);
  }

  get sections() {
    return sections;
  }
}

customElements.define('c-cart-item', CartItem);
