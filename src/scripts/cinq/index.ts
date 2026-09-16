import '@agencecinq/accordion';
import '@agencecinq/calendar';
import '@agencecinq/combobox';
import '@agencecinq/disclosure-button';
import '@agencecinq/drawer';
import '@agencecinq/modal';
import '@agencecinq/spinbutton';
import '@agencecinq/switch';
import '@agencecinq/tabs';
import '@agencecinq/toast';
import '@agencecinq/windowsplitter';

import { init as initDisclosureButton } from './disclosure-button.ts';
import { init as initToast } from './toast.ts';

initDisclosureButton();
initToast();
