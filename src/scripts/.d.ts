declare const Shopify: {
  routes: {
    root: string;
  };
  money_format: string;
};

declare const routes: {
  cart_add_url: string;
  cart_change_url: string;
  cart_update_url: string;
  cart_url: string;
  predictive_search_url: string;
};

interface Window {
  routes: typeof routes;
  shopUrl: string;
  cart?: import('./types/cart.ts').CartSnapshot;
}
