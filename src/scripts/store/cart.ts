import { addCartItems } from '../api/addCartItems.ts';
import { fetchCart } from '../api/fetchCart.ts';
import { fetchSections } from '../api/fetchSections.ts';
import { updateCart } from '../api/updateCart.ts';
import { CartItem, CartSectionsOptions, CartSnapshot } from '../types/cart.ts';
import { Section } from '../types/section.ts';
import { cartSections } from './cartSections.ts';
import { renderSection } from './renderSection.ts';

export type CartAction = () => Promise<CartSnapshot>;

/**
 * Runs after each action, before the snapshot is committed. A middleware that
 * mutates the cart server-side must return a snapshot without `sections`:
 * the bundled markup from the original action would be stale, and omitting it
 * makes `commit` re-fetch every registered section on the page.
 */
export type CartMiddleware = (snapshot: CartSnapshot) => Promise<CartSnapshot>;
export type CartListener = (snapshot: CartSnapshot) => void;
export type CartPendingListener = (pending: boolean) => void;

class CartStore {
  private current: CartSnapshot | null = null;
  private listeners = new Set<CartListener>();
  private pendingListeners = new Set<CartPendingListener>();
  private middlewares: CartMiddleware[] = [];
  private queue: Promise<unknown> = Promise.resolve();
  private pendingCount = 0;

  constructor() {
    if (typeof window !== 'undefined' && window.cart) {
      this.current = window.cart;
    }
  }

  get(): CartSnapshot | null {
    return this.current;
  }

  subscribe(listener: CartListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to mutation lifecycle events. The listener is invoked with
   * `true` whenever the store transitions from idle to busy, and `false`
   * once all in-flight mutations have settled. The current state is
   * dispatched immediately upon subscription so that newly-mounted
   * components can sync without waiting for the next mutation.
   */
  subscribePending(listener: CartPendingListener): () => void {
    this.pendingListeners.add(listener);
    listener(this.pendingCount > 0);
    return () => {
      this.pendingListeners.delete(listener);
    };
  }

  use(middleware: CartMiddleware): () => void {
    this.middlewares.push(middleware);

    return () => {
      const index = this.middlewares.indexOf(middleware);

      if (index !== -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  mutate(action: CartAction): Promise<CartSnapshot> {
    this.pendingCount += 1;
    if (this.pendingCount === 1) this.notifyPending();

    const run = async (): Promise<CartSnapshot> => {
      try {
        let snapshot = await action();
        for (const middleware of this.middlewares) {
          snapshot = await middleware(snapshot);
        }
        await this.commit(snapshot);
        return snapshot;
      } finally {
        this.pendingCount -= 1;
        if (this.pendingCount === 0) this.notifyPending();
      }
    };

    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  add(items: CartItem[], options: CartSectionsOptions = {}): Promise<CartSnapshot> {
    return this.mutate(async () => {
      const added = await addCartItems(items, this.withSections(options));
      const fresh = await fetchCart();
      return { ...fresh, sections: added.sections };
    });
  }

  update(updates: Record<string, number>, options: CartSectionsOptions = {}): Promise<CartSnapshot> {
    return this.mutate(() => updateCart({ updates }, this.withSections(options)));
  }

  refresh(): Promise<CartSnapshot> {
    return this.mutate(() => fetchCart());
  }

  private withSections(options: CartSectionsOptions): CartSectionsOptions {
    return {
      sections: this.liveSections().map(({ id }) => id),
      sections_url: routes.cart_url,
      ...options,
    };
  }

  private liveSections(): Section[] {
    return cartSections.filter(({ id }) => document.getElementById(id));
  }

  private async commit(snapshot: CartSnapshot): Promise<void> {
    this.current = snapshot;

    // The cart already changed server-side: a failed re-render must not reject the mutation.
    try {
      await this.render(snapshot);
    } catch (error) {
      console.error('[cart] render error:', error);
    }

    this.notify(snapshot);
  }

  private async render(snapshot: CartSnapshot): Promise<void> {
    const sections = this.liveSections();
    if (!sections.length) return;

    const markup = snapshot.sections ?? (await fetchSections(sections.map(({ id }) => id)));

    for (const section of sections) {
      const html = markup[section.id];
      if (html) renderSection(html, section);
    }
  }

  private notify(snapshot: CartSnapshot): void {
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('[cart] listener error:', error);
      }
    });
  }

  private notifyPending(): void {
    const pending = this.pendingCount > 0;
    this.pendingListeners.forEach((listener) => listener(pending));
  }
}

const cart = new CartStore();
export default cart;
