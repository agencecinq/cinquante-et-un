import { Store } from '@agencecinq/store';
import { addCartItems } from '../api/addCartItems.ts';
import { fetchCart } from '../api/fetchCart.ts';
import { fetchSections } from '../api/fetchSections.ts';
import { updateCart } from '../api/updateCart.ts';
import { AddCartItem, Cart, CartSectionsOptions, CartSnapshot } from '../types/cart.ts';
import { Section, SectionsMarkup } from '../types/section.ts';
import { cartSections } from './cartSections.ts';
import { renderSection } from '../utils/renderSection.ts';

export type CartAction = () => Promise<CartSnapshot>;

/**
 * Runs after each action, before the snapshot is committed. Return the same
 * snapshot to pass through. Returning a new snapshot that still carries the
 * previous `sections` drops that markup (it may be stale after a server-side
 * change), so `run` re-fetches every registered section on the page.
 */
export type CartMiddleware = (snapshot: CartSnapshot) => Promise<CartSnapshot>;

/**
 * Cart state on top of `@agencecinq/store`, which brings the queue,
 * `subscribe`, `select` and `subscribePending`. Each action re-renders the
 * cart sections on the page before listeners are notified.
 */
class CartStore extends Store<Cart | null> {
  private middlewares: CartMiddleware[] = [];

  use(middleware: CartMiddleware): () => void {
    this.middlewares.push(middleware);

    return () => {
      const index = this.middlewares.indexOf(middleware);

      if (index !== -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  run(action: CartAction): Promise<Cart | null> {
    return this.mutate(async () => {
      let snapshot = await action();
      for (const middleware of this.middlewares) {
        const next = await middleware(snapshot);
        const reusesMarkup = next !== snapshot && next.sections === snapshot.sections;
        snapshot = reusesMarkup ? { ...next, sections: undefined } : next;
      }

      const { sections, ...cart } = snapshot;

      // The cart already changed server-side: a failed re-render must not reject the action.
      try {
        await this.render(sections);
      } catch (error) {
        console.error('[cart] render error:', error);
      }

      return cart;
    });
  }

  add(items: AddCartItem[], options: CartSectionsOptions = {}): Promise<Cart | null> {
    return this.run(async () => {
      const added = await addCartItems(items, this.withSections(options));
      const fresh = await fetchCart();
      return { ...fresh, sections: added.sections };
    });
  }

  update(updates: Record<string, number>, options: CartSectionsOptions = {}): Promise<Cart | null> {
    return this.run(() => updateCart({ updates }, this.withSections(options)));
  }

  refresh(): Promise<Cart | null> {
    return this.run(() => fetchCart());
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

  private async render(bundled?: SectionsMarkup): Promise<void> {
    const sections = this.liveSections();

    if (!sections.length) {
      return;
    }

    const markup = bundled ?? (await fetchSections(sections.map(({ id }) => id)));

    for (const section of sections) {
      const html = markup[section.id];

      if (html) {
        renderSection(html, section);
      }
    }
  }
}

const cart = new CartStore(typeof window !== 'undefined' ? (window.cart ?? null) : null);
export default cart;
