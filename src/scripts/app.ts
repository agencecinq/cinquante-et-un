import 'vite/modulepreload-polyfill'
import { load } from 'piecesjs';
import Swup from 'swup';

const loadComponents = () => {
	load('c-counter', () => import('./components/Counter.js'));
}

const swup = new Swup();

swup.hooks.on('page:view', () => loadComponents());

loadComponents();