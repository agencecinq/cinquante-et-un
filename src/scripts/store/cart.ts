import addItems from '../api/addItems.ts';
import getCart from '../api/getCart.ts';
import renderBundledSection from '../api/renderBundledSection.ts';
import renderSections from '../api/renderSections.ts';
import sections from '../utils/sections.ts';
import updateItems from '../api/updateItems.ts';
import { CartItem, CartSectionsOptions, CartSnapshot } from '../types/cart.ts';

export type CartAction = () => Promise<CartSnapshot>;
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
            const added = await addItems(items, options);
            const fresh = await getCart();
            return { ...fresh, sections: added.sections };
        });
    }

    update(
        updates: Record<string, number>,
        options: CartSectionsOptions = {},
    ): Promise<CartSnapshot> {
        return this.mutate(() => updateItems({ updates }, options));
    }

    refresh(): Promise<CartSnapshot> {
        return this.mutate(async () => this.current ?? (await getCart()));
    }

    private async commit(snapshot: CartSnapshot): Promise<void> {
        this.current = snapshot;

        if (snapshot.sections) {
            for (const { id, selectors } of sections) {
                const html = snapshot.sections[id];
                if (html) {
                    renderBundledSection(html, `#${id}`, selectors ?? null);
                }
            }
        } else {
            await renderSections(sections);
        }

        this.listeners.forEach((listener) => listener(snapshot));
    }

    private notifyPending(): void {
        const pending = this.pendingCount > 0;
        this.pendingListeners.forEach((listener) => listener(pending));
    }
}

const cart = new CartStore();
export default cart;
