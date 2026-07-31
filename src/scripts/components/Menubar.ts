import { Piece } from 'piecesjs';
import { EVENTS, addTrapFocus, getFocusableElements, removeTrapFocus } from '@agencecinq/utils';

/**
 * Nested mobile menu panels inside the menu drawer.
 * Buttons use data-dom="open|close" + aria-controls pointing at panel IDs.
 */
class Menubar extends Piece {
  trigger: HTMLElement | null = null;
  isOpen = false;
  closes: HTMLElement[] = [];
  opens: HTMLElement[] = [];
  panels: HTMLElement[] = [];

  constructor() {
    super('Menubar');

    this.isOpen = this.classList.contains('is-open');
    this.panels = this.domAttrAll('panel');
    this.closes = this.domAttrAll('close');
    this.opens = this.domAttrAll('open');

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  mount(): void {
    this.on('click', this.opens, this.open);
    this.on('click', this.closes, this.close);
    this.on(EVENTS.DRAWER_CLOSE, document.documentElement, this.handleDrawerClose);
    this.on(EVENTS.DRAWER_OPEN, document.documentElement, this.handleDrawerOpen);
  }

  handleDrawerOpen(event: CustomEvent<{ drawer: string }>): void {
    if (event.detail.drawer !== 'menu-drawer' && this.isOpen) {
      this.close();
    }
  }

  handleDrawerClose(event: CustomEvent<{ drawer: string }>): void {
    if (event.detail.drawer === 'menu-drawer' && this.isOpen) {
      this.close();
    }
  }

  open(event: Event): void {
    const $button = event.currentTarget as HTMLButtonElement;
    const controls: string[] = $button.getAttribute('aria-controls')?.trim().split(/\s+/) || [];

    this.isOpen = true;
    this.trigger = $button;
    $button.setAttribute('aria-expanded', 'true');

    controls.forEach((control: string) => {
      const el = this.querySelector(`#${CSS.escape(control)}`) as HTMLElement | null;
      if (!el) {
        throw new Error(`Menubar: #${control} not found`);
      }

      el.scroll(0, 0);
      el.classList.add('is-active');

      const focusable = getFocusableElements(el);
      if (focusable.length > 0) {
        addTrapFocus(el, focusable[0] as HTMLElement);
      }
    });
  }

  close(): void {
    if (this.trigger) {
      removeTrapFocus(this.trigger);
    }

    this.isOpen = false;
    this.panels.forEach(($panel) => $panel.classList.remove('is-active'));
    this.opens.forEach(($button) => $button.setAttribute('aria-expanded', 'false'));

    const root = this.firstElementChild as HTMLElement | null;
    if (!root) return;

    const focusable = getFocusableElements(root);
    if (focusable.length > 0) {
      addTrapFocus(root, focusable[0] as HTMLElement);
    }
  }

  unmount(): void {
    this.off('click', this.opens, this.open);
    this.off('click', this.closes, this.close);
    this.off(EVENTS.DRAWER_CLOSE, document.documentElement, this.handleDrawerClose);
    this.off(EVENTS.DRAWER_OPEN, document.documentElement, this.handleDrawerOpen);
  }
}

if (!customElements.get('c-menubar')) {
  customElements.define('c-menubar', Menubar);
}
