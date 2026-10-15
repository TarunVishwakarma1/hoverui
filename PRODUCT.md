# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Design engineers: frontend developers building marketing sites, portfolios and landing pages in React + Tailwind who want a signature cursor without hand-rolling pointer tracking, smoothing, touch fallbacks and reduced-motion handling. They browse to pick a cursor, feel it live, then copy one install command.

## Product Purpose

hover-ui is a free, open-source (MIT) library of custom cursor components for React, distributed as a shadcn registry. Success: a visitor finds a cursor they like, tries it with their own pointer on the site, and has it running in their project with one `npx shadcn add` command, owning the source.

A paid **Cursor Mixer** is planned: paying users mix and match the effects of different cursors and tune them. It ships separately from the open core and is not built yet.

## Positioning

Cursors only, and scoped by placement: drop a cursor inside any element and it owns that element's cursor; drop it in `<body>` and it owns the page; nested cursors hand off to the innermost. Shared libraries (shadcn/ui, Hero UI, Aceternity) treat cursors as a one-off effect at best; hover-ui makes them a component category with one shared, dependency-free core.

## Operating Context

- Visitors arrive on desktop with a mouse or trackpad; the product is only felt with a fine pointer. Touch visitors must still be able to browse, read source and copy install commands.
- Install path: `npx shadcn@latest add https://hoverui.fun/r/<name>.json`. The cursor lands in the user's `components/cursors/`; its registry dependency, the `useCursor` hook, lands once in their hooks folder (`@/hooks/use-cursor.ts`). The hook also installs on its own (`/r/use-cursor.json`) for writing custom cursors.
- Site routes: `/` (featured cursors), `/cursors` (a gallery of live preview tiles with a filter by name, mood or thing), `/categories/<kind>` (one kind of cursor, its own landing page), `/cursors/<name>` (one cursor: preview, install, usage, props, source), `/hooks/<name>` (one hook: install, API, source). A search in the sticky bar on every page finds any cursor or hook by name, mood or thing and previews the highlighted cursor live. The site says "cursors" everywhere: it is the word visitors use and search for.
- Registry source of truth: `registry.json`; `shadcn build` emits `public/r/*.json` on `dev`/`build`.

## Capabilities and Constraints

- Cursors shipped (84, `components/cursors/`), grouped in `registry.json` by `categories`: Followers (Ring, Trail, Magnet); Lenses (Blend, Glass, Focus, Goggles, Magnifier, Droplet, Liquid); Labels (Label, Tooltip, Peek, Element); Marks (Register, Frame, Stamp, Caret, Halftone); Colorful (Offset, Ribbon, Confetti, Glow, Neon, Sparkle, Splat, Fireworks, Lantern, Fluid); Space (Comet, Orbit, Rocket, Astronaut, UFO, Constellation, Black hole, Galaxy); Halloween (Ghost, Spider, Flashlight, Bat, Pumpkin, Candle); Mechanical (Gear, Readout, Compass, Clock, Radar); Weird (Googly, Jelly, Doodle, Fly, Mercury, Smoke); Retro (Classic, Chomp, Matrix, Snake, Pixel, Coin); Weather (Cloud, Zap, Snow, Sun, Tornado); Toys (Balloon, Yo-yo, Dice, Plane, Top, Laser); Ocean (Bubbles, Fish, Jellyfish, Ripple, Galley); Fantasy (Rune, Wand, Dragon); Sci-fi (Saber); Nature (Fireflies, Leaves, Gecko, Sand). Ideas for the next ones wait in `IDEAS.md`. Every cursor depends on the `useCursor` hook (registry item `use-cursor`, `hooks/use-cursor.ts`).
- The site is built to hold dozens of cursors: section navigation in the sticky bar, a searchable gallery at `/cursors`, and a sidebar index grouped by kind beside every `/cursors` page.
- Several cursors can share one element (one pointer, one loop), the groundwork the Mixer builds on. Ring, Trail, Blend and Label take tuning props (`size`, `speed`, `swell`, `length`); the rest still have fixed values.
- Zero runtime dependencies beyond React 19; requires Tailwind v4 classes in the consumer project.
- Cursors render nothing interactive (`aria-hidden`, `pointer-events-none`), activate only on `(hover: hover) and (pointer: fine)`, snap instead of easing under `prefers-reduced-motion`.
- Known ceiling: cursors use `position: fixed`, so a transformed/filtered ancestor breaks positioning.
- Stack: Next.js 16 (App Router), React 19.2, Tailwind v4, Bun.
- Repository: https://github.com/TarunVishwakarma1/hoverui (linked from the sticky bar from `sm`, the docs, and each cursor page's structured data).
- Cursor Mixer, decided: a hosted mixer page on hoverui.fun for subscribers, exporting mixes they install from a token-authenticated shadcn registry; billed monthly through Stripe. Open: the price and the launch date. Do not show the Mixer, prices or a waitlist on the site until it ships.

## Brand Commitments

- Name: hover-ui. Domain: hoverui.fun.
- License: everything in this repository (cursors, hook, registry, site) is MIT, recorded in `LICENSE`. Contributions are MIT too.
- Paid tier: the Cursor Mixer, planned, under a separate commercial license, distributed outside this repository. It never changes the license of the open core.

## Evidence on Hand

60 working cursor components and the live demos the site itself provides. No testimonials, user counts, GitHub stars, download numbers or company logos exist; never fabricate them.

## Product Principles

1. Feel before read: every cursor is tried live, with the visitor's own pointer, before any prose.
2. Own the source: copy-paste via shadcn, readable files, no package to upgrade.
3. Placement is the API: where you put the component decides where it applies.
4. Never cost the user their pointer: precise hit position, touch fallback, reduced motion respected.

## Accessibility & Inclusion

Custom cursors must never hide where the real pointer is, must stay off on touch/coarse pointers, and must respect `prefers-reduced-motion`. The site must remain fully usable (navigation, copy buttons, source) with the native cursor and keyboard alone.
