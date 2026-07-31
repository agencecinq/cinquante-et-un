/**
 * Section descriptor used by the cart section-rendering helpers.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export type Section = {
  /** Section id used by Shopify (`?sections=...`). */
  id: string;
  /** Optional list of CSS selectors to swap inside the section. */
  selectors?: string[];
};
