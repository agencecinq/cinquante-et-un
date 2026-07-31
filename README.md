# Cinquante-et-un

Shopify theme **starter** for Cinq projects — Vite 8, Tailwind 4, piecesjs, `@agencecinq/*`.

Wireframe ecommerce baseline (header, collection, PDP, cart drawer, localization). Not a Theme Store submission: classic **customer account** templates are out of scope (use Shopify’s New Customer Accounts / hosted login).

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- [pnpm](https://pnpm.io/) 11 (`corepack enable && corepack prepare pnpm@11.1.3 --activate`)
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli)

## Setup

```bash
pnpm install
cp shopify.theme.toml.example shopify.theme.toml
# edit store / theme / passwords
```

Add your storefront origin to `vite.config.js` → `server.cors.origin` for HMR (see comment in file).

```bash
pnpm dev
```

| Command | Description |
|---------|-------------|
| `pnpm dev` | Theme preview + Vite watch |
| `pnpm build` | Production assets → `assets/` |
| `pnpm shopify:dev` | Shopify CLI only |

## Architecture

- **Entry:** `src/scripts/app.ts` + `src/stylesheets/styles.css`
- **Web components:** `@agencecinq/drawer`, accordion, disclosure-button, spinbutton — registered via `src/scripts/cinq/`
- **Drawer Liquid:** `cinqDrawerPlugin()` copies `snippets/cinq-drawer.html.liquid` on each Vite start — **do not edit that snippet**; override with CSS / params
- **Cart:** Ajax APIs + Section Rendering (`cart-drawer`, `cart`, `cart-count-bubble`). Header badge uses snippet `id="cart-count-bubble"`; section file exists for bundled re-renders
- **piecesjs:** `load('c-*', …)` for lazy custom elements

## Deploy

```bash
pnpm build
shopify theme push --environment production
```

`shopify.theme.toml` is gitignored — never commit store passwords.

## License

MIT — see [LICENSE](./LICENSE).
