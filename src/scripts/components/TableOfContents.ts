import { Piece } from 'piecesjs';
import slugify from '../utils/slugify.ts';

/**
 * Builds an in-page TOC from h2 headings inside `[data-content-id]`.
 */
class TableOfContents extends Piece {
  constructor() {
    super('TableOfContents');
  }

  mount() {
    const $list = this.domAttr('content') as HTMLElement | null;
    const contentId = this.dataset.contentId;
    const $page = contentId ? document.querySelector(`#${CSS.escape(contentId)}`) : null;

    if (!$page || !$list) return;

    Array.from($page.querySelectorAll('h2')).forEach(($h2) => {
      const id = slugify($h2.textContent ?? '');
      if (!id) return;

      $h2.setAttribute('id', id);

      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'text-sm font-medium hover:underline';
      a.href = `#${id}`;
      a.textContent = $h2.textContent ?? '';
      li.append(a);
      $list.append(li);
    });
  }
}

if (!customElements.get('c-table-of-contents')) {
  customElements.define('c-table-of-contents', TableOfContents);
}
