import { EVENTS } from '@agencecinq/utils';

function updateLabel(button: HTMLButtonElement, open: boolean) {
  const span = button.querySelector('span');

  if (!span) return;

  const title = open
    ? button.getAttribute('data-readless-title')
    : button.getAttribute('data-readmore-title');

  if (title) span.textContent = title;
}

function getShortElement(button: HTMLButtonElement): HTMLElement | null {
  const id = button.getAttribute('data-disclosure-short');

  return id ? document.getElementById(id) : null;
}

/**
 * Theme glue for @agencecinq/disclosure-button read-more pattern:
 * swap labels and hide the excerpt when the full content opens.
 */
export function initDisclosureButtonLabels(): void {
  document.addEventListener(EVENTS.DISCLOSURE_BUTTON_OPEN, (event) => {
    if (!(event instanceof CustomEvent)) return;

    const button = event.detail?.el as HTMLButtonElement | undefined;

    if (!button) return;

    const short = getShortElement(button);

    if (short) short.hidden = true;

    updateLabel(button, true);
  });

  document.addEventListener(EVENTS.DISCLOSURE_BUTTON_CLOSE, (event) => {
    if (!(event instanceof CustomEvent)) return;

    const button = event.detail?.el as HTMLButtonElement | undefined;

    if (!button) return;

    const short = getShortElement(button);

    if (short) short.hidden = false;

    updateLabel(button, false);
  });
}
