# Cinq Shopify theme starter

Read this before changing the theme. Prefer matching existing patterns over inventing new ones. Practices align with production forks (Ace Pool, Milia Matcha, Zhiggie).

Deeper paths, fork token recipe, and checklists: [`.agents/skills/cinq-starter/reference.md`](.agents/skills/cinq-starter/reference.md).

## Starter vs project fork

| Context | Expectation |
|---------|-------------|
| **Maintaining the starter** | Keep the wireframe baseline (Tailwind defaults, black/white chrome). Don’t invent brand tokens “for consistency”. |
| **Project fork** | Override freely: centralize brand in `src/stylesheets/theme.css` `@theme`, restyle drawers/menus/type to match design. Magic values (e.g. header height fallback) are design-specific — match the project. |

## Stack (do not replace)

| Layer | Choice |
|-------|--------|
| Theme | Shopify OS 2.0 (JSON templates + sections) |
| Build | Vite 8 + `vite-plugin-shopify` + **pnpm** 11 |
| CSS | Tailwind 4 — starter: defaults; forks: `@theme` overrides |
| JS | piecesjs `load('c-*', …)` + `@agencecinq/*` |
| Accounts | New Customer Accounts only (classic/legacy deprecated by Shopify) |

Dev: `pnpm install` → `pnpm dev`. Build: `pnpm build`.

## First 60 seconds

1. Skim `README.md` (architecture lives here + this file — don’t invent a parallel stack).
2. Entrypoints: `src/scripts/app.ts`, `src/stylesheets/styles.css`.
3. Living docs: `section-styleguide` on the homepage.
4. Snippets: `foo.html.liquid` → `{% render 'foo.html' %}` (+ `{% doc %}` on shared UI).
5. Layout seeds `window.routes` + `window.cart` in `layout/theme.liquid`.

## Hard rules

1. **Tokens** — Starter `theme.css` only bridges Shopify fonts → `--font-sans` / `--font-serif`. Forks: reset/extend in `@theme` (often `--color-*: initial` then named palette) and map tokens into component CSS — not scattered Liquid arbitraries. Shopify color schemes stay in `snippets/css-variables.liquid`.
2. **Wireframe baseline** — Starter chrome: `border-black`, white surfaces, `text-sm` / `font-medium`. Replace on forks once branding exists.
3. **Shared classes** — `.button` (+ variants), `.surface`, `.subtitle`, `.tag`, `.wysiwyg` over one-offs.
4. **Generated / plugin-owned**
   - `snippets/vite-tag.liquid` — vite-plugin-shopify
   - `snippets/cinq-drawer.html.liquid` — overwritten by `cinqDrawerPlugin()` on Vite start; style via params / CSS
5. **Customer accounts** — Shopify deprecated classic accounts; do not add `customers/*` templates.
6. **No leftovers** — orphan snippets, unused locale keys, shop-specific metafields unless requested.
7. **Locales** — mirror keys in **every** storefront locale under `locales/` (starter: `en.default.json` + `fr.json`; plus any languages the project adds) and `*.schema.json`. Schema uses `t:` keys; reuse `t:sections.shared.settings.*`.

## Contracts to respect

### Cart Ajax

- Store: `src/scripts/store/cart.ts` (queued mutations, `subscribe` / `subscribePending`)
- Registry: `src/scripts/utils/sections.ts` — ids + optional `.js-*` selectors
- Prefer bundled section HTML from cart Ajax; fallback `?sections=`
- Live drawer roots: `.js-cart-header` / `.js-cart-items` / `.js-cart-footer`
- Mount cart drawer globally from layout (`{% section 'cart-drawer' %}`)
- Pending UI: `aria-busy` via `subscribePending`

### Drawers

- Capture → `{% render 'cinq-drawer.html', id:, content:, direction:, background: %}`
- Trigger: `<cinq-drawer-button>` + `data-dom="button"` + matching `aria-controls`
- Chrome: `{% render 'drawer-header.html', title:, id: %}`
- Optional offset under sticky header: `margin_top` / CSS vars (project-specific)

### Localization

- Footer `show_localization` → button → `locale-currency-drawer` → `{% form 'localization' %}`
- `country_code` / `locale_code` + `c-select-controller` (`data-action="submit"`)
- Render only if multiple countries or languages

### JS

- `@agencecinq/*` in `src/scripts/cinq/index.ts`
- Lazy pieces: `load('c-name', () => import('./components/Name.ts'))` in `app.ts`
- Check `@agencecinq` before inventing drawer/modal/tabs/spinbutton/combobox
- Icons: `src/icons/*.svg` → sprite → `{% render 'use.html', icon: %}`
- Prefer `@agencecinq/utils` `EVENTS` when covered

## UI patterns

### Section padding

Copy blog/form/collection:

- `padding_top` / `padding_bottom` (px → rem; mobile often `× 0.6`)
- Optional `compensate_header` → `calc(… + var(--header-height, …))` — **fallback is design-specific** (starter `4.5rem`)
- Wrapper: `section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}`
- Grid rhythm: `container` + `grid-cols-4` / `lg:grid-cols-12`
- Breakpoint habit: `width >= 64rem` (lg)

### Forms / buttons / rich text

- Buttons: `{% render 'button.html', … %}`
- Inputs: border + transparent bg (starter: `border-black`); forks follow brand tokens
- Rich HTML: `.wysiwyg` (also styles nested Shopify `.rte` / metafield wrappers)

## When adding something

| Adding | Do this |
|--------|---------|
| Section | Liquid + schema + all locale/schema files; padding/color_scheme; wire template JSON |
| Snippet | `name.html.liquid` + `{% doc %}`; optional `_` prefix for private partials |
| Piece | `components/` + `load()` in `app.ts` |
| Style | Utilities / existing components; new shared → `src/stylesheets/components/` + import in `styles.css` |
| Live cart UI | Stable `.js-*` root + update `sections.ts` |
| Brand (fork) | Tokens in `theme.css` `@theme`, then components — not Liquid one-offs |

## Anti-patterns

- Polluting the **starter** with ad-hoc `@theme` scales (forks: centralize in `theme.css`)
- Treating starter wireframe greys/uppercase/`font-bold` as sacred on a branded fork — replace to match design
- Hard-coding header offsets without checking project `--header-height`
- Inventing components already in `@agencecinq/*`
- Editing `cinq-drawer.html.liquid` / `vite-tag.liquid` expecting changes to stick
- `{% include %}` instead of `{% render %}`
- Leaving orphan snippets / locale keys after removals
- Classic `customers/*` account templates
