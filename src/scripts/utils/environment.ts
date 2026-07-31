import { throttle } from '@agencecinq/utils';

const html = document.documentElement;
const { body } = document;
const isDebug = html.hasAttribute('data-debug');

const scroll = {
  y: 0,
  x: 0,
};

const mouse = {
  x: 0,
  y: 0,
};

window.addEventListener(
  'pointermove',
  throttle(({ x, y }: PointerEvent) => {
    mouse.x = x;
    mouse.y = y;
  }, 100),
  { passive: true },
);

export { html, body, isDebug, scroll, mouse };
