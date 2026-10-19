# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Design engineers: frontend developers building marketing sites, portfolios and landing pages in React + Tailwind who want a signature cursor without hand-rolling pointer tracking, smoothing, touch fallbacks and reduced-motion handling. They browse to pick a cursor, feel it live, then copy one install command.

Cursor Mixer subscribers: those same React + Tailwind developers; no-code site builders on Framer and Webflow, who need a mix as a script embed rather than React code; and agencies and teams reusing mixes across client sites.

## Product Purpose

hover-ui is a free, open-source (MIT) library of custom cursor components for React, distributed as a shadcn registry. Success: a visitor finds a cursor they like, tries it with their own pointer on the site, and has it running in their project with one `npx shadcn add` command, owning the source.

A paid **Cursor Mixer**, live at https://mixer.hoverui.fun since October 2026: people build a cursor of their own on a canvas or in code, decide how it behaves on each mouse action (moving, hovering a control, pressing, releasing, clicking, dragging, resting), and take it to their site. It ships separately from the open core, from the private `hover-ui-mixer` repository. This site sends people there as the way on from the library: "Build your own in the Mixer".

## Positioning

Cursors only, and scoped by placement: drop a cursor inside any element and it owns that element's cursor; drop it in `<body>` and it owns the page; nested cursors hand off to the innermost. Shared libraries (shadcn/ui, Hero UI, Aceternity) treat cursors as a one-off effect at best; hover-ui makes them a component category with one shared, dependency-free core.

## Operating Context

- Visitors arrive on desktop with a mouse or trackpad; the product is only felt with a fine pointer. Touch visitors must still be able to browse, read source and copy install commands.
- Install path: `npx shadcn@latest add https://hoverui.fun/r/<name>.json`. The cursor lands in the user's `components/cursors/`; its registry dependency, the `useCursor` hook, lands once in their hooks folder (`@/hooks/use-cursor.ts`). The hook also installs on its own (`/r/use-cursor.json`) for writing custom cursors.
- Site routes: `/` (featured cursors), `/cursors` (a gallery of live preview tiles with a filter by name, mood or thing), `/categories/<kind>` (one kind of cursor, its own landing page), `/cursors/<name>` (one cursor: preview, install, usage, props, source), `/hooks/<name>` (one hook: install, API, source). A search in the sticky bar on every page finds any cursor or hook by name, mood or thing and previews the highlighted cursor live. The site says "cursors" everywhere: it is the word visitors use and search for.
- Registry source of truth: `registry.json`; `shadcn build` emits `public/r/*.json` on `dev`/`build`.
- `/llms.txt` lists the whole library as Markdown for language models and AI search; every cursor and category page has its own share card.
- hoverui.fun is deployed on Vercel.

## Capabilities and Constraints

- Cursors shipped (90, `components/cursors/`), grouped in `registry.json` by `categories`: Followers (Ring, Trail, Magnet, Rimlight); Lenses (Blend, Glass, Focus, Goggles, Magnifier, Droplet, Liquid, Glitch); Labels (Label, Tooltip, Peek, Element, Cipher, Thread); Marks (Register, Frame, Stamp, Caret, Halftone, Pen); Colorful (Offset, Ribbon, Confetti, Glow, Neon, Sparkle, Splat, Fireworks, Lantern, Fluid); Space (Comet, Orbit, Rocket, Astronaut, UFO, Constellation, Black hole, Galaxy); Halloween (Ghost, Spider, Flashlight, Bat, Pumpkin, Candle); Mechanical (Gear, Readout, Compass, Clock, Radar); Weird (Googly, Jelly, Doodle, Fly, Mercury, Smoke); Retro (Classic, Chomp, Matrix, Snake, Pixel, Coin); Weather (Cloud, Zap, Snow, Sun, Tornado); Toys (Balloon, Yo-yo, Dice, Plane, Top, Laser); Ocean (Bubbles, Fish, Jellyfish, Ripple, Galley); Fantasy (Rune, Wand, Dragon); Sci-fi (Saber, Plasma); Nature (Fireflies, Leaves, Gecko, Sand). Ideas for the next ones wait in `IDEAS.md`. Every cursor depends on the `useCursor` hook (registry item `use-cursor`, `hooks/use-cursor.ts`).
- The site is built to hold dozens of cursors: section navigation in the sticky bar, a searchable gallery at `/cursors`, and a sidebar index grouped by kind beside every `/cursors` page.
- Several cursors can share one element (one pointer, one loop), the groundwork the Mixer builds on. Ring, Trail, Blend and Label take tuning props (`size`, `speed`, `swell`, `length`), and so does every cursor added since (Rimlight, Glitch, Cipher, Thread, Pen, Plasma); the rest still have fixed values.
- Zero runtime dependencies beyond React 19; requires Tailwind v4 classes in the consumer project.
- Cursors render nothing interactive (`aria-hidden`, `pointer-events-none`), activate only on `(hover: hover) and (pointer: fine)`, snap instead of easing under `prefers-reduced-motion`.
- Known ceiling: cursors use `position: fixed`, so a transformed/filtered ancestor breaks positioning.
- Some cursors lean on browser features with fallbacks: the lenses that bend the page (Black hole, Magnifier, Droplet, Liquid, Glitch) need Chromium's SVG `backdrop-filter` and show without the bending elsewhere; Fluid needs WebGL2 and shows only its dot without it.
- Stack: Next.js 16 (App Router), React 19.2, Tailwind v4, Bun.
- Repository: https://github.com/TarunVishwakarma1/hoverui (linked from the sticky bar from `sm`, the docs, and each cursor page's structured data).
- Cursor Mixer, live: `https://mixer.hoverui.fun`, its own private repository (`hover-ui-mixer`) and Vercel project, with Supabase accounts. React users install a mix with one shadcn command, which brings the `hoverui-mixer` npm package that runs it; a Pro cursor carries a signed license naming the subscriber's sites and keeps working for good. No-code builders take a script embed. Billed monthly through Razorpay in rupees: Individual ₹200, Pro ₹500, Premium ₹1,500 (Pro's and Premium's seats and workspaces aren't built yet). Free exports small mixes (up to 3 layers of dot, ring and shape; hover and pressed states; press and release with a pop); every paid plan unlocks everything else, the code window and the embed; anyone can try Pro parts in the preview. This site links to it from the bar's "Mixer" token, the home page's "Build your own in the Mixer" section, the all-cursors intro, each cursor page's "More" row and the footer, and to its gallery from that home page section and the all-cursors intro. Open: how teams share mixes.

## Brand Commitments

- Name: hover-ui. Domain: hoverui.fun.
- License: everything in this repository (cursors, hook, registry, site) is MIT, recorded in `LICENSE`. Contributions are MIT too.
- Paid tier: the Cursor Mixer, under a separate commercial license, distributed outside this repository. It never changes the license of the open core.
- Cursor names stay generic: no trademarked film, game or franchise names. The reference lives in the behaviour, never in the name.

## Evidence on Hand

90 working cursor components and the live demos the site itself provides. A YouTube Short and a longer demo video of the library are published (October 2026; links not recorded yet). The GitHub repository has no stars, forks or outside contributors yet (checked 2026-10-17). No testimonials, user counts, download numbers or company logos exist; never fabricate them.

## Product Principles

1. Feel before read: every cursor is tried live, with the visitor's own pointer, before any prose.
2. Own the source: copy-paste via shadcn, readable files, no package to upgrade.
3. Placement is the API: where you put the component decides where it applies.
4. Never cost the user their pointer: precise hit position, touch fallback, reduced motion respected.
5. Small over showy: a cursor accompanies the page and never takes it over. A big cursor is a no for a real website, however good it looks.

## Accessibility & Inclusion

Custom cursors must never hide where the real pointer is, must stay off on touch/coarse pointers, and must respect `prefers-reduced-motion`. The site must remain fully usable (navigation, copy buttons, source) with the native cursor and keyboard alone.
