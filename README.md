# Cinquante-et-un

Opinionated Shopify theme **starter** for Cinq projects — Vite 8, Tailwind 4, piecesjs, `@agencecinq/*`.

Wireframe ecommerce baseline (header, collection, PDP, cart drawer, localization). Not a Theme Store submission: classic **customer account** templates are out of scope (use Shopify’s New Customer Accounts / hosted login).

## Prerequisites

- [Node.js](https://nodejs.org/) LTS
- [pnpm](https://pnpm.io/) 12 (`corepack enable && corepack prepare pnpm@12.4.2 --activate`)
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
- **Web components:** full `@agencecinq/*` UI kit (accordion, calendar, combobox, disclosure-button, drawer, modal, spinbutton, switch, tabs, toast, windowsplitter) — registered via `src/scripts/cinq/`
- **Toast:** layout `<cinq-toast>` (`role` set in Liquid); helpers in `src/scripts/cinq/toast.ts` (`showToast`, pause wiring)
- **Drawer Liquid:** `cinqDrawerPlugin()` copies `snippets/cinq-drawer.html.liquid` on each Vite start — **do not edit that snippet**; override with CSS / params
- **Cart:** Ajax APIs + Section Rendering (`cart-drawer`, `cart`, `cart-count-bubble`). Header badge uses snippet `id="cart-count-bubble"`; section file exists for bundled re-renders
- **piecesjs:** `load('c-*', …)` for lazy custom elements
- **Style guide:** section `section-styleguide` on the homepage — CSS foundations (tokens / `.subtitle` / `.surface` / `.tag`), philosophy, features, buttons, and live `@agencecinq/*` demos
- **CSS tokens:** `src/stylesheets/theme.css` — prefer `--color-*` / `--text-*` and shared classes over one-off greys

## Deploy

```bash
pnpm build
shopify theme push --environment production
```

`shopify.theme.toml` is gitignored — never commit store passwords.

## For coding agents

Theme conventions live in **[AGENTS.md](./AGENTS.md)** (tool-agnostic). Claude Code also reads [CLAUDE.md](./CLAUDE.md). On-demand skill + deep reference: [`.agents/skills/cinq-starter/`](.agents/skills/cinq-starter/) (symlinked for Cursor / Claude under `.cursor/skills/` and `.claude/skills/`).

## License

MIT — see [LICENSE](./LICENSE).
Built by [CINQ - Agence Wordpress & Shopify](https://agencecinq.com).
