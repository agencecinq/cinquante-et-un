/**
 * Swap a section returned by Shopify's "bundled" section rendering
 * (the `sections` field from the cart Ajax responses).
 *
 * @see https://shopify.dev/docs/api/ajax/reference/cart#bundled-section-rendering
 */
function renderBundledSection(data: string, id: string, selectors: string[] | null = null): void {
  if (!data) {
    return;
  }

  const html = new DOMParser().parseFromString(data, 'text/html');
  const source = html.querySelector(id);

  if (!source) {
    return;
  }

  if (selectors) {
    selectors.forEach((sel) => {
      const $targets = document.querySelectorAll(`${id} ${sel}`);
      const $selectors = source.querySelectorAll(sel);

      if ($targets.length === 0) {
        console.error(`Target element not found: ${sel}`);
        return;
      }

      $targets.forEach(($target: Element, idx: number) => {
        const $selector = $selectors[idx] || $selectors[0];
        if ($selector && $selector.innerHTML === '') {
          ($target as HTMLElement).innerHTML = '';
        } else if ($selector) {
          $target.replaceWith($selector.cloneNode(true));
        }
      });
    });

    return;
  }

  const $target = document.querySelector(id.startsWith('#') ? id : `#${id}`);

  if (!$target) {
    console.error(`Target element not found: ${id}`);
    return;
  }

  if (source.innerHTML === '') {
    $target.innerHTML = '';
  } else {
    $target.replaceWith(source.cloneNode(true));
  }
}

export default renderBundledSection;
