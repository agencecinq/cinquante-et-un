# Cinq starter — reference

Read [AGENTS.md](../../../AGENTS.md) first. Open this for paths, fork token recipe, and checklists.

Aligned with production forks: Ace Pool, Milia Matcha, Zhiggie (same Vite / Tailwind / piecesjs / `@agencecinq` stack).

## Directory map

```
sections/           # Theme sections (+ *-group.json)
blocks/             # Theme blocks (thin wrappers around snippets when possible)
snippets/           # *.html.liquid → render 'name.html'
templates/          # JSON templates
layout/             # theme.liquid seeds window.routes + window.cart
locales/            # every language + *.schema.json
config/             # settings_schema.json, settings_data.json
src/
  scripts/
    app.ts          # piecesjs loads + cart pieces + mounts
    cinq/           # @agencecinq side-effect imports
    components/     # c-* custom elements
    store/cart.ts   # Ajax cart queue
    api/            # addItems, updateItems, getCart, renderSections, …
    utils/          # sections.ts, events, i18n, …
    types/          # cart, section, …
  stylesheets/
    styles.css      # tailwind → theme → base → utilities → components
    theme.css       # @theme (starter: fonts; forks: brand)
    components/     # button, surface, subtitle, tag, wysiwyg, …
    utilities/      # container, scrollbar-hidden, slideshow, …
  icons/            # SVG → assets sprite (icon- prefix)
assets/             # build outputs — don’t hand-edit hashed bundles
```

## Starter vs fork — tokens

**Starter** (`theme.css`):

```css
@theme {
  --font-sans: var(--font-primary--family), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-secondary--family), ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
}
```

**Fork** (Ace / Milia / Zhiggie pattern):

1. In `@theme`, optionally `--color-*: initial` / `--text-*: initial`
2. Define named brand colors + type scales (size, line-height, weight as needed)
3. Wire component CSS (`.button`, typography helpers) to those vars
4. Keep Shopify scheme RGB / `.color-{{ scheme.id }}` in `snippets/css-variables.liquid`

## Cart re-render contract

`src/scripts/utils/sections.ts` lists section ids returned by Cart Ajax / Section Rendering.

Adding a live cart region:

1. Mark a stable `.js-*` root
2. Add it to `selectors` for `cart-drawer` and/or `cart`
3. Keep form/item ids stable (`CartForm-{{ id }}`, …)

Also re-render `cart-count-bubble` for the header badge.

## Snippet conventions

| Pattern | Use |
|---------|-----|
| `name.html.liquid` | Interactive / UI snippets → `render 'name.html'` |
| `{% doc %}` | `@param` + `@example` on shared snippets |
| `_partial.html.liquid` | Private partials (optional; used on some forks) |
| No `.html` | Infra: `css-variables`, `meta-tags`, `vite-tag`, sometimes `image` |

## Section conventions

Mirror `sections/blog.liquid` / `section-form.liquid`:

1. Padding assigns + optional `compensate_header`
2. `{%- style -%}` → `.section-{{ section.id }}-padding`
3. `container` + 4/12 grid when laying out
4. Schema: `t:sections.shared.settings.padding.*`, `compensate_header`, `color_scheme`
5. Preset only if addable in the editor

`compensate_header` fallback (`4.5rem` in starter) must match real header height on the project.

## Drawer params

`{% render 'cinq-drawer.html', id:, content:, direction: 'from-left'|'from-right'|'from-bottom', background:, margin_top:, classes: %}`

Do not permanently edit the snippet body — `cinqDrawerPlugin()` regenerates it.

## Localization

- Settings: footer `show_localization`
- Form fields: `country_code`, `locale_code`
- `c-select-controller` + `data-action="submit"`; flags via `data-dom="flag"` / `data-flag-src`
- Hide UI when only one country **and** one language

## Free delivery progress

- Theme settings `free_delivery_*` (amount in major units)
- `snippets/cart-progress.html`: cents math, `scale-x-(--progress)`, remaining vs success copy
- Hide when threshold ≤ 0

## Styling checklist

- [ ] Starter: fonts-only `@theme`; fork: brand tokens centralized in `theme.css`
- [ ] Chrome matches context (wireframe **or** project design — don’t mix)
- [ ] Prefer shared classes (`.button`, `.surface`, `.wysiwyg`, `.tag`, `.subtitle`)
- [ ] Spacing on Tailwind scale; avoid random `*.5` unless matching an existing control
- [ ] Drawers: `data-dom="button"` + matching `aria-controls` / `id`
- [ ] New strings in **all** `locales/*.json` + schema files as needed
- [ ] No classic customer-account templates

## Onboarding a store / fork

1. `pnpm install`
2. `cp shopify.theme.toml.example shopify.theme.toml`
3. Add storefront origin to `vite.config.js` → `server.cors.origin`
4. `pnpm dev`
5. Markets / languages → footer localization
6. Cart free-delivery settings
7. Menus: header `main` / `secondary`, footer `footer`
8. If branding: define `@theme` tokens, then restyle components

## Cleanup radar

Confirm with ripgrep, then delete:

- Orphan snippets (only self-`@example` references)
- Locale keys for removed UI
- Stale hashed files under `assets/` after `pnpm build`
- Shop-specific metafield reads not part of the starter contract
