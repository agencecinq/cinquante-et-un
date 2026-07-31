import { Piece } from 'piecesjs';
import { EVENTS } from '@agencecinq/utils';

type SpinbuttonChangeEvent = CustomEvent<{ value: number }>;

/**
 * Bridges `<cinq-spinbutton>` value changes to the cart line `<input>` change
 * event expected by `c-cart-item`.
 */
class CartQuantity extends Piece {
  private $spin!: HTMLElement;
  private $input!: HTMLInputElement;

  constructor() {
    super('CartQuantity');
  }

  mount() {
    this.$spin = this.querySelector('cinq-spinbutton') as HTMLElement;
    this.$input = this.querySelector('[data-dom="input"]') as HTMLInputElement;

    if (!this.$spin || !this.$input) {
      return;
    }

    this.on(EVENTS.SPINBUTTON_CHANGE, this.$spin, this.handleSpinChange as EventListener);
  }

  private handleSpinChange = (event: Event) => {
    const e = event as SpinbuttonChangeEvent;
    const value = e?.detail?.value;
    if (typeof value !== 'number' || !Number.isFinite(value)) return;

    this.$input.value = String(value);
    this.$input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  unmount() {
    if (this.$spin) {
      this.off(EVENTS.SPINBUTTON_CHANGE, this.$spin, this.handleSpinChange as EventListener);
    }
  }
}

if (!customElements.get('c-cart-quantity')) {
  customElements.define('c-cart-quantity', CartQuantity);
}
