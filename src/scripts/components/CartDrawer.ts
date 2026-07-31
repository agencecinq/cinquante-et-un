import { Piece } from 'piecesjs';
import cart from '../store/cart.ts';

class CartDrawer extends Piece {
    private unsubscribe?: () => void;

    constructor() {
        super('CartDrawer');
    }

    mount() {
        this.unsubscribe = cart.subscribePending((pending) => {
            if (pending) {
                this.setAttribute('aria-busy', 'true');
            } else {
                this.removeAttribute('aria-busy');
            }
        });
    }

    unmount() {
        this.unsubscribe?.();
    }
}

if (!customElements.get('c-cart-drawer')) {
    customElements.define('c-cart-drawer', CartDrawer);
}
