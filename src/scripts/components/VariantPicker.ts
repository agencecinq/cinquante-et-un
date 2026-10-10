import { Piece } from 'piecesjs';
import { fetchSection } from '../api/fetchSection.ts';
import { EVENTS } from '../utils/events.ts';
import { renderSection } from '../utils/renderSection.ts';
import { Variant, VariantBeforeChangeDetail, VariantChangeDetail } from '../types/variant.ts';

/**
 * Product option radios. Each change emits `EVENTS.VARIANT_BEFORE_CHANGE`, fetches
 * the product section for the selected option values (`?option_values=`),
 * refreshes the picker itself, then emits `EVENTS.VARIANT_CHANGE` with the
 * rendered section: price, add-to-cart, gallery… update themselves from it. The
 * picker doesn't know who listens.
 *
 * An option value with a `data-product-url` belongs to a sibling product
 * (combined listings): the whole section is swapped for that product.
 *
 * @see https://shopify.dev/docs/storefronts/themes/product-merchandising/variants/support-high-variant-products
 */
class VariantPicker extends Piece {
  private controller: AbortController | null = null;

  constructor() {
    super('VariantPicker');
  }

  mount() {
    this.on('change', this, this.handleChange);
  }

  handleChange = (event: Event) => {
    const $input = event.target as HTMLInputElement;

    if (!$input.matches('[data-option-value-id]')) return;

    this.refresh($input);
  };

  async refresh($input: HTMLInputElement): Promise<void> {
    const productUrl = $input.dataset.productUrl || this.productUrl;
    const url = `${productUrl}?option_values=${this.selectedOptionValueIds().join(',')}`;
    const hadFocus = this.contains(document.activeElement);
    const { sectionId } = this;

    this.controller?.abort();
    this.controller = new AbortController();
    this.setAttribute('aria-busy', 'true');

    const before: VariantBeforeChangeDetail = {
      id: document.getElementById(this.contentId)?.dataset.productId,
      sectionId,
    };
    this.emit(EVENTS.VARIANT_BEFORE_CHANGE, document.documentElement, before);

    try {
      const markup = await fetchSection(url, sectionId, { signal: this.controller.signal });
      const html = new DOMParser().parseFromString(markup, 'text/html');
      const $content = html.getElementById(this.contentId);

      renderSection(html, {
        id: `shopify-section-${sectionId}`,
        selectors: productUrl === this.productUrl ? [`#${CSS.escape(this.contentId)}`] : [],
      });

      if (hadFocus) {
        document
          .getElementById(this.contentId)
          ?.querySelector<HTMLInputElement>(`[data-option-value-id="${$input.dataset.optionValueId}"]`)
          ?.focus({ preventScroll: true });
      }

      const variant = this.parseVariant($content);

      if (this.hasAttribute('data-update-url')) {
        const next = new URL(productUrl, window.location.origin);
        if (variant) next.searchParams.set('variant', String(variant.id));
        window.history.replaceState({}, '', next.toString());
      }

      const detail: VariantChangeDetail = { variant, id: $content?.dataset.productId, sectionId, html };
      this.emit(EVENTS.VARIANT_CHANGE, document.documentElement, detail);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      // The checked radios no longer match the form's variant id: let Liquid render the page.
      window.location.assign(url);
    } finally {
      this.removeAttribute('aria-busy');
    }
  }

  /**
   * Selected variant rendered by Liquid (`{{ variant | json }}`), `null` when the
   * selected option values don't match any variant.
   */
  parseVariant($content: HTMLElement | null): Variant | null {
    const json = $content?.querySelector('[data-selected-variant]')?.textContent;

    return json ? JSON.parse(json) : null;
  }

  selectedOptionValueIds(): string[] {
    return Array.from(
      this.querySelectorAll<HTMLInputElement>('[data-option-value-id]:checked'),
      ($input) => $input.dataset.optionValueId ?? '',
    );
  }

  unmount() {
    this.controller?.abort();
    this.off('change', this, this.handleChange);
  }

  get sectionId() {
    return this.getAttribute('data-section-id') || '';
  }

  get productUrl() {
    return this.getAttribute('data-product-url') || window.location.pathname;
  }

  /** Id of the re-rendered wrapper: options, hidden `id` input and selected variant JSON. */
  get contentId() {
    return `VariantPicker-${this.sectionId}`;
  }
}

customElements.define('c-variant-picker', VariantPicker);
