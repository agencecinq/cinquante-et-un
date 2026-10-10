import { Piece } from 'piecesjs';
import type { Slideshow } from './Slideshow.ts';
import { VariantChangeDetail } from '../types/variant.ts';
import { EVENTS } from '../utils/events.ts';

/**
 * Product page gallery: follows `EVENTS.VARIANT_CHANGE` for the product in
 * `data-product-id` and brings the selected variant's featured media into view.
 * Slides carry `data-media-id`; the nested `c-slideshow` stays a generic carousel.
 */
class ProductGallery extends Piece {
  constructor() {
    super('ProductGallery');
  }

  mount() {
    this.on(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  handleVariantChange = (event: Event) => {
    const { variant, id } = (event as CustomEvent<VariantChangeDetail>).detail;
    const mediaId = variant?.featured_media?.id;

    if (!mediaId || id !== this.productId) return;

    const $slide = this.querySelector<HTMLElement>(`[data-media-id="${mediaId}"]`);
    if (!$slide) return;

    this.querySelector<Slideshow>('c-slideshow')?.slideTo($slide);
  };

  unmount() {
    this.off(EVENTS.VARIANT_CHANGE, document.documentElement, this.handleVariantChange);
  }

  get productId() {
    return this.getAttribute('data-product-id');
  }
}

customElements.define('c-product-gallery', ProductGallery);
