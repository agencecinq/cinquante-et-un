import { load } from 'piecesjs';
// @ts-ignore
import.meta.glob('../img/**/*');

import './cinq/index.ts';

// Static: these pieces can be injected by cart re-renders, and `load()` only checks the initial DOM.
import './components/CartDrawer.ts';
import './components/CartItem.ts';
import './components/CartQuantity.ts';
load('c-add-to-cart-button', () => import('./components/AddToCartButton.ts'));
load('c-cart-store-demo', () => import('./components/CartStoreDemo.ts'));
load('c-headroom', () => import('./components/Headroom.ts'));
load('c-load-more', () => import('./components/LoadMore.ts'));
load('c-menubar', () => import('./components/Menubar.ts'));
load('c-product-gallery', () => import('./components/ProductGallery.ts'));
load('c-product-price', () => import('./components/ProductPrice.ts'));
load('c-select-controller', () => import('./components/SelectController.ts'));
load('c-slideshow', () => import('./components/Slideshow.ts'));
load('c-table-of-contents', () => import('./components/TableOfContents.ts'));
load('c-variant-picker', () => import('./components/VariantPicker.ts'));
