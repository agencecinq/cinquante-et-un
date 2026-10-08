/**
 * Section descriptor for Shopify's Section Rendering API helpers.
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export type Section = {
  /** Section id used by Shopify (`?sections=...`). */
  id: string;
  /** Optional list of CSS selectors to swap inside the section. */
  selectors?: string[];
};

/**
 * Rendered section HTML keyed by section id, as returned by `?sections=` and
 * bundled cart responses. `null` when Shopify failed to render a section.
 */
export type SectionsMarkup = Record<string, string | null>;
