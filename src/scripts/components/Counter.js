import { Piece } from 'piecesjs';

class Counter extends Piece {
  constructor() {
    super('Counter');
  }

  mount() {
    console.log('mount Counter');
    this.$button = this.$('button')[0];
    this.on('click', this.$button, this.click);
  }

  unmount() {
    console.log('unmount Counter');
    this.off('click', this.$button[0], this.click);
  }

  render() {
    return `
		  <h2>${this.name} component</h2>
		  <p>Value: ${this.value}</p>
		  <button class="c-button">Increment</button>
		`;
  }

  click() {
    this.value = parseInt(this.value) + 1;
  }

  set value(value) {
    return this.setAttribute('value', value);
  }

  get value() {
    return this.getAttribute('value');
  }

  // Important to automatically call the update function if attribute is changing
  static get observedAttributes() {
    return ['value'];
  }
}

customElements.define('c-counter', Counter);
