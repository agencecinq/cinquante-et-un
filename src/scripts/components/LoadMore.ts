import { Piece } from 'piecesjs';

class LoadMore extends Piece {
  static get observedAttributes() {
    return ['loading'];
  }

  // Elements
  $button: HTMLButtonElement | null = null;
  $container: HTMLElement | null = null;

  constructor() {
    super('LoadMore');
  }

  mount() {
    this.$button = this.domAttr('load-more-button') as HTMLButtonElement;
    this.$container = this.domAttr('container') as HTMLElement;

    if (!this.$button) {
      throw new Error('LoadMore: button element not found');
    }

    if (!this.$container) {
      throw new Error('LoadMore: container element not found');
    }

    this.on('click', this.$button, this.handleClick);
  }

  /**
   * Handles the button click event.
   *
   * @param {Event} event - The button click event.
   * @returns {void}
   */
  handleClick(event: Event): void {
    event.preventDefault();

    this.fetch();
  }
  /**
   * Sends a GET request to the button's action URL with the form data.
   *
   * @async
   * @function fetch
   * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
   */
  async fetch(): Promise<void> {
    if (!this.$button || !this.$container) return;

    if (!this.action) {
      this.$button.style.setProperty('display', 'none');
      return;
    }

    this.$button.disabled = true;
    this.setAttribute('loading', '');

    try {
      const response = await fetch(this.action, {
        method: 'GET',
        headers: {
          Accept: 'text/html',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const contentEl = doc.getElementById(this.id);
      if (!contentEl || !contentEl.firstElementChild) return;

      // Sync pagination state with the server response.
      const nextAction = contentEl.getAttribute('data-action') ?? '';
      const nextCurrentPageRaw = contentEl.getAttribute('data-current-page');
      const nextTotalPagesRaw = contentEl.getAttribute('data-total-pages');
      const nextCurrentPage = nextCurrentPageRaw ? parseInt(nextCurrentPageRaw, 10) : NaN;
      const nextTotalPages = nextTotalPagesRaw ? parseInt(nextTotalPagesRaw, 10) : NaN;

      this.action = nextAction;
      if (Number.isFinite(nextCurrentPage)) this.currentPage = nextCurrentPage;
      if (Number.isFinite(nextTotalPages)) {
        this.setAttribute('data-total-pages', String(nextTotalPages));
      }

      const $nextContainer =
        (contentEl.querySelector('[data-dom="container"]') as HTMLElement | null) ??
        (contentEl.firstElementChild as HTMLElement | null);
      if (!$nextContainer) return;

      const newContent = $nextContainer.innerHTML;
      if (!newContent) return;

      this.$container.innerHTML += newContent;

      // Prefer the rendered out-of node from the response; fall back to data-out-of.
      const $outOf = this.domAttr('out-of');
      const $nextOutOf = contentEl.querySelector('[data-dom="out-of"]');
      const outOfValue =
        ($nextOutOf instanceof HTMLElement && $nextOutOf.innerHTML.trim()) ||
        $nextContainer.getAttribute('data-out-of') ||
        '';

      if ($outOf instanceof HTMLElement && outOfValue) {
        $outOf.innerHTML = outOfValue;
        this.$container.setAttribute('data-out-of', outOfValue);
      }

      // Stop when we reached the end or when there is no next action.
      if (this.currentPage >= this.totalPages || !this.action) {
        this.$button.style.setProperty('display', 'none');
      } else {
        this.$button.disabled = false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      this.removeAttribute('loading');
    }
  }

  /**
   * Called when an attribute of the custom element is added, removed, or changed.
   *
   * @param name - The name of the attribute that changed.
   * @param oldValue - The previous value of the attribute.
   * @param newValue - The new value of the attribute.
   */
  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (name === 'loading') {
      if (newValue === '') {
        this.style.setProperty('cursor', 'wait');
        this.style.setProperty('opacity', '0.5');
      } else {
        this.style.removeProperty('cursor');
        this.style.removeProperty('opacity');
      }
    }
  }

  get totalPages() {
    return parseInt(this.getAttribute('data-total-pages') ?? '0', 10) || 0;
  }

  get currentPage() {
    return parseInt(this.getAttribute('data-current-page') ?? '0', 10) || 0;
  }

  set currentPage(value: number) {
    this.setAttribute('data-current-page', value.toString());
  }

  get action() {
    return this.getAttribute('data-action') || '';
  }

  set action(value: string) {
    this.setAttribute('data-action', value);
  }

  unmount() {
    this.off('click', this.$button, this.handleClick);
  }
}

customElements.define('c-load-more', LoadMore);
