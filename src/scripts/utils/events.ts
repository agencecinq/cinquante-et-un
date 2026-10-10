import { EVENTS as UTILS_EVENTS } from '@agencecinq/utils';

export const EVENTS = {
  ...UTILS_EVENTS,
  LOAD_MORE_FETCH: 'loadmore:fetch',
  LOAD_MORE_COMPLETE: 'loadmore:complete',
  /** Emitted by `c-variant-picker` before fetching the new selection; `VARIANT_CHANGE` follows. */
  VARIANT_BEFORE_CHANGE: 'variant:before-change',
} as const;

export type LoadMoreEventDetail = {
  id: string;
};
