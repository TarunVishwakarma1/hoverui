# Contributing to hover-ui

Thanks for helping. hover-ui is a small library of cursor components plus the site that presents them, so most contributions are one of three things: a new cursor, a fix to an existing one, or a change to the site.

Before you start anything larger than a typo, [open an issue](https://github.com/TarunVishwakarma1/hoverui/issues/new/choose) using one of the templates (bug report or new cursor). It saves you building something that does not fit.

## Setup

You need [Bun](https://bun.sh) 1.3 or newer and a current Node.js.

```bash
git clone https://github.com/TarunVishwakarma1/hoverui.git
cd hoverui
bun install
bun dev            # http://localhost:3000; also builds the registry into public/r
```

Before you open a pull request, all of these must pass:

```bash
bun run lint
bunx tsc --noEmit
bun run build
```

There is no automated browser test suite yet, so every change to a cursor or to the site also needs the manual checks below.

## What a cursor must be

- **One file**, `components/cursors/<name>.tsx`, marked `"use client"`, built on the `useCursor` hook imported from `@/hooks/use-cursor`.
- **No runtime dependencies** beyond React. Tailwind classes are fine; consumers already use Tailwind v4.
- **An `aria-hidden` root** that uses the shared `cursorRoot` classes and accepts a `className` prop for color.
- **Drawn per frame by writing `transform`** (and `scale`, `opacity` where needed) directly on elements in the `frame` callback. Never put per-frame values in React state.
- **Smoothed with `p.ease(speed)`**, so motion is frame-rate independent and snaps under reduced motion.
- **Honest about the pointer.** If a cursor lags or hides the exact hit point, it needs a precise mark (a dot or crosshair at `p.x`, `p.y`) or a very fast follow.

## Adding a cursor

1. **Write the component** in `components/cursors/<name>.tsx`. Start from the closest existing cursor.
2. **Register it** in `registry.json`: `name`, `type: "registry:component"`, `title`, a one-line `description`, `categories` (reuse an existing one if it fits), and both files with their targets:

   ```json
   {
     "name": "orbit",
     "type": "registry:component",
     "title": "Orbit",
     "categories": ["Followers"],
     "description": "One sentence on what it does and how it reacts to hover and press.",
     "files": [
       { "path": "components/cursors/orbit.tsx", "type": "registry:component", "target": "@components/cursors/orbit.tsx" }
     ],
     "registryDependencies": ["https://hoverui.fun/r/use-cursor.json"]
   }
   ```

   The order of items in `registry.json` sets the cursor numbers, and the first five appear on the home page.
   React to hover through `pointer.hover` and to press through `pointer.down`, and skip motion of its own when `pointer.reduced` is set.
3. **Give it a preview:**
   - add the component to the `components` map in `app/catalog.tsx`;
   - add a `Scene` in `app/scenes.tsx`: the cursor drawn at rest, engaged with a small target. The generic `Specimen` uses it on the cursor's page, so a custom `Specimen` branch is optional;
   - if it carries its own colors, add it to `ownColors` so the site doesn't invert it;
   - add any `data-*` attributes it reads to `attributes`.
4. **Check it by hand** with `bun dev`, on its own page and in the list at `/cursors`:
   - [ ] It follows a mouse, reacts to links and buttons, and reacts to press.
   - [ ] Scrolling with the mouse held still keeps the right cursor showing.
   - [ ] Moving between nested areas hands over cleanly (the placement demo on the home page).
   - [ ] With touch emulation in devtools, nothing renders and the preview copy switches to its touch wording.
   - [ ] With reduced motion on, it snaps instead of easing.
   - [ ] It reads in both the light and dark themes.
   - [ ] It installs into a scratch project: `npx shadcn@latest add http://localhost:3000/r/<name>.json`. The hook comes along from the published registry.
5. **Add a changelog entry** under `[Unreleased]` in `CHANGELOG.md`.

## Changing the shared hook

`hooks/use-cursor.ts` is its own registry item that every cursor depends on, so a change reaches every user's project the next time they install or update it.

- To test a hook change in another project, install your local copy first, `npx shadcn@latest add http://localhost:3000/r/use-cursor.json`, then the cursor. The cursor's dependency points at the published hook, and the CLI keeps the copy you already have.

- Keep its exports and the `frame(pointer, element)` contract backward compatible.
- Check every cursor, not just the one you are working on.
- Call the change out first in the changelog.

## Changing the site

The site follows the system recorded in `DESIGN.md`. In short:

- Colors come from the tokens in `app/globals.css`, and both themes switch by token only. Never add `dark:` utilities or per-theme overrides.
- Prose and controls are set in Host Grotesk, in sentence case. Fragment Mono is only for credits, data and code.
- Corners are square, and there are no shadows.
- There are no eyebrows or kickers above headings.
- Cursor previews are never laid out as a uniform card grid.

Check new pages at 390px and 1440px wide, in both themes, and with touch emulation.

## Pull requests

- Keep each pull request to one change, and say how you tested it (browser, devices, themes).
- Do not add dependencies without discussing them in an issue first.

## Licensing of contributions

hover-ui is released under the [MIT License](LICENSE). By contributing, you agree that your contribution is licensed under MIT as well.

The planned Cursor Mixer is a separate, commercially licensed product that does not live in this repository. Contributions here stay MIT and are never relicensed.
