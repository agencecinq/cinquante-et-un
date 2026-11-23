import { Piece } from 'piecesjs';
import { getFocusableElements } from '@agencecinq/utils';

/**
 * Nested mobile menu panels inside the menu drawer (a modal `<dialog>`).
 * Buttons use data-dom="open|close" + aria-controls pointing at panel IDs.
 *
 * The dialog keeps focus inside the drawer. Inside it, only the visible panel
 * takes part: the others are `inert` (they slide off-screen but stay in the
 * DOM for the transition). Closing the drawer brings the main panel back.
 */
class Menubar extends Piece {
  trigger: HTMLButtonElement | null = null;
  closes: HTMLElement[] = [];
  opens: HTMLElement[] = [];
  panels: HTMLElement[] = [];
  $dialog: HTMLDialogElement | null = null;

  constructor() {
    super('Menubar');

    this.panels = this.domAttrAll('panel');
    this.closes = this.domAttrAll('close');
    this.opens = this.domAttrAll('open');

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  mount(): void {
    this.$dialog = this.closest('dialog');

    this.on('click', this.opens, this.open);
    this.on('click', this.closes, this.close);

    if (this.$dialog) {
      this.on('toggle', this.$dialog, this.handleToggle);
    }
  }

  handleToggle = (event: Event): void => {
    if ((event as ToggleEvent).newState === 'closed' && this.trigger) {
      this.reset();
    }
  };

  get root(): HTMLElement | null {
    return this.firstElementChild as HTMLElement | null;
  }

  open(event: Event): void {
    const $button = event.currentTarget as HTMLButtonElement;
    const controls: string[] = $button.getAttribute('aria-controls')?.trim().split(/\s+/) || [];

    this.trigger = $button;
    $button.setAttribute('aria-expanded', 'true');

    if (this.root) {
      this.root.inert = true;
    }

    controls.forEach((control: string) => {
      const $panel = this.querySelector<HTMLElement>(`#${CSS.escape(control)}`);

      if (!$panel) {
        throw new Error(`Menubar: #${control} not found`);
      }

      $panel.scroll(0, 0);
      $panel.inert = false;
      $panel.classList.add('is-active');

      const [$first] = getFocusableElements($panel);

      $first?.focus();
    });
  }

  /** Back button: main panel again, focus on the item that opened the panel. */
  close(): void {
    const $trigger = this.trigger;

    this.reset();
    $trigger?.focus();
  }

  /** Main panel again, without moving focus (the drawer closing hands it back to its opener). */
  reset(): void {
    this.panels.forEach(($panel) => {
      $panel.classList.remove('is-active');
      $panel.inert = true;
    });
    this.opens.forEach(($button) => $button.setAttribute('aria-expanded', 'false'));

    if (this.root) {
      this.root.inert = false;
    }

    this.trigger = null;
  }

  unmount(): void {
    this.off('click', this.opens, this.open);
    this.off('click', this.closes, this.close);

    if (this.$dialog) {
      this.off('toggle', this.$dialog, this.handleToggle);
    }
  }
}

if (!customElements.get('c-menubar')) {
  customElements.define('c-menubar', Menubar);
}
