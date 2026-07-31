import type { Combobox, EmptyDetail, UpdateDetail } from '@agencecinq/combobox';
import { EVENTS } from '@agencecinq/utils';
import { fetchPredictiveSearchSection } from './api/fetchPredictiveSearchSection.ts';

const DEFAULT_SECTION_ID = 'predictive-search';
const wired = new WeakSet<Combobox>();

/**
 * Mount script: wires Shopify predictive search onto `<cinq-combobox>`.
 * Panel visibility is CSS (`:has([aria-expanded=true])`); this module only
 * assigns `search` / `onSelect` and i18n status / live regions.
 */
const wire = (host: Combobox): void => {
  if (wired.has(host)) {
    return;
  }

  wired.add(host);

  const $form = host.querySelector('form');
  const $status = host.querySelector<HTMLElement>('[data-dom="status"]');
  const $live = host.querySelector<HTMLElement>('[data-dom="live"]');
  const resultsCountOne = host.getAttribute('data-results-count-one') ?? '';
  const resultsCountOther = host.getAttribute('data-results-count-other') ?? '';
  const noResultsTemplate = host.getAttribute('data-no-results') ?? '';
  const sectionId =
    host.getAttribute('data-section-id') ?? DEFAULT_SECTION_ID;
  const minLength = Math.max(
    0,
    parseInt(host.getAttribute('data-combobox-min-length') ?? '2', 10) || 2,
  );

  host.search = async (query, { signal }) => ({
    html: await fetchPredictiveSearchSection({
      query,
      sectionId,
      signal,
    }),
  });

  host.onSelect = ({ option }) => {
    option?.element.querySelector<HTMLAnchorElement>('a[href]')?.click();
  };

  $form?.addEventListener('submit', (event) => {
    const input = host.querySelector<HTMLInputElement>('[role="combobox"]');

    if (!input?.value.trim()) {
      event.preventDefault();
    }

    host.hide({ force: true });
  });

  host.addEventListener(EVENTS.COMBOBOX_EMPTY, ((event: CustomEvent<EmptyDetail>) => {
    const { value } = event.detail;

    if (value.trim().length < minLength || !$status || !$live) {
      return;
    }

    const message = noResultsTemplate.replace('__TERMS__', value);
    $status.textContent = message;
    $status.hidden = false;
    $live.textContent = message;
  }) as EventListener);

  host.addEventListener(EVENTS.COMBOBOX_UPDATE, ((event: CustomEvent<UpdateDetail>) => {
    const { options } = event.detail;

    if (!$status || !$live || 0 === options.length) {
      return;
    }

    $status.hidden = true;
    $status.textContent = '';
    $live.textContent =
      1 === options.length
        ? resultsCountOne
        : resultsCountOther.replace('__COUNT__', String(options.length));
  }) as EventListener);
};

document
  .querySelectorAll<Combobox>('cinq-combobox[data-section-id]')
  .forEach(wire);
