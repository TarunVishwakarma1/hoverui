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
| 02 | Trail | Followers | A tapering chain of dots, each chasing the one ahead. The head swells over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/trail.json` |
| 03 | Blend | Lenses | Inverts whatever is beneath it. Grows over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/blend.json` |
| 04 | Label | Labels | Morphs into a pill reading the hovered element's `data-cursor-label`. | `npx shadcn@latest add https://hoverui.fun/r/label.json` |
| 05 | Register | Marks | A printer's registration mark. Exact crosshair; the ring opens and fills over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/register.json` |
| 06 | Offset | Colorful | Cyan, magenta and yellow rings that slip out of register as you move. Over a control they grow and misregister. | `npx shadcn@latest add https://hoverui.fun/r/offset.json` |
| 07 | Ribbon | Colorful | A rainbow ribbon drawn by your path. It fattens and cycles faster over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/ribbon.json` |
| 08 | Confetti | Colorful | Sheds confetti as you move, pops a little over each control, and throws a handful on click. | `npx shadcn@latest add https://hoverui.fun/r/confetti.json` |
| 09 | Comet | Space | A bright head whose tail stretches out as you speed up. It swells inside a faint coma over controls. | `npx shadcn@latest add https://hoverui.fun/r/comet.json` |
| 10 | Orbit | Space | A moon circling the pointer. Its orbit widens over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/orbit.json` |
| 11 | Rocket | Space | The nose is the pointer. It turns to face where you go; the engine roars over controls and cuts on press. | `npx shadcn@latest add https://hoverui.fun/r/rocket.json` |
| 12 | Astronaut | Space | Drifts behind the pointer on a slack tether, bobbing in zero gravity. Reels itself in over controls. | `npx shadcn@latest add https://hoverui.fun/r/astronaut.json` |
| 13 | Ghost | Halloween | Haunts the pointer: floats a little behind, bobs and leans. Swoops in and swells over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/ghost.json` |
| 14 | Spider | Halloween | Drops on a thread from the top of its area and sways as you move. Swells and scuttles over controls. | `npx shadcn@latest add https://hoverui.fun/r/spider.json` |
| 15 | Flashlight | Halloween | Darkens its area except for a pool of light at the pointer, wider over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/flashlight.json` |
| 16 | Gear | Mechanical | A gear that rolls as you travel. Over anything clickable, a second gear meshes in. | `npx shadcn@latest add https://hoverui.fun/r/gear.json` |
| 17 | Readout | Mechanical | A drafting crosshair with live coordinates. Over a control, it reads the tag and size. | `npx shadcn@latest add https://hoverui.fun/r/readout.json` |
| 18 | Googly | Weird | A pair of googly eyes trailing the pointer, pupils sloshing. They go wide over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/googly.json` |
| 19 | Jelly | Weird | A soft blob that stretches along your motion and wobbles back. Swells over controls, squashes on press. | `npx shadcn@latest add https://hoverui.fun/r/jelly.json` |
| 20 | Frame | Marks | Viewfinder corners around the pointer that snap to frame whatever clickable thing you hover. | `npx shadcn@latest add https://hoverui.fun/r/frame.json` |
| 21 | Magnet | Followers | A dot with a pull: over anything clickable, the control leans toward the pointer and the dot settles between them. | `npx shadcn@latest add https://hoverui.fun/r/magnet.json` |
| 22 | Glass | Lenses | A lens of frosted glass that blurs whatever it passes over. Widens over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/glass.json` |
| 23 | Glow | Colorful | A wide, soft glow drifting after the pointer through shifting color. Gathers tight over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/glow.json` |
| 24 | Neon | Colorful | A humming neon tube that stutters now and then. Swells and switches color over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/neon.json` |
| 25 | Sparkle | Colorful | Stars twinkle out along your path, keep coming over controls, and burst in a ring on click. | `npx shadcn@latest add https://hoverui.fun/r/sparkle.json` |
| 26 | Splat | Colorful | A loaded brush: every click leaves a fading splat of paint, each a new color. | `npx shadcn@latest add https://hoverui.fun/r/splat.json` |
| 27 | UFO | Space | A saucer hovering above the pointer. Over anything clickable, it lowers a tractor beam onto it. | `npx shadcn@latest add https://hoverui.fun/r/ufo.json` |
| 28 | Constellation | Space | Draws a constellation as you move, star by star, fading out behind you. A click sets a bright one. | `npx shadcn@latest add https://hoverui.fun/r/constellation.json` |
| 29 | Bat | Halloween | Flits about beside the pointer. Over anything clickable, it folds its wings and hangs upside down. | `npx shadcn@latest add https://hoverui.fun/r/bat.json` |
| 30 | Pumpkin | Halloween | A jack-o'-lantern at the pointer's side. It creeps closer and its face lights up over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/pumpkin.json` |
| 31 | Candle | Halloween | The pointer is a flame: it leans away from your motion, flares over controls and gutters on press. | `npx shadcn@latest add https://hoverui.fun/r/candle.json` |
| 32 | Compass | Mechanical | The needle swings to your heading, overshoots, and settles north. It spins over anything clickable. | `npx shadcn@latest add https://hoverui.fun/r/compass.json` |
| 33 | Clock | Mechanical | Keeps your visitor's real time. The hands race forward over controls and wind back on press. | `npx shadcn@latest add https://hoverui.fun/r/clock.json` |
| 34 | Radar | Mechanical | A scope sweeping round the pointer. Over a control, it sweeps faster and pings a contact on it. | `npx shadcn@latest add https://hoverui.fun/r/radar.json` |
| 35 | Doodle | Weird | A hand-drawn loop whose line boils. Over anything clickable, it scribbles a circle around it. | `npx shadcn@latest add https://hoverui.fun/r/doodle.json` |
| 36 | Fly | Weird | Buzzes around the pointer, lands on anything clickable, and gets shooed off by a click. | `npx shadcn@latest add https://hoverui.fun/r/fly.json` |
| 37 | Classic | Retro | The 1-bit desktop arrow, pixel for pixel: a pointing hand over controls, the hourglass while you press. | `npx shadcn@latest add https://hoverui.fun/r/classic.json` |
| 38 | Chomp | Retro | An arcade chomper that faces your way and eats as it goes. Gobbles controls; snaps shut on press. | `npx shadcn@latest add https://hoverui.fun/r/chomp.json` |
| 39 | Matrix | Retro | Green code rains off your path, pours over anything clickable, and bursts on click. | `npx shadcn@latest add https://hoverui.fun/r/matrix.json` |
| 40 | Cloud | Weather | A little cloud over the pointer. It drizzles over controls and pours while you press. | `npx shadcn@latest add https://hoverui.fun/r/cloud.json` |
| 41 | Zap | Weather | An electric spark that crackles over controls. A click calls down lightning from the top of its area. | `npx shadcn@latest add https://hoverui.fun/r/zap.json` |
| 42 | Snow | Weather | Snowflakes drift off your path. A flurry gathers over controls; a click blows out a gust. | `npx shadcn@latest add https://hoverui.fun/r/snow.json` |
| 43 | Balloon | Toys | A balloon on a string, tugging up and swaying as you move. Puffs up over controls; a click pops it. | `npx shadcn@latest add https://hoverui.fun/r/balloon.json` |
| 44 | Yo-yo | Toys | Swings on its string below the pointer. Press to throw it down to sleep; let go to reel it back. | `npx shadcn@latest add https://hoverui.fun/r/yoyo.json` |
| 45 | Bubbles | Ocean | Bubbles rise off your path and pop. They stream out over controls; a click pops them all. | `npx shadcn@latest add https://hoverui.fun/r/bubbles.json` |
| 46 | Fish | Ocean | A goldfish that follows and waits just short of the pointer. It nibbles controls and darts off on click. | `npx shadcn@latest add https://hoverui.fun/r/fish.json` |
| 47 | Jellyfish | Ocean | Drifts after the pointer in pulses, tentacles trailing. Glows over controls, clenches on press. | `npx shadcn@latest add https://hoverui.fun/r/jellyfish.json` |
| 48 | Ripple | Ocean | A faint wake as you move, rings spreading from every click, and a ring breathing over controls. | `npx shadcn@latest add https://hoverui.fun/r/ripple.json` |
| 49 | Stamp | Marks | A rubber stamp that lifts over controls and leaves a fading inked seal on every click. | `npx shadcn@latest add https://hoverui.fun/r/stamp.json` |
| 50 | Caret | Marks | A text caret sized to the line beneath it that blinks when you stop. A block caret over controls. | `npx shadcn@latest add https://hoverui.fun/r/caret.json` |
| 51 | Tooltip | Labels | A tooltip that rises over anything clickable, reading its label or text. No markup needed. | `npx shadcn@latest add https://hoverui.fun/r/tooltip.json` |
| 52 | Peek | Labels | Shows where a link goes before you click it: the path for links on your site, the host for others. | `npx shadcn@latest add https://hoverui.fun/r/peek.json` |
| 53 | Focus | Lenses | Blurs its area except a sharp circle at the pointer, like a shallow depth of field. Opens up over controls. | `npx shadcn@latest add https://hoverui.fun/r/focus.json` |
| 54 | Goggles | Lenses | Night-vision goggles that turn whatever they pass over green. They gain up over controls; a click flashes them. | `npx shadcn@latest add https://hoverui.fun/r/goggles.json` |
| 55 | Dice | Toys | A die that tumbles as you move, lands on six over anything clickable, and rolls while you press. | `npx shadcn@latest add https://hoverui.fun/r/dice.json` |
| 56 | Plane | Toys | A paper plane that glides after the pointer and banks into its turns. It circles controls; a click throws it. | `npx shadcn@latest add https://hoverui.fun/r/plane.json` |
| 57 | Snake | Retro | The phone-game snake, chasing the pointer square by square. It grows over controls and speeds up on press. | `npx shadcn@latest add https://hoverui.fun/r/snake.json` |
| 58 | Pixel | Retro | A pixel cursor on an 8px grid with a stepped, fading trail. Over controls it draws a blinking selection. | `npx shadcn@latest add https://hoverui.fun/r/pixel.json` |
| 59 | Sun | Weather | A sun whose rays turn slowly. They stretch and spin over anything clickable; a press brings an eclipse. | `npx shadcn@latest add https://hoverui.fun/r/sun.json` |
| 60 | Tornado | Weather | A twister whose funnel sways and leans behind your motion. It towers over controls and whips round on press. | `npx shadcn@latest add https://hoverui.fun/r/tornado.json` |
| 61 | Black hole | Space | Bends the page round it like a lens and swallows dust from your path. Swells over controls; hold, and time slows. | `npx shadcn@latest add https://hoverui.fun/r/black-hole.json` |
| 62 | Top | Toys | A spinning top that wobbles and teeters when you stop, but never falls. Controls sink into dream levels; a click kicks it. | `npx shadcn@latest add https://hoverui.fun/r/top.json` |
| 63 | Rune | Fantasy | A gold ring whose runes kindle over controls and stir when you idle. Hold to put it on: you vanish and the page greys. | `npx shadcn@latest add https://hoverui.fun/r/rune.json` |
| 64 | Galley | Ocean | A Greek galley with a wake. Monsters surface round it, the Gorgon turns it to stone, sirens sing from controls. | `npx shadcn@latest add https://hoverui.fun/r/galley.json` |
| 65 | Element | Labels | Ho, for hover. Spells a control's name in periodic-table tiles; hold to excite the atom, let go for its flame color. | `npx shadcn@latest add https://hoverui.fun/r/element.json` |
| 66 | Saber | Sci-fi | An energy blade that ignites as you arrive and streaks as you swing. It guards over controls, clashes on click, and powers down when still. | `npx shadcn@latest add https://hoverui.fun/r/saber.json` |
| 67 | Magnifier | Lenses | A magnifying glass that really enlarges the page under it. Closer over controls, closer still while you hold. | `npx shadcn@latest add https://hoverui.fun/r/magnifier.json` |
| 68 | Wand | Fantasy | Spell sparks trail the tip, which lights over controls. Click for a burst; draw a circle to cast a shield. | `npx shadcn@latest add https://hoverui.fun/r/wand.json` |
| 69 | Laser | Toys | The pointer is a laser dot and a cat chases it: it creeps, wiggles and pounces, bats at controls and naps when you stop. | `npx shadcn@latest add https://hoverui.fun/r/laser.json` |
| 70 | Fireworks | Colorful | Hold to pack a shell, let go to launch it: a peony, a ring, a willow or a crackle in turn. Entering a control pops a ring of sparks. | `npx shadcn@latest add https://hoverui.fun/r/fireworks.json` |
| 71 | Droplet | Lenses | A water drop that refracts the page under it. Swells over controls; a click sends ripples through the page, bending its words. | `npx shadcn@latest add https://hoverui.fun/r/droplet.json` |
| 72 | Mercury | Weird | A bead of liquid metal that sloshes after you and sheds droplets when you move fast. A click bursts it; the drops roll home. | `npx shadcn@latest add https://hoverui.fun/r/mercury.json` |
| 73 | Halftone | Marks | A halftone dot screen round the pointer. Over controls it turns to the next ink's angle; hold to spread the ink, click to pulse. | `npx shadcn@latest add https://hoverui.fun/r/halftone.json` |
| 74 | Fireflies | Nature | A blinking swarm round the pointer. Over a control they settle along its edge and fall into step, flashing together. | `npx shadcn@latest add https://hoverui.fun/r/fireflies.json` |
| 75 | Leaves | Nature | Autumn leaves tumble off your path and pile up on top of controls. A click is a gust that blows them all away. | `npx shadcn@latest add https://hoverui.fun/r/leaves.json` |
| 76 | Smoke | Weird | An ember with smoke curling up from it, swirling round controls. A click blows a smoke ring that rises as it widens. | `npx shadcn@latest add https://hoverui.fun/r/smoke.json` |
| 77 | Galaxy | Space | A spiral galaxy turning round the pointer, its arms trailing as you move. Over controls the stars trace the outline; press for a supernova. | `npx shadcn@latest add https://hoverui.fun/r/galaxy.json` |
| 78 | Liquid | Lenses | A drop of liquid glass that bends the page at its rim. Over controls it flows out to wrap them in a glass pill; press to squeeze it. | `npx shadcn@latest add https://hoverui.fun/r/liquid.json` |
| 79 | Gecko | Nature | A gecko that stalks the pointer like a bug, its feet planting and stepping as it runs. It flicks its tongue at controls; a click and it lunges. | `npx shadcn@latest add https://hoverui.fun/r/gecko.json` |
| 80 | Coin | Retro | An arcade coin on the pointer. Each click pops a spinning coin with a "+1" and keeps score; over controls a "?" block hangs, and a click bumps them. | `npx shadcn@latest add https://hoverui.fun/r/coin.json` |
| 81 | Lantern | Colorful | A paper sky lantern held above the pointer. Click to let it go and it rises, sways and drifts off; hold to send them up one after another. | `npx shadcn@latest add https://hoverui.fun/r/lantern.json` |
| 82 | Dragon | Fantasy | A little dragon at the pointer's shoulder. Over controls it breathes embers and the control glows hot; a click and it breathes fire, leaving a scorch. | `npx shadcn@latest add https://hoverui.fun/r/dragon.json` |
| 83 | Sand | Nature | Sand pours from the pointer and piles into dunes along the bottom and on top of controls, in bands of color like sand art. Hold to pour a stream. | `npx shadcn@latest add https://hoverui.fun/r/sand.json` |
| 84 | Fluid | Colorful | Dye in a real fluid simulation, stirred by the pointer. The swirls keep curling after you stop, a click splashes a ring of color, controls send up plumes. | `npx shadcn@latest add https://hoverui.fun/r/fluid.json` |

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

The cursor's parent element becomes its area, and your function runs every frame while a mouse is inside. The full API (`pointer.x`, `pointer.y`, `pointer.down`, `pointer.target`, `pointer.hover`, `pointer.ease(speed)`, `pointer.dt`, `pointer.reduced`, `cursorRoot`, `INTERACTIVE`) is on the [useCursor page](https://hoverui.fun/hooks/use-cursor).

## How placement works

| Where you put it | What happens |
| --- | --- |
| In `<body>` | The whole page wears it. |
| In an element | Only that element does. Leave it and the outer cursor takes back over. |
| Nested | The innermost cursor wins. |
| Several in one element | They share it, drawn in the order they mount, and each can come and go on its own. |
| Touch screens | Nothing renders; the native pointer stays. |
| Reduced motion | Cursors snap into place; trails, particles and idle motion stop. |

A cursor attaches to its parent element, so the component must be a direct child of the element it should own.

## Props

| Prop or attribute | Applies to | Description |
| --- | --- | --- |
| `className` | every cursor | Colors the cursor through `currentColor`, e.g. `text-pink-500`. To read on any background, pass `text-white mix-blend-difference` (not on the cursors that carry their own colors: Label, Offset, Ribbon, Confetti, Glow, Neon, Sparkle, Splat, Rocket, Astronaut, UFO, Ghost, Pumpkin, Candle, Flashlight, Compass, Radar, Googly, Classic, Chomp, Matrix, Zap, Balloon, Yo-yo, Fish, Jellyfish, Sun, Tooltip, Glass, Focus, Goggles, Black hole, Top, Rune, Galley, Element, Saber, Magnifier, Wand, Laser, Fireworks, Droplet, Mercury, Fireflies, Leaves, Smoke, Galaxy, Liquid, Gecko, Coin, Lantern, Dragon, Sand and Fluid. Inverted, they turn to negatives, the pills of Label and Element and Tooltip's tip let the text beneath show through, and a blend on Glass, Focus, Goggles, Magnifier, Droplet, Liquid, Rune or Black hole cuts their lenses, veil and warp off from the page). |
| `size`, `speed`, `swell`, `length` | Ring, Trail, Blend, Label | Tune a cursor without editing it: its size in px, how quickly it catches up with the pointer, how much it grows over controls, and Trail's number of dots. Each cursor's page lists the ones it takes and their defaults. |
| `data-cursor-label` | any element, read by Label | The words Label's pill shows while the pointer is over that element. |

Cursors react to hover targets inside their area: `a`, `button`, `input`, `select`, `textarea`, `label`, `[role=button]` and `[data-cursor-label]`. A link wrapping the whole area (a card, say) doesn't count, so a cursor in a clickable card keeps its resting look.

### Known limits

- Cursors are drawn with `position: fixed`. Inside an ancestor that has a `transform`, `filter` or `contain` set, they are positioned against that ancestor instead of the viewport.
- Magnet moves the control you hover by setting its inline `translate`, and hands it back when you leave. A control that sets its own `translate` will lose it while magnetized.
- Black hole, Magnifier, Droplet and Liquid bend the page through an SVG displacement filter used as a `backdrop-filter`. Chromium browsers draw the warp, the zoom, the ripples and the bending glass; elsewhere the hole, the lens and the drop show without them, and Liquid falls back to frosted glass. Under reduced motion Black hole's warp is off; Magnifier keeps its zoom, which only follows the pointer.
- Top's dream levels and Galley's sirens read the hovered control's box but never change the control. Coin's bump does: it plays a 200ms Web Animation on the clicked control's `translate`, which hands the control's own `translate` back when it ends.
- Fluid runs a fluid simulation on the GPU and needs WebGL2 with float render targets. Where those are missing it shows only its pointer dot.

## Accessibility

- Cursors are `aria-hidden` and `pointer-events: none`; they never intercept a click or reach assistive technology.
- They only switch on for a fine, hovering pointer (`(hover: hover) and (pointer: fine)`). Touch screens keep the native pointer.
- Under `prefers-reduced-motion`, cursors snap to the pointer instead of easing, and nothing moves on its own: no trails, particles, bobbing or spinning. Black hole drops its page warp, Galley's monsters stay below, Top no longer wobbles or hops, and Sand and Fluid, which are nothing but motion, show only their pointer dot.
- Most cursors keep a mark on the exact pointer position; the companions (Astronaut, Ghost, Googly, Bat, Pumpkin, UFO, Fly, Fish, Jellyfish, Cloud, Balloon, Yo-yo, Dice, Plane, Snake, Black hole, Rune, Galley, Element, Laser's cat) float, swing or chase beside an exact dot or string end. Pixel snaps to an 8px grid, so its square holds the pointer to within 8px. Blend, Label, Jelly, Spider, Chomp and Magnet ease toward it over a few frames.
- Only the main button counts as a press, so a right-click's menu never leaves a cursor stuck pressed.

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

Ideas for new cursors, bug reports and pull requests are welcome: [open an issue](https://github.com/TarunVishwakarma1/hoverui/issues/new/choose). A cursor you contribute carries your name on its page. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request; [CHANGELOG.md](CHANGELOG.md) records what changed in each release.

## License

Everything in this repository (the cursor components, the shared hook, the registry and the website) is released under the [MIT License](LICENSE).

The planned Cursor Mixer and any other paid features will be distributed separately under their own commercial license. They are not part of this repository, and they will never change the license of the code here.
