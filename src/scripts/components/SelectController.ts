import { Piece } from 'piecesjs';

type Action = 'submit' | 'redirect';

/**
 * Enhances a native <select>: updates an optional flag image, then either
 * submits the closest form or redirects to the selected option's data-url.
 */
class SelectController extends Piece {
  private $select!: HTMLSelectElement;
  private $image: HTMLImageElement | null = null;

  constructor() {
    super('SelectController');
  }

  mount() {
    this.$select = (this.domAttr('select') || this.querySelector('select')) as HTMLSelectElement;
    this.$image =
      (this.domAttr('flag') as HTMLImageElement | null) ?? this.querySelector('[data-dom="flag"]');

    if (!this.$select) {
      throw new Error('SelectController: select element not found');
    }

    this.on('change', this.$select, this.handleChange);
  }

  private get action(): Action {
    const value = this.getAttribute('data-action') || 'submit';
    return value === 'redirect' ? 'redirect' : 'submit';
  }

  private handleChange = () => {
    this.syncFlag();

    if (this.action === 'redirect') {
      const url = this.$select.selectedOptions?.[0]?.dataset.url;
      if (!url) return;
      window.location.assign(url);
      return;
    }

    this.$select.closest('form')?.submit();
  };

  private syncFlag() {
    if (!this.$image) return;

    const option = this.$select.selectedOptions?.[0] ?? null;
    const src = option?.dataset.flagSrc;
    const srcset = option?.dataset.flagSrcset;

    if (!src) return;

    this.$image.src = src;
    if (srcset) {
      this.$image.srcset = srcset;
    }
  }

  unmount() {
    this.off('change', this.$select, this.handleChange);
  }
}

customElements.define('c-select-controller', SelectController);
