import { Piece } from 'piecesjs';
import { messageFromError } from '../api/errors.ts';
import cart, { CartMiddleware } from '../store/cart.ts';
import { CartSnapshot } from '../types/cart.ts';
import { formatCurrency } from '../utils/format-currency.ts';

type LogKind = 'queue' | 'done' | 'error' | 'pending' | 'listener' | 'middleware';

const BURST_SIZE = 5;
const LATENCY_MS = 800;
const MAX_LOG_ENTRIES = 60;

/**
 * Showcase for the cart store: fires mutations and logs what the store
 * exposes (queue order, pending state, listeners, middleware).
 * Localized log templates come from the `messages` JSON script, with
 * `__TOKEN__` placeholders.
 */
class CartStoreDemo extends Piece {
  $log!: HTMLOListElement;
  $status!: HTMLElement;
  $panel!: HTMLElement;
  $count!: HTMLElement;
  $total!: HTMLElement;
  $lines!: HTMLElement;
  $notifications!: HTMLElement;

  private messages: Record<string, string> = {};
  private sequence = 0;
  private notifications = 0;
  private pending: boolean | null = null;
  private startedAt = performance.now();
  private unsubscribers: Array<() => void> = [];
  private removeLatency?: () => void;

  constructor() {
    super('CartStoreDemo');
  }

  mount() {
    this.$log = this.domAttr('log') as HTMLOListElement;
    this.$status = this.domAttr('status') as HTMLElement;
    this.$panel = this.domAttr('panel') as HTMLElement;
    this.$count = this.domAttr('count') as HTMLElement;
    this.$total = this.domAttr('total') as HTMLElement;
    this.$lines = this.domAttr('lines') as HTMLElement;
    this.$notifications = this.domAttr('notifications') as HTMLElement;
    this.messages = JSON.parse((this.domAttr('messages') as HTMLScriptElement | null)?.textContent || '{}');

    const current = cart.get();
    if (current) this.renderStats(current);

    this.unsubscribers.push(
      cart.subscribe(this.handleSnapshot),
      cart.subscribePending(this.handlePending),
    );
  }

  unmount() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.removeLatency?.();
  }

  add(): void {
    this.track('cart.add', () => cart.add([{ id: this.variantId, quantity: 1 }]));
  }

  burst(): void {
    for (let index = 0; index < BURST_SIZE; index += 1) {
      this.add();
    }
  }

  remove(): void {
    this.track('cart.update', () => cart.update({ [this.variantId]: 0 }));
  }

  refresh(): void {
    this.track('cart.refresh', () => cart.refresh());
  }

  toggleLatency(event: Event): void {
    const enabled = (event.currentTarget as HTMLInputElement).checked;

    if (enabled) {
      this.removeLatency = cart.use(this.latency);
      this.addEntry('middleware', this.message('middleware_on'));
      return;
    }

    this.removeLatency?.();
    this.removeLatency = undefined;
    this.addEntry('middleware', this.message('middleware_off'));
  }

  clear(): void {
    this.$log.replaceChildren();
    this.startedAt = performance.now();
  }

  /**
   * Log the mutation before calling the store so the "queued" line always
   * precedes the pending notification it triggers.
   */
  private track(action: string, run: () => Promise<CartSnapshot>): void {
    const id = this.sequence + 1;
    this.sequence = id;
    this.addEntry('queue', this.message('queued', { id, action }));

    run()
      .then(() => this.addEntry('done', this.message('done', { id, action })))
      .catch((error) => {
        this.addEntry('error', this.message('failed', { id, action, message: messageFromError(error) }));
      });
  }

  private latency: CartMiddleware = async (snapshot) => {
    this.addEntry('middleware', this.message('middleware', { ms: LATENCY_MS }));
    await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    return snapshot;
  };

  private handleSnapshot = (snapshot: CartSnapshot): void => {
    this.notifications += 1;
    this.renderStats(snapshot);
    this.addEntry(
      'listener',
      this.message('listener', {
        count: snapshot.item_count,
        total: formatCurrency(snapshot.total_price, Shopify.money_format),
      }),
    );
  };

  private handlePending = (pending: boolean): void => {
    this.$panel.toggleAttribute('aria-busy', pending);
    this.$status.textContent = this.message(pending ? 'status_busy' : 'status_idle');

    // `subscribePending` replays the current state on subscribe; only log changes.
    if (this.pending !== null) {
      this.addEntry('pending', this.message('pending', { value: String(pending) }));
    }

    this.pending = pending;
  };

  private renderStats(snapshot: CartSnapshot): void {
    this.$count.textContent = String(snapshot.item_count);
    this.$total.textContent = formatCurrency(snapshot.total_price, Shopify.money_format);
    this.$lines.textContent = String(snapshot.items.length);
    this.$notifications.textContent = String(this.notifications);
  }

  private addEntry(kind: LogKind, text: string): void {
    const $entry = document.createElement('li');
    $entry.className = 'flex gap-3 px-3 py-2';
    if (kind === 'error') $entry.classList.add('font-semibold');

    const $time = document.createElement('span');
    $time.className = 'shrink-0 text-gray-500 tabular-nums';
    $time.textContent = `+${((performance.now() - this.startedAt) / 1000).toFixed(2)}s`;

    const $kind = document.createElement('span');
    $kind.className = 'w-20 shrink-0 text-gray-500';
    $kind.textContent = kind;

    const $text = document.createElement('span');
    $text.textContent = text;

    $entry.append($time, $kind, $text);
    this.$log.append($entry);

    while (this.$log.childElementCount > MAX_LOG_ENTRIES) {
      this.$log.firstElementChild?.remove();
    }

    this.$log.scrollTop = this.$log.scrollHeight;
  }

  private message(key: string, vars: Record<string, string | number> = {}): string {
    return Object.entries(vars).reduce(
      (text, [name, value]) => text.replaceAll(`__${name.toUpperCase()}__`, String(value)),
      this.messages[key] ?? key,
    );
  }

  get variantId(): string {
    return this.getAttribute('data-variant-id') || '';
  }
}

customElements.define('c-cart-store-demo', CartStoreDemo);
