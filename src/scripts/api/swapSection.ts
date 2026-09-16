/**
 * DOM helpers for Shopify Section Rendering markup.
 *
 * Prefer swapping stable `.js-*` roots over replacing whole section wrappers
 * so focus / scroll / open drawers survive cart updates.
 */

function asElementList(
  nodes: ArrayLike<Element> | Element[] | null | undefined,
): Element[] {
  return nodes ? Array.from(nodes) : [];
}

/**
 * Replace live targets with matching sources from freshly rendered markup.
 * Empty source nodes clear the target instead of removing the root.
 */
export function replaceMatching(targets: ArrayLike<Element>, sources: ArrayLike<Element>): void {
  const $targets = asElementList(targets);
  const $sources = asElementList(sources);

  $targets.forEach(($target, index) => {
    const $source = $sources[index] ?? $sources[0];
    if (!$source) return;

    if (($source as HTMLElement).innerHTML === '') {
      ($target as HTMLElement).innerHTML = '';
      return;
    }

    $target.replaceWith($source.cloneNode(true));
  });
}

/**
 * Swap nodes inside a live section root using selectors relative to that root.
 */
export function swapScoped(
  liveRoot: Element,
  sourceRoot: Element,
  selectors: string[],
): void {
  for (const selector of selectors) {
    replaceMatching(
      liveRoot.querySelectorAll(selector),
      sourceRoot.querySelectorAll(selector),
    );
  }
}

/**
 * Swap nodes matched globally (document ↔ parsed document).
 */
export function swapGlobal(
  sourceDoc: ParentNode,
  selectors: string[],
): void {
  for (const selector of selectors) {
    const $target = document.querySelector(selector);
    const $source = sourceDoc.querySelector(selector);

    if ($target && $source) {
      $target.replaceWith($source.cloneNode(true));
    }
  }
}

/**
 * Replace a single live root with the matching node from parsed markup.
 * No-ops when the root is not on the current page.
 */
export function swapRoot(sourceDoc: ParentNode, rootSelector: string): void {
  const selector = rootSelector.startsWith('#') ? rootSelector : `#${rootSelector}`;
  const $target = document.querySelector(selector);
  const $source = sourceDoc.querySelector(selector);

  if (!$target || !$source) return;

  if (($source as HTMLElement).innerHTML === '') {
    ($target as HTMLElement).innerHTML = '';
    return;
  }

  $target.replaceWith($source.cloneNode(true));
}
