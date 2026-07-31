import { Piece } from 'piecesjs';

export class VariantsPickerOption extends Piece {
  public inputs: HTMLInputElement[] = [];
  public position: string = '';
  private $value: HTMLElement | null = null;

  constructor() {
    super('VariantsPickerOption');
  }

  mount() {
    this.inputs = this.domAttrAll('option-value');
    this.position = this.dataset.position || '';
    this.$value = this.domAttr('value') as HTMLElement | null;

    this.inputs.forEach((input) => this.on('change', input, this.handleChange));
  }

  handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (input.checked && this.$value) {
      this.$value.textContent = input.value;
    }

    this.emit('option:change', this, { position: this.position, value: input.value });
  };

  getSelectedValue(): string | null {
    const $input = Array.from(this.inputs).find((input) => input.checked);

    return $input ? $input.value : null;
  }

  setInputAvailability(value: string, available: boolean) {
    const $input = Array.from(this.inputs).find((input) => input.value === value);

    if ($input) {
      $input.disabled = !available;
    }
  }

  unmount() {
    this.inputs.forEach((input) => {
      this.off('change', input, this.handleChange);
    });
  }
}

customElements.define('c-variants-picker-option', VariantsPickerOption);
