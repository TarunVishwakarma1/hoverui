# Architecture

hover-ui is two things in one repository:

1. **The registry:** the cursor components and the `useCursor` hook they all depend on, which users install into their own projects with the shadcn CLI.
2. **The site:** hoverui.fun, a Next.js app that presents every cursor as a live preview and serves the registry files.

```
components/cursors/*.tsx ──┐
hooks/use-cursor.ts ───────┤
                           │   registry.json ── shadcn build ──► public/r/<name>.json ──► npx shadcn add
                           │        │
                           │        ▼
                           └──► app/catalog.tsx ──► app/page.tsx                    (home, featured cursors)
                                (cursors, hooks,      app/(docs)/cursors/page.tsx     (gallery of all cursors)
                                 categories,          app/(docs)/cursors/[name]/...   (one cursor: preview, install, source)
                                 specimens)           app/(docs)/hooks/[name]/...     (one hook: install, API, source)
```

`registry.json` is the single source of truth. The CLI reads it to build installable files, and the site reads it for every cursor's name, title, description, category and source files.

## The registry

### Files and install targets

There are two kinds of item:

- **Cursors** (`registry:component`) ship one file each, targeted at `@components/cursors/<name>.tsx`. Each lists the hook in `registryDependencies` as `https://hoverui.fun/r/use-cursor.json`.
- **The hook** (`registry:hook`, name `use-cursor`) ships `hooks/use-cursor.ts` with no target, so the CLI puts it in the project's hooks alias (`@/hooks` by default).

Cursor files import `@/hooks/use-cursor`, and the CLI rewrites that import to the project's own hooks alias on install. A project whose hooks alias is `@/lib/hooks` gets `@/lib/hooks/use-cursor`; this was checked against the real CLI. The hook is installed with the first cursor and skipped afterwards when identical, so a project holds exactly one copy.

The dependency URL is absolute on purpose. The shadcn CLI reads a relative entry like `./use-cursor.json` as a file in the user's project, not as a path next to the registry item. Local installs of a cursor therefore fetch the published hook; to test hook changes, install `http://localhost:3000/r/use-cursor.json` first.

`shadcn build` writes `public/r/<name>.json` and `public/r/registry.json`. It runs before `next dev` and `next build` (see `package.json`). The output is generated and gitignored.

### The cursor engine: `hooks/use-cursor.ts`

Every cursor is a small client component that renders an `aria-hidden`, `pointer-events: none`, `position: fixed` overlay and hands the hook one `frame` callback. The hook owns everything else:

- **The area is the parent element.** On mount, the cursor's parent gets `data-cursor-area`. A style tag injected once hides the native cursor inside every area.
- **Gating.** Nothing attaches unless the device has a fine, hovering pointer: `(hover: hover) and (pointer: fine)`.
- **Events.**
  - `pointermove` and `pointerover` set the position, the element under the pointer and `pointer.hover`. `pointerover` matters: scrolling under a still pointer fires boundary events but no move. Touch pointers are ignored, so a touchscreen laptop's taps never wake the mouse cursor.
  - `pointerleave` deactivates the cursor.
  - `pointerdown` (main button only) and `pointerup` track the press; window `blur` releases it. A right-click opens a menu that swallows its `pointerup`, which is why only the main button counts.
- **Hover.** `pointer.hover` is the closest `INTERACTIVE` element above the target, but only if it sits inside the area. A link that wraps the whole area, like a gallery tile, is not a hover inside it. Cursors read `pointer.hover` instead of walking the DOM themselves.
- **Nesting.** On each event, an area is active only if the closest `[data-cursor-area]` above the target is that area, so the innermost cursor wins and outer cursors hand over.
- **Sharing.** Several cursors in one element share one area: the hook keeps a module-level map from each area element to its cursors, with one pointer, one set of listeners and one loop. The first cursor in an element opens the area and the last to leave closes it, so each can unmount on its own. A cursor that joins while the pointer is already inside gets a first frame of its own with `dt` 0, so its set-up runs.
- **The frame loop.** `requestAnimationFrame` runs only while the area is active. Each frame calls every cursor's `frame(pointer, element)`, in the order they mounted. Cursors write `transform` directly on their elements; nothing per frame goes through React state.
- **Smoothing.** `pointer.ease(speed)` returns `1 - exp(-speed * dt)`, which is frame-rate independent. It returns `1` (snap) on the first frame after entering and always under `prefers-reduced-motion`.
- **Time.** `pointer.dt` is the seconds since the last frame (capped at 0.1, and 0 on the entry frame) for springs, particles and anything time-based. `pointer.reduced` tells a cursor to skip motion of its own: trails collapse, particles stop, bobbing and spinning hold still.
- **Visibility.** The root toggles `data-active`, which fades it in and out over 150ms (`cursorRoot` classes).

A cursor's own look is whatever its frame callback draws: Ring lerps a ring behind an exact dot, Trail chains its followers (fourteen by default), Blend scales a difference-blended disc, Label reads `data-cursor-label` into a pill, and Register pairs an exact crosshair with an opening ring. The drawn cursors also export their artwork as `<Name>Art` (or `StampMark`), which the site reuses for the resting drawings. Two cursors reach outside their overlay: Magnet sets the hovered control's inline `translate` and releases it with a Web Animation when the pointer leaves it, and Coin bumps the clicked control with a 200ms Web Animation of its `translate`. Others only look: Top and Galley read the hovered control's box to draw round it, and Black hole and Magnifier bend the page behind them with an SVG `feDisplacementMap` used as a `backdrop-filter`, each map drawn once into a canvas on the first frame: a gravitational lens (pull θE²/r) for Black hole, a uniform zoom inside a circle for Magnifier, whose strength the frame changes through the filter's `scale`.

### Known limits

- `position: fixed` resolves against a transformed, filtered or contained ancestor instead of the viewport. The fix, if needed, is to portal the overlay to `<body>` while keeping the area as the parent.

## The site

Next.js 16 App Router, React 19, Tailwind CSS v4, Bun. Every route is statically prerendered.

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | The first five cursors (`featured`), the placement demo, the global Register cursor. |
| `/cursors` | `app/(docs)/cursors/page.tsx` | A search field, then a gallery of live preview tiles in one section per category (`#<category>` anchors; each heading links to its category page): each tile wears its cursor on hover, shows a resting `Scene` otherwise, and opens its page. `CursorSearch` (`app/client.tsx`) filters the server-rendered tiles through context (`SearchSection`, `SearchItem` hide what doesn't match, so tiles stay mounted) and keeps the query in `?q=`, read once on arrival inside a `Suspense` boundary so the gallery still prerenders. |
| `/cursors/[name]` | `app/(docs)/cursors/[name]/page.tsx` | `generateStaticParams` from the registry, `dynamicParams = false`. Source files are read from disk at build time; the Usage snippet takes the component's name from the source, and "How it behaves" is the doc comment above its exported `…Cursor`. "More <kind> cursors" lists its category's other cursors. |
| `/categories/[id]` | `app/(docs)/categories/[id]/page.tsx` | One page per registry category (`generateStaticParams`, `dynamicParams = false`): its lead from `categoryIntros`, its tiles (`CursorTile`), links to every other kind, and `CollectionPage` plus `BreadcrumbList` structured data. The sidebar's group labels and the gallery's section headings link here. |
| share cards | `app/og.tsx`, `opengraph-image.tsx` beside the cursor and category pages | `ogPlate` draws each card with `next/og` at build time, in Host Grotesk and Fragment Mono read from `assets/fonts` (SIL Open Font License, the licenses beside them), so building never needs the network. Those pages spread `ogFields` into their Open Graph metadata, without an image, so the drawn card is the one used. |
| `/llms.txt` | `app/llms.txt/route.ts` | The library as Markdown for language models (llmstxt.org), built from the registry and prerendered (`dynamic = "force-static"`). |
| `/hooks/[name]` | `app/(docs)/hooks/[name]/page.tsx` | One page per `registry:hook` item: install, the cursors that use it, a custom-cursor example, API and source. |
| site search | `app/client.tsx` (`SiteSearch`), `app/search.tsx` | The field in the sticky bar on every page. Its panel (`search.tsx`, matches plus the highlighted cursor live) is a `lazy` import, so the cursors it previews load the first time someone focuses or hovers the search, not with every page. It ranks with the gallery's own `searchWords` and `searchFind` over `cursors[].search`, plus the hooks. |
| docs layout | `app/(docs)/layout.tsx` | The sidebar beside every `/cursors` and `/hooks` page (from `lg`): cursors grouped by `categories`, then Hooks; `NavLink` marks the current entry with the registration mark. The `(docs)` route group adds no URL segment. |
| `/robots.txt`, `/sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` | Generated from `registry.json`, including its `homepage`; the sitemap lists every cursor, hook and category page. |
| 404 | `app/not-found.tsx` | Points a missed link to the search and every kind of cursor. |
| `/r/<name>.json` | `public/r/` | The installable registry files. |

### Data: `app/catalog.tsx`

This module turns `registry.json` into what the pages render:

- **`cursors`:** name, title, description, category, files, `author`, `search` and a `Cursor` component, which renders a `LiveCursor` (see Loading below). `search` is the text the gallery search matches: the name both ways it is written (`black-hole`, `blackhole`), the category and a few words people use for it (`categoryTerms`: Halloween is also spooky, Space is also sci-fi), the description, and the registry item's `meta.keywords`. A query matches when every word in it is a whole word of that text (plurals count), falling back to word starts while nothing matches whole, so a half-typed word still finds things. `author` comes from the registry item's `author` field ("Name <url>"), set only on contributed cursors; their page shows it as "Contributed by" and in its `SoftwareSourceCode` structured data. The site shows no cursor numbers; only the README's table numbers them, in registry order.
- **`categories`:** the cursors grouped by category, in registry order, each with an `id` (its slug) and an `intro` sentence from `categoryIntros`; `getCategory(id)` finds one.
- **`featured`:** the first five.
- **`Scene`** (`app/scenes.tsx`): each cursor drawn at rest, engaged with a small target (`data-resting`). Gallery tiles show it on touch and before a pointer arrives; it fades while the live cursor is active. Scenes are server components that draw each cursor's own `<Name>Art` through its `art()` wrapper in `app/live.tsx`, imported from `./live` rather than from the cursor file (see Loading); like any server component, they can render client components but not call functions or read arrays from a `"use client"` module.
- **`Specimen`:** the composition inside each cursor page's preview. Ring, Trail, Blend, Label and Register have their own; every other cursor gets its `Scene`, a line of copy, a button to hover and press, and a link back to the gallery.
- **`cursorTone`:** the site mounts its cursors with `text-white mix-blend-difference`, so they read over paper and over ink-filled hover states in both themes. The exceptions keep their own colors: Label's pill carries words, the colorful and drawn cursors would turn to negatives, and Flashlight's dark would become a glare.

### Loading: `app/live.tsx`

No page imports cursor files up front. If one did, every page would carry all of them: a server module that imports a client module makes it part of that route's client chunks, and the catalog and the scenes are imported almost everywhere. Instead, `app/live.tsx` lists every cursor file as a dynamic `import()`, so each is a chunk of its own:

- **`LiveCursor`** renders a cursor by its registry name, picked out of its file by the one export ending in "Cursor". Eager where the cursor is the point of the page (its own page, the home hero, the search preview), it is fetched once the page is up; otherwise, as in the gallery, the first time the pointer comes over its area. Until it arrives, the cursor outside the area carries on.
- **`art()`** wraps each cursor's art for the scenes. The server draws it into the HTML; a page that arrives with that HTML keeps it as it is (the wrapper finds its own span by `useId` and passes its `innerHTML` back as `dangerouslySetInnerHTML`), since a still picture has nothing to hydrate. Only art that first appears in the browser, after a client-side navigation, fetches its file, and the navigation waits for it.

The cursor files themselves stay whole, one file per cursor, exactly as `shadcn add` installs them. Register (the site's own cursor, in the root layout) and the home page's placement demo (Blend and Label) import their files directly, since those pages always show them. Every page type ships about 145 KB of compressed JavaScript.

### Theming

The design tokens live in `app/globals.css` (`@theme`). The dark "Black-stock edition" redefines the same eight color tokens under `:root[data-theme="dark"]`. Nothing else changes: there are no `dark:` utilities and no per-component overrides.

A blocking inline script in `app/layout.tsx` sets `data-theme` before first paint: a stored choice (`localStorage` "theme") wins, otherwise the OS setting, which it keeps following live. `<html>` carries `suppressHydrationWarning` because the script rewrites the attribute before React hydrates. `ThemeToggle` (`app/client.tsx`) reads the attribute through `useSyncExternalStore`, writes the choice and switches through a View Transition crossfade where supported.

### SEO

- **Metadata:** canonical URLs, titles and descriptions on every route; shared Open Graph fields and the share card (`public/og.png`) come from `siteOpenGraph` in `app/ui.tsx`. A page that sets its own `openGraph` replaces the layout's whole object, which is why the image is listed there rather than as a file convention.
- **JSON-LD** through the `JsonLd` helper, which escapes `<`:
  - `WebSite` on home;
  - `CollectionPage` with an `ItemList` and a `BreadcrumbList` on `/cursors`;
  - `SoftwareSourceCode` and a `BreadcrumbList` on each cursor page.
- **Internal links:** the sticky bar, the gallery and the sidebar link every cursor page from every other.

### Design system

The site's visual world is recorded in `DESIGN.md` (tokens, type, components, rules) and its product truth in `PRODUCT.md`. Both are maintained with the impeccable design skill; its working files live in `.impeccable/` (gitignored).

## The Cursor Mixer (planned)

The Cursor Mixer will let paying users combine the effects of different cursors, for example a Trail with a Label pill and a Blend disc, and tune them. It is not built yet, and it will not live in this repository.

What it needs from the open core:

- **Shared areas.** Done: several cursors share one element and unmount independently (see Sharing above).
- **One loop per area.** Done: one `requestAnimationFrame` loop and one pointer per area, calling each cursor's frame in the order they mounted. The `frame(pointer, element)` contract lets an effect be a plain function, which is the unit a mixer composes.
- **Effect parameters.** Started: speeds, sizes and scales that were constants become typed props with the old values as defaults, so a mixer can edit them and export the result. Ring, Trail, Blend and Label have them (`size`, `speed`, `swell`, `length`), and every cursor added since is written with its own (Rimlight's `radius`, Thread's `text`, Cipher's `glyphs`), each with a doc comment the cursor's page lists. The same names carry across cursors, so one control can tune several.

Licensing boundary: the core stays MIT in this repository. The Mixer (its UI, effect presets and any composition runtime beyond what the core needs) ships separately under a commercial license. Decided: the Mixer is a hosted page on hoverui.fun, unlocked for subscribers, that previews a mix live and exports it; subscribers install their mixes from a token-authenticated shadcn registry, the same `npx shadcn add` flow as the free cursors. Billing is a monthly subscription through Stripe. Core improvements the Mixer depends on, like shared areas, are made here, in the open, under MIT.
