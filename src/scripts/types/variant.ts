/**
 * Product variant as serialized by Liquid's `{{ variant | json }}` (prices in cents).
 *
 * @see https://shopify.dev/docs/api/liquid/objects/variant
 */
export type Variant = {
  id: number;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  options: string[];
  sku: string | null;
  barcode: string | null;
  available: boolean;
  name: string;
  public_title: string | null;
  price: number;
  compare_at_price: number | null;
  weight: number;
  requires_shipping: boolean;
  taxable: boolean;
  inventory_management: string | null;
  featured_image: { id: number; src: string; alt: string | null } | null;
  featured_media: { id: number; position: number } | null;
  quantity_rule: {
    min: number;
    max: number | null;
    increment: number;
  };
};

/**
 * Detail of `EVENTS.VARIANT_BEFORE_CHANGE`, emitted by `c-variant-picker` when a
 * selection starts loading. Listeners can mark themselves busy and block actions
 * that rely on the previous variant (e.g. add to cart) until `VARIANT_CHANGE`.
 */
export type VariantBeforeChangeDetail = {
  /** Product id, as a string. */
  id: string | undefined;
  /** Section the picker belongs to. */
  sectionId: string;
};

/**
 * Detail of `EVENTS.VARIANT_CHANGE`, emitted by `c-variant-picker` once per
 * selection. Listeners update themselves from `html` (look up their own `id`)
 * rather than re-rendering in JS, so prices, labels and translations stay Liquid's.
 */
export type VariantChangeDetail = {
  /** `null` when the selected option values don't match any variant. */
  variant: Variant | null;
  /** Product id, as a string. Differs from the previous one after a combined listing switch. */
  id: string | undefined;
  /** Section the picker belongs to. */
  sectionId: string;
  /** Section rendered by Shopify for the new selection (Section Rendering API). */
  html: Document;
};
