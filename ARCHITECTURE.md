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
- **Nesting.** On each event, a cursor is active only if the closest `[data-cursor-area]` above the target is its own area, so the innermost cursor wins and outer cursors hand over.
- **The frame loop.** `requestAnimationFrame` runs only while the cursor is active. Each frame calls `frame(pointer, element)`. Cursors write `transform` directly on their elements; nothing per frame goes through React state.
- **Smoothing.** `pointer.ease(speed)` returns `1 - exp(-speed * dt)`, which is frame-rate independent. It returns `1` (snap) on the first frame after entering and always under `prefers-reduced-motion`.
- **Time.** `pointer.dt` is the seconds since the last frame (capped at 0.1, and 0 on the entry frame) for springs, particles and anything time-based. `pointer.reduced` tells a cursor to skip motion of its own: trails collapse, particles stop, bobbing and spinning hold still.
- **Visibility.** The root toggles `data-active`, which fades it in and out over 150ms (`cursorRoot` classes).

A cursor's own look is whatever its frame callback draws: Ring lerps a ring behind an exact dot, Trail chains fourteen followers, Blend scales a difference-blended disc, Label reads `data-cursor-label` into a pill, and Register pairs an exact crosshair with an opening ring. The drawn cursors also export their artwork as `<Name>Art` (or `StampMark`), which the site reuses for the resting drawings. One cursor reaches outside its overlay: Magnet sets the hovered control's inline `translate` and releases it with a Web Animation when the pointer leaves it.

### Known limits

- `position: fixed` resolves against a transformed, filtered or contained ancestor instead of the viewport. The fix, if needed, is to portal the overlay to `<body>` while keeping the area as the parent.
- Two cursors in one element share the same `data-cursor-area` attribute. Unmounting one removes it and switches the other off. This is the first thing the Cursor Mixer has to solve (see below).

## The site

Next.js 16 App Router, React 19, Tailwind CSS v4, Bun. Every route is statically prerendered.

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | The first five cursors (`featured`), the placement demo, the global Register cursor. |
| `/cursors` | `app/(docs)/cursors/page.tsx` | A gallery of live preview tiles in one section per category (`#<category>` anchors, linked from the sidebar): each tile wears its cursor on hover, shows a resting `Scene` otherwise, and opens its page. |
| `/cursors/[name]` | `app/(docs)/cursors/[name]/page.tsx` | `generateStaticParams` from the registry, `dynamicParams = false`. Source files are read from disk at build time. |
| `/hooks/[name]` | `app/(docs)/hooks/[name]/page.tsx` | One page per `registry:hook` item: install, the cursors that use it, a custom-cursor example, API and source. |
| docs layout | `app/(docs)/layout.tsx` | The sidebar beside every `/cursors` and `/hooks` page (from `lg`): cursors grouped by `categories`, then Hooks; `NavLink` marks the current entry with the registration mark. The `(docs)` route group adds no URL segment. |
| `/robots.txt`, `/sitemap.xml` | `app/robots.ts`, `app/sitemap.ts` | Generated from `registry.json`, including its `homepage`. |
| `/r/<name>.json` | `public/r/` | The installable registry files. |

### Data: `app/catalog.tsx`

This module turns `registry.json` into what the pages render:

- **`cursors`:** name, title, description, category, files and a `Cursor` component. The site shows no cursor numbers; only the README's table numbers them, in registry order.
- **`categories`:** the cursors grouped by category, in registry order.
- **`featured`:** the first five.
- **`Scene`** (`app/scenes.tsx`): each cursor drawn at rest, engaged with a small target (`data-resting`). Gallery tiles show it on touch and before a pointer arrives; it fades while the live cursor is active. Scenes are server components, so they can render a cursor's `<Name>Art` but not call functions or read arrays from a `"use client"` module.
- **`Specimen`:** the composition inside each cursor page's preview. Ring, Trail, Blend, Label and Register have their own; every other cursor gets its `Scene`, a line of copy, a button to hover and press, and a link back to the gallery.
- **`cursorTone`:** the site mounts its cursors with `text-white mix-blend-difference`, so they read over paper and over ink-filled hover states in both themes. The exceptions keep their own colors: Label's pill carries words, the colorful and drawn cursors would turn to negatives, and Flashlight's dark would become a glare.

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

- **Shared areas.** Areas need to be reference-counted (or owned by a single provider per element), so several effects can share one element and unmount independently.
- **One loop per area.** A combined cursor should run one `requestAnimationFrame` loop and one pointer state per area and call each effect's frame in order, instead of one hook instance per effect. The current `frame(pointer, element)` contract already lets an effect be expressed as a plain function, which is the unit a mixer composes.
- **Effect parameters.** Speeds, sizes and scales that are constants today become typed parameters with defaults, so a mixer UI can edit them and export the result.

Licensing boundary: the core stays MIT in this repository. The Mixer (its UI, effect presets and any composition runtime beyond what the core needs) ships separately under a commercial license. One possible channel is a token-authenticated shadcn registry, so paying users install with the same `npx shadcn add` flow. Core improvements the Mixer depends on, like shared areas, are made here, in the open, under MIT.
