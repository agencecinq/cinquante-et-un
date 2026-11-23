import type { Drilldown } from '@agencecinq/drilldown';

/**
 * Theme glue for @agencecinq/drilldown inside a drawer: when the dialog
 * holding a drilldown closes, the drilldown goes back to its root panel, so
 * the menu reopens on it. The dialog fires the native `toggle` event.
 */
export function init(): void {
  document.querySelectorAll<Drilldown>('dialog cinq-drilldown').forEach(($drilldown) => {
    $drilldown.closest('dialog')?.addEventListener('toggle', (event) => {
      if ((event as ToggleEvent).newState === 'closed') {
        $drilldown.closeAll();
      }
    });
  });
}
