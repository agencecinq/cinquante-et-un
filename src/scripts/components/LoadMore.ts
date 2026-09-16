import { Piece } from 'piecesjs';
import { fetchSectionByID } from '../api/fetchSectionByID.ts';

class LoadMore extends Piece {
  static get observedAttributes() {
    return ['loading'];
  }

  // Elements
  $button: HTMLButtonElement | null = null;
  $container: HTMLElement | null = null;
  $outOf: HTMLElement | null = null;

  constructor() {
    super('LoadMore');
  }

  mount() {
    this.$button = this.domAttr('load-more-button') as HTMLButtonElement;
    this.$container = this.domAttr('container') as HTMLElement;
    this.$outOf = this.domAttr('out-of') as HTMLElement | null;

    if (!this.$button) {
      throw new Error('LoadMore: button element not found');
    }

    if (!this.$container) {
      throw new Error('LoadMore: container element not found');
    }
  }

  /**
   * Loads the next page via Shopify's Section Rendering API and appends items.
   * Wired from the button with `data-events-click="fetch"`.
   *
   * @see https://shopify.dev/docs/api/ajax/section-rendering
   */
  async fetch(event?: Event): Promise<void> {
    event?.preventDefault();

    if (!this.$button || !this.$container) return;

    if (!this.action || !this.sectionId || !this.productsId) {
      this.$button.style.setProperty('display', 'none');
      return;
    }

    this.$button.disabled = true;
    this.setAttribute('loading', '');

    try {
      const doc = await fetchSectionByID(this.action, this.sectionId);
      const nextLoadMore = doc.getElementById(this.id);
      const nextProducts = doc.getElementById(this.productsId);

      if (!nextLoadMore || !nextProducts?.childElementCount) {
        this.$button.disabled = false;
        return;
      }

      this.syncPagination(nextLoadMore);
      this.$container.append(...Array.from(nextProducts.children));
      this.syncOutOf(nextProducts.getAttribute('data-out-of'));

      if (this.currentPage >= this.totalPages || !this.action) {
        this.$button.style.setProperty('display', 'none');
      } else {
        this.$button.disabled = false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      this.$button.disabled = false;
    } finally {
      this.removeAttribute('loading');
    }
  }

  /**
   * Copy pagination attrs from the fetched load-more root.
   */
  private syncPagination(source: Element): void {
    this.action = source.getAttribute('data-action') ?? '';

    const currentPage = Number.parseInt(source.getAttribute('data-current-page') ?? '', 10);
    const totalPages = Number.parseInt(source.getAttribute('data-total-pages') ?? '', 10);

    if (Number.isFinite(currentPage)) this.currentPage = currentPage;
    if (Number.isFinite(totalPages)) this.setAttribute('data-total-pages', String(totalPages));
  }

  /**
   * Update the visible "X out of Y" label from the fetched grid.
   */
  private syncOutOf(value: string | null): void {
    if (!value || !this.$container) return;

    this.$container.setAttribute('data-out-of', value);
    if (this.$outOf) this.$outOf.textContent = value;
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

  get sectionId() {
    return this.getAttribute('data-section-id') || '';
  }

  get productsId() {
    return this.getAttribute('data-products-id') || '';
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
}

customElements.define('c-load-more', LoadMore);
