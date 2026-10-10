import { Section } from '../types/section.ts';

/**
 * Replace `target` with a clone of `source`. An empty source clears the target
 * instead, so the live root (and its listeners) survives.
 */
function replace(target: Element, source: Element): void {
  if (source.innerHTML === '') {
    target.innerHTML = '';
    return;
  }

  target.replaceWith(source.cloneNode(true));
}

/**
 * Each live match is paired by index with a source match (falling back to the
 * first source when the counts differ).
 */
function replaceScoped(liveRoot: Element, sourceRoot: Element, selectors: string[]): void {
  for (const selector of selectors) {
    const sources = Array.from(sourceRoot.querySelectorAll(selector));

    liveRoot.querySelectorAll(selector).forEach((target, index) => {
      const source = sources[index] ?? sources[0];
      if (source) replace(target, source);
    });
  }
}

/**
 * Swap freshly rendered section markup (Section Rendering API, `?sections=` or
 * bundled cart response) into the live DOM. With `selectors`, only those nodes
 * are replaced, scoped to the section root so identical selectors in other
 * sections stay untouched. Prefer stable `.js-*` roots so focus / scroll /
 * open drawers survive. `section.id` is looked up as a DOM id in both the
 * markup and the page; no-ops when either is missing. `markup` may be an
 * already parsed `Document` when the caller also reads from it.
 *
 * @example
 * renderSection(await fetchSection(url, 'main-collection'), {
 *   id: 'main-collection',
 *   selectors: ['.js-product-grid', '.js-facets'],
 * });
 *
 * @see https://shopify.dev/docs/api/ajax/section-rendering
 */
export function renderSection(markup: string | Document, section: Section): void {
  const doc = typeof markup === 'string' ? new DOMParser().parseFromString(markup, 'text/html') : markup;
  const sourceRoot = doc.getElementById(section.id);
  const liveRoot = document.getElementById(section.id);

  if (!sourceRoot || !liveRoot) return;

  if (section.selectors?.length) {
    replaceScoped(liveRoot, sourceRoot, section.selectors);
    return;
  }

  replace(liveRoot, sourceRoot);
}
