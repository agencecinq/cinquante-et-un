import '@agencecinq/accordion';
import '@agencecinq/calendar';
import '@agencecinq/combobox';
import '@agencecinq/disclosure-button';
import '@agencecinq/drawer';
import '@agencecinq/drilldown';
import '@agencecinq/modal';
import '@agencecinq/spinbutton';
import '@agencecinq/switch';
import '@agencecinq/tabs';
import '@agencecinq/toast';
import '@agencecinq/windowsplitter';

// Invoker commands (commandfor) open the drawers, the modal and the calendar
// months: Safari before 26.2 needs the polyfill.
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  await import('invokers-polyfill');
}

import { init as initCombobox } from './combobox.ts';
import { init as initDisclosureButton } from './disclosure-button.ts';
import { init as initDrilldown } from './drilldown.ts';
import { init as initToast } from './toast.ts';

initCombobox();
initDisclosureButton();
initDrilldown();
initToast();
