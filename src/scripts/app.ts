import { load } from 'piecesjs';
// @ts-ignore
import.meta.glob('../img/**/*');

import './cinq/index.ts';

import './components/CartDrawer.ts';
import './components/CartItem.ts';
import './components/CartQuantity.ts';

void import('./predictive-search-mount.ts');

load('c-add-to-cart-button', () => import('./components/AddToCartButton.ts'));
load('c-headroom', () => import('./components/Headroom.ts'));
load('c-load-more', () => import('./components/LoadMore.ts'));
load('c-menubar', () => import('./components/Menubar.ts'));
load('c-price', () => import('./components/Price.ts'));
load('c-select-controller', () => import('./components/SelectController.ts'));
load('c-slideshow', () => import('./components/Slideshow.ts'));
load('c-table-of-contents', () => import('./components/TableOfContents.ts'));
load('c-toast', () => import('./components/Toast.ts'));
load('c-variants-picker', () => import('./components/VariantsPicker.ts'));
