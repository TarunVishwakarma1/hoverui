# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Design engineers: frontend developers building marketing sites, portfolios and landing pages in React + Tailwind who want a signature cursor without hand-rolling pointer tracking, smoothing, touch fallbacks and reduced-motion handling. They browse to pick a cursor, feel it live, then copy one install command.

## Product Purpose

hover-ui is a free, open-source (MIT) library of custom cursor components for React, distributed as a shadcn registry. Success: a visitor finds a cursor they like, tries it with their own pointer on the site, and has it running in their project with one `npx shadcn add` command, owning the source.

## Positioning

Cursors only, and scoped by placement: drop a cursor inside any element and it owns that element's cursor; drop it in `<body>` and it owns the page; nested cursors hand off to the innermost. Shared libraries (shadcn/ui, Hero UI, Aceternity) treat cursors as a one-off effect at best; hover-ui makes them a component category with one shared, dependency-free core.

## Operating Context

- Visitors arrive on desktop with a mouse or trackpad; the product is only felt with a fine pointer. Touch visitors must still be able to browse, read source and copy install commands.
- Install path: `npx shadcn@latest add https://hoverui.fun/r/<name>.json`. Files land in the user's `components/cursors/` (component + shared `use-cursor.ts`).
- Registry source of truth: `registry.json`; `shadcn build` emits `public/r/*.json` on `dev`/`build`.

## Capabilities and Constraints

- Cursors shipped: Ring, Trail, Blend, Label (`components/cursors/`). Every cursor uses the shared `use-cursor.ts` hook.
- Zero runtime dependencies beyond React 19; requires Tailwind v4 classes in the consumer project.
- Cursors render nothing interactive (`aria-hidden`, `pointer-events-none`), activate only on `(hover: hover) and (pointer: fine)`, snap instead of easing under `prefers-reduced-motion`.
- Known ceiling: cursors use `position: fixed`, so a transformed/filtered ancestor breaks positioning.
- Stack: Next.js 16 (App Router), React 19.2, Tailwind v4, Bun.
- Open: GitHub repository URL not yet given; do not link one until it exists.

## Brand Commitments

- Name: hover-ui. Domain: hoverui.fun.
- License: MIT, free. No paid tier.

## Evidence on Hand

Four working cursor components and the live demos the site itself provides. No testimonials, user counts, GitHub stars, download numbers or company logos exist; never fabricate them.

## Product Principles

1. Feel before read: every cursor is tried live, with the visitor's own pointer, before any prose.
2. Own the source: copy-paste via shadcn, readable files, no package to upgrade.
3. Placement is the API: where you put the component decides where it applies.
4. Never cost the user their pointer: precise hit position, touch fallback, reduced motion respected.

## Accessibility & Inclusion

Custom cursors must never hide where the real pointer is, must stay off on touch/coarse pointers, and must respect `prefers-reduced-motion`. The site must remain fully usable (navigation, copy buttons, source) with the native cursor and keyboard alone.
