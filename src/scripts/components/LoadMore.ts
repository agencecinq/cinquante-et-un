import { Piece } from 'piecesjs';
import { fetchSection } from '../api/fetchSection.ts';

class LoadMore extends Piece {
  // Elements
  $button!: HTMLButtonElement;
  $container!: HTMLElement;
  $displayedCount: HTMLElement | null = null;

  constructor() {
    super('LoadMore');
  }

  mount() {
    this.$button = this.domAttr('load-more-button') as HTMLButtonElement;
    this.$container = this.domAttr('container') as HTMLElement;
    this.$displayedCount = this.domAttr('displayed-count') as HTMLElement | null;

    if (!this.$button) {
      throw new Error('LoadMore: button element not found');
    }

    if (!this.$container) {
      throw new Error('LoadMore: container element not found');
    }
  }

  /**
   * Loads the next page via Shopify's Section Rendering API and appends items.
   * Wired from the button with `data-events-click="loadMore"`.
   *
   * `data-action` holds the next page URL; it is empty on the last page, which hides the button.
   *
   * @see https://shopify.dev/docs/api/ajax/section-rendering
   */
  async loadMore(): Promise<void> {
    if (!this.action) {
      return;
    }

    this.$button.disabled = true;
    this.setAttribute('aria-busy', 'true');

    try {
      const markup = await fetchSection(this.action, this.sectionId);
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const nextLoadMore = doc.getElementById(this.id);
      const nextItems = doc.getElementById(this.itemsId);

      this.action = nextLoadMore?.getAttribute('data-action') ?? '';

      if (nextItems) {
        const firstNewItem = nextItems.firstElementChild;

        this.$container.append(...nextItems.children);
        firstNewItem?.querySelector<HTMLElement>('a')?.focus();
      }

      const nextDisplayedCount = nextLoadMore?.querySelector('[data-dom="displayed-count"]');

      if (this.$displayedCount && nextDisplayedCount) {
        this.$displayedCount.textContent = nextDisplayedCount.textContent;
      }
    } catch (error) {
      console.error('LoadMore: error fetching next page', error);
    } finally {
      this.removeAttribute('aria-busy');
      this.$button.disabled = false;
      this.$button.hidden = !this.action;
    }
  }

  get sectionId() {
    return this.getAttribute('data-section-id') || '';
  }

  get itemsId() {
    return this.getAttribute('data-items-id') || '';
  }

  get action() {
    return this.getAttribute('data-action') || '';
  }

  set action(value: string) {
    this.setAttribute('data-action', value);
  }
}

customElements.define('c-load-more', LoadMore);
