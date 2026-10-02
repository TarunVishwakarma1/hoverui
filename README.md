# hover-ui

Copy-paste cursor components for React, installed with the shadcn CLI.

Drop a cursor inside any element and it owns that element's cursor. Drop one in `<body>` and it owns the page. Nest them and the innermost one wins.

**Browse and try every cursor live at [hoverui.fun](https://hoverui.fun).** Source: [github.com/TarunVishwakarma1/hoverui](https://github.com/TarunVishwakarma1/hoverui).

- **Cursors only.** A component category with one shared, dependency-free core, not a one-off effect.
- **You own the source.** Each cursor is one readable file, plus one shared hook the CLI installs once. Both are copied into your project; there is no package to upgrade.
- **Placement is the API.** No providers and no config: where you put the component decides where it applies.
- **Never costs anyone their pointer.** Cursors keep the exact hit position, stay off on touch screens and respect reduced motion.

## Quick start

You need React 19, Tailwind CSS v4 and a project set up for the shadcn CLI (`npx shadcn@latest init`).

```bash
npx shadcn@latest add https://hoverui.fun/r/ring.json
```

That adds `components/cursors/ring.tsx`. The first time, the CLI also installs the `useCursor` hook every cursor runs on into your hooks folder (`@/hooks/use-cursor.ts`), and skips it after that. Then put the cursor inside the element that should wear it:

```tsx
import { RingCursor } from "@/components/cursors/ring";

export function Hero() {
  return (
    <section>
      <RingCursor />
      {/* this section now wears Ring */}
    </section>
  );
}
```

To wear it on every page, put it in `<body>` in your root layout:

```tsx
<body>
  {children}
  <RingCursor />
</body>
```

### Shorter installs with a namespace

Add the registry to your `components.json` once:

```json
{
  "registries": {
    "@hover-ui": "https://hoverui.fun/r/{name}.json"
  }
}
```

Then install by name:

```bash
npx shadcn@latest add @hover-ui/trail
```

## Cursors

| No. | Name | Kind | What it does | Install |
| --- | --- | --- | --- | --- |
| 01 | Ring | Followers | Exact dot, lagging ring. Swells on links, squeezes on click. | `npx shadcn@latest add https://hoverui.fun/r/ring.json` |
| 02 | Trail | Followers | A tapering chain of dots, each chasing the one ahead. | `npx shadcn@latest add https://hoverui.fun/r/trail.json` |
| 03 | Blend | Inverting | Inverts whatever is beneath it. Grows over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/blend.json` |
| 04 | Label | Labels | Morphs into a pill reading the hovered element's `data-cursor-label`. | `npx shadcn@latest add https://hoverui.fun/r/label.json` |
| 05 | Register | Marks | A printer's registration mark. Exact crosshair; the ring opens and fills over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/register.json` |

Each cursor's page at `hoverui.fun/cursors/<name>` has the live preview, install command, usage, props and full source.

## Build your own: the useCursor hook

Every cursor is a small component on top of one hook. Install it on its own to write your own cursor:

```bash
npx shadcn@latest add https://hoverui.fun/r/use-cursor.json
```

```tsx
"use client";

import { cursorRoot, useCursor } from "@/hooks/use-cursor";

export function DotCursor() {
  const ref = useCursor((p, el) => {
    (el.firstElementChild as HTMLElement).style.transform = `translate(${p.x}px, ${p.y}px)`;
  });
  return (
    <div ref={ref} aria-hidden className={cursorRoot}>
      <div className="absolute size-3 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
```

The cursor's parent element becomes its area, and your function runs every frame while a mouse is inside. The full API (`pointer.x`, `pointer.y`, `pointer.down`, `pointer.target`, `pointer.ease(speed)`, `cursorRoot`, `INTERACTIVE`) is on the [useCursor page](https://hoverui.fun/hooks/use-cursor).

## How placement works

| Where you put it | What happens |
| --- | --- |
| In `<body>` | The whole page wears it. |
| In an element | Only that element does. Leave it and the outer cursor takes back over. |
| Nested | The innermost cursor wins. |
| Touch screens | Nothing renders; the native pointer stays. |
| Reduced motion | Cursors snap into place instead of trailing. |

A cursor attaches to its parent element, so the component must be a direct child of the element it should own.

## Props

| Prop or attribute | Applies to | Description |
| --- | --- | --- |
| `className` | every cursor | Colors the cursor through `currentColor`, e.g. `text-pink-500`. To read on any background, pass `text-white mix-blend-difference` (not on Label: its pill carries words, and an inverted pill lets the text beneath show through). |
| `data-cursor-label` | any element, read by Label | The words Label's pill shows while the pointer is over that element. |

Cursors react to hover targets: `a`, `button`, `input`, `select`, `textarea`, `label`, `[role=button]` and `[data-cursor-label]`.

### Known limits

- Cursors are drawn with `position: fixed`. Inside an ancestor that has a `transform`, `filter` or `contain` set, they are positioned against that ancestor instead of the viewport.
- Two cursors placed in the same element render together, but unmounting one switches the other off. Use one cursor per element for now; combining effects is what the planned Cursor Mixer is for.

## Accessibility

- Cursors are `aria-hidden` and `pointer-events: none`; they never intercept a click or reach assistive technology.
- They only switch on for a fine, hovering pointer (`(hover: hover) and (pointer: fine)`). Touch screens keep the native pointer.
- Under `prefers-reduced-motion`, cursors snap to the pointer instead of easing.
- Ring, Trail and Register always mark the exact pointer position. Blend and Label ease toward it over a few frames.

## Development

This repository holds two things: the cursor components (the registry) and the hoverui.fun website that presents them.

```bash
git clone https://github.com/TarunVishwakarma1/hoverui.git
cd hoverui
bun install
bun dev            # builds the registry, then starts the site at http://localhost:3000
bun run build      # builds the registry into public/r, then the site
bun run lint
bunx tsc --noEmit
```

`bun dev` and `bun run build` run `shadcn build`, which writes the installable `public/r/*.json` files from `registry.json`. Those files are generated and not committed.

To try a cursor you are working on in another project, run the site and install it from your machine:

```bash
npx shadcn@latest add http://localhost:3000/r/trail.json
```

Cursors depend on the published hook (`https://hoverui.fun/r/use-cursor.json`). If you changed the hook, install your local copy first with `npx shadcn@latest add http://localhost:3000/r/use-cursor.json`; the cursor install then keeps it.

| Path | What lives there |
| --- | --- |
| `components/cursors/` | The cursors. This is what users install. |
| `hooks/` | The `useCursor` hook: its own registry item, installed with every cursor. |
| `registry.json` | The registry: every cursor, its files, install targets and category. |
| `app/` | The website (Next.js App Router). |
| `PRODUCT.md`, `DESIGN.md` | Product truth and the site's design system. |

[ARCHITECTURE.md](ARCHITECTURE.md) explains how the pieces fit together.

## Roadmap

- **More cursors.** The site is built for 20 to 30 of them: a gallery of live previews at `/cursors`, with a sidebar index grouped by kind beside every `/cursors` page.
- **Cursor Mixer (planned, paid).** Mix and match the effects of different cursors into one. It will ship separately from this repository under a commercial license. The cursors in this repository stay free and MIT licensed.

## Contributing

Ideas for new cursors, bug reports and pull requests are welcome: [open an issue](https://github.com/TarunVishwakarma1/hoverui/issues/new/choose). Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request; [CHANGELOG.md](CHANGELOG.md) records what changed in each release.

## License

Everything in this repository (the cursor components, the shared hook, the registry and the website) is released under the [MIT License](LICENSE).

The planned Cursor Mixer and any other paid features will be distributed separately under their own commercial license. They are not part of this repository, and they will never change the license of the code here.
