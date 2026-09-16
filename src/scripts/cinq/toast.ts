import type { Toast } from '@agencecinq/toast';

/**
 * Show a message on the layout `<cinq-toast>`.
 * Package `show()` no-ops while already open — close first so a new message can replace it.
 */
export const showToast = (message: string): void => {
  const host = document.querySelector('cinq-toast') as Toast | null;
  if (!host || !message) return;

  if (!host.open) {
    host.show(message);
    return;
  }

  host.close();
  // Wait one frame so `open` can toggle off→on and the enter transition replays.
  requestAnimationFrame(() => {
    host.show(message);
  });
};

/**
 * Consumer-owned pause on pointer / keyboard focus (package default is no pause).
 */
export const initToastPause = (
  host = document.querySelector('cinq-toast') as Toast | null,
): void => {
  if (!host) return;

  host.addEventListener('pointerenter', () => host.pause());
  host.addEventListener('pointerleave', () => host.resume());
  host.addEventListener('focusin', () => host.pause());
  host.addEventListener('focusout', (event) => {
    const next = event.relatedTarget;
    if (next instanceof Node && host.contains(next)) return;
    host.resume();
  });
};
