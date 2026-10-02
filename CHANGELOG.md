# Changelog

All notable changes to hover-ui are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes to the installable cursors and the `useCursor` hook are listed first in each release, because they reach every project that installs them.

## [Unreleased]

### Added

- A gallery at `/cursors`: one live preview tile per cursor. Each tile shows its cursor drawn at rest, wears it when you hover, and opens its page on click.
- A sidebar index beside every `/cursors` and `/hooks` page from `lg` up: cursors grouped by kind, then Hooks, with the current page marked by the registration mark.
- A `useCursor` page at `/hooks/use-cursor`: install it on its own, see the cursors that use it, copy a custom-cursor example, and read its API and source.
- Categories in `registry.json` (`Followers`, `Inverting`, `Labels`, `Marks`), using the shadcn registry's own `categories` field.
- A dark theme, the "Black-stock edition", with a toggle in the sticky bar. It follows the OS setting by default, remembers the visitor's choice, applies it before first paint, and crossfades on switch.
- Search engine and sharing support: `robots.txt`, `sitemap.xml`, canonical URLs, Open Graph and Twitter cards with a share image, and JSON-LD (`WebSite`, `CollectionPage` with an `ItemList`, `SoftwareSourceCode`, `BreadcrumbList`).
- A registration-mark favicon and app icon, replacing the Next.js default.
- Project docs: README, ARCHITECTURE, CONTRIBUTING, this changelog, issue templates and the MIT `LICENSE` file.

### Changed

- `useCursor` is its own registry item (`registry:hook`). Cursors declare it in `registryDependencies`, so the shadcn CLI installs it once into your hooks folder (`@/hooks/use-cursor.ts`), rewrites the cursors' imports to your alias, and skips it when it is already there. Each cursor now ships a single file.
- The sticky bar now links to sections ("Cursors", "Placement") instead of listing every cursor, so it holds at any number of them.
- Cursor pages live at `/cursors/<name>`. They put the title on top with the install command beside it, show the live preview at full width and add a credits row (number, kind, files, dependencies, license). The sticky bar's Install jumps to the current cursor's command.
- The home page shows the first five cursors and links to the full list.
- Page titles and descriptions name the cursor and "React" for search.

## [0.1.0] - 2026-10-02

### Added

- Five cursors: Ring, Trail, Blend, Label and Register.
- The shared `use-cursor.ts` hook:
  - **Placement API:** a cursor owns its parent element, a cursor in `<body>` owns the page, and nested cursors hand over to the innermost.
  - **Scrolling:** cursors follow scrolling under a still pointer.
  - **Touch and accessibility:** gated to fine, hovering pointers; snaps instead of easing under reduced motion.
  - **Performance:** frame-rate independent smoothing and no work while the pointer is outside the cursor's element.
- Distribution as a shadcn registry: `registry.json`, built into `public/r` and installed with `npx shadcn@latest add https://hoverui.fun/r/<name>.json`.
- The hoverui.fun website:
  - **Home:** live previews, the placement demo and a global Register cursor that hands off to each preview.
  - **Cursor pages:** live preview, install, usage, props and source.
  - **Design system:** a printed design-annual look, recorded in DESIGN.md.
