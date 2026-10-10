import { Piece } from 'piecesjs';
import { messageFromError } from '../api/errors.ts';
import cart from '../store/cart.ts';
import { show } from '../cinq/toast.ts';

class CartItem extends Piece {
  $input!: HTMLInputElement;
  $remove!: HTMLButtonElement;

  constructor() {
    super('CartItem');
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
    this.setAttribute('aria-busy', 'true');

    try {
      await cart.update({ [this.itemId]: quantity });
    } catch (error) {
      show(messageFromError(error));
    } finally {
      this.removeAttribute('aria-busy');
    }
  }

  unmount() {
    this.off('change', this.$input, this.handleChange);
    this.off('click', this.$remove, this.handleClick);
  }

  get itemId() {
    return this.dataset.itemId || '';
  }
}

customElements.define('c-cart-item', CartItem);
