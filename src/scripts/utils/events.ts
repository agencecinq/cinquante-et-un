import { EVENTS as UTILS_EVENTS } from '@agencecinq/utils';

export const EVENTS = {
  ...UTILS_EVENTS,
  LOAD_MORE_FETCH: 'loadmore:fetch',
  LOAD_MORE_COMPLETE: 'loadmore:complete',
} as const;

export type LoadMoreEventDetail = {
  id: string;
};
