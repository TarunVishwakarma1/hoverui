# Changelog

All notable changes to hover-ui are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes to the installable cursors and the `useCursor` hook are listed first in each release, because they reach every project that installs them.

## [Unreleased]

### Added

- Five cursors, for 65 in all, each with more to it than following the pointer:
  - Black hole (Space): bends the page round it like a gravitational lens (in Chromium browsers), and the dust of your path spirals into its disk. It swells over controls; hold, and time slows to a crawl while its light reddens.
  - Top (Toys): a spinning top on the pointer. Stop moving and it slows, wobbles wider and teeters, but never quite falls. The hovered control sinks into dream levels, frame within frame, and a click is the kick: the top hops and lands on a fresh spin.
  - Rune (Fantasy): a gold ring at the pointer's side. Over controls it heats and runes kindle round it; left idle it creeps closer, asking to be worn. Hold to put it on: you vanish, the page drains to grey, wraiths circle you and the dark closes in the longer you wear it.
  - Galley (Ocean): a Greek galley rowing after the pointer with a wake behind it. Monsters surface round it: Scylla's tentacle, a sea serpent, the Cyclops, the Gorgon, whose gaze turns the ship to stone, and Charybdis's whirlpool. Sirens sing from controls and the oars lift; a click calls up a monster.
  - Element (Labels): a periodic-table tile, Holmium for hover, its electrons circling faster as you move. Over a control it spells the name title-card style, a tile in each word; hold to excite the atom and let go to see a photon in the element's flame color.
- Five more, for 70 in all, and two new categories, Sci-fi and Fantasy (Rune moves to Fantasy):
  - Saber (Sci-fi): an energy blade held at the pointer. It ignites as you arrive, swings against your motion and streaks, raises a guard and burns brighter over controls, clashes in sparks on a click, and powers down when you stand still.
  - Magnifier (Lenses): a magnifying glass that really enlarges the page under it (in Chromium browsers), closer over controls and closer still while held.
  - Wand (Fantasy): spell sparks trail the tip, the tip lights over controls, a click casts a burst, and drawing a circle casts a shield.
  - Laser (Toys): the pointer is a laser dot that a cat chases. It creeps up, wiggles and pounces, bats at controls, and curls up to nap when you stop.
  - Fireworks (Colorful): hold to pack a shell and let go to launch it from the bottom of the area; it bursts at the pointer as a peony, a ring, a gold willow or a crackle, in turn. Entering a control pops a ring of sparks, and a sparkler fizzes while you stay.
- `IDEAS.md`: the backlog of cursors to build next, open to contributors.
- Search in the bar on every page: a field from `lg` and a button below it, reached from anywhere with "/" or ⌘K. It finds any cursor or hook by name, category, description or keywords (whole words ranked first), marks the matched part of each title, and shows the highlighted cursor live beside the results, so it can be tried, opened or copied without leaving the page. Each registry item carries a few search keywords in `meta.keywords`.
- A filter on the all-cursors page that narrows the gallery in place; it sticks under the bar as you scroll and keeps the filter in the address (`?q=`).
- Long source files on cursor and hook pages fold to their first screenful, with "Show all N lines" to open the rest.
- Contributor credit: a cursor's registry item can carry the shadcn `author` field ("Name <https://github.com/handle>"), shown at the foot of its page as "Contributed by" with a link to the contributor, and in the page's structured data. Every cursor page ends with a "Contribute a cursor" link to CONTRIBUTING.md.

## [0.2.0] - 2026-10-02

### Added

- Fifty-five cursors, for 60 in all, in 13 categories:
  - Followers: Ring, Trail, Magnet;
  - Lenses: Blend, Glass, Focus, Goggles;
  - Labels: Label, Tooltip, Peek;
  - Marks: Register, Frame, Stamp, Caret;
  - Colorful: Offset, Ribbon, Confetti, Glow, Neon, Sparkle, Splat;
  - Space: Comet, Orbit, Rocket, Astronaut, UFO, Constellation;
  - Halloween: Ghost, Spider, Flashlight, Bat, Pumpkin, Candle;
  - Mechanical: Gear, Readout, Compass, Clock, Radar;
  - Weird: Googly, Jelly, Doodle, Fly;
  - Retro: Classic, Chomp, Matrix, Snake, Pixel;
  - Weather: Cloud, Zap, Snow, Sun, Tornado;
  - Toys: Balloon, Yo-yo, Dice, Plane;
  - Ocean: Bubbles, Fish, Jellyfish, Ripple.
- `pointer.dt` (seconds since the last frame) and `pointer.reduced` (the visitor prefers reduced motion) on `useCursor`, for springs, particles and idle motion.
- `pointer.hover` on `useCursor`: the clickable element under the pointer inside the cursor's own area. Every cursor reacts to hover and press.
- A gallery at `/cursors`: one live preview tile per cursor, in a section per category. Each tile shows its cursor drawn at rest, wears it when you hover, and opens its page on click. The sidebar's category names jump to their sections.
- A sidebar index beside every `/cursors` and `/hooks` page from `lg` up: cursors grouped by kind, then Hooks, with the current page marked by the registration mark.
- A `useCursor` page at `/hooks/use-cursor`: install it on its own, see the cursors that use it, copy a custom-cursor example, and read its API and source.
- Categories in `registry.json` (`Followers`, `Lenses`, `Labels`, `Marks`, `Colorful`, `Space`, `Halloween`, `Mechanical`, `Weird`, `Retro`, `Weather`, `Toys`, `Ocean`), using the shadcn registry's own `categories` field.
- A dark theme, the "Black-stock edition", with a toggle in the sticky bar. It follows the OS setting by default, remembers the visitor's choice, applies it before first paint, and crossfades on switch.
- Search engine and sharing support: `robots.txt`, `sitemap.xml`, canonical URLs, Open Graph and Twitter cards with a share image, and JSON-LD (`WebSite`, `CollectionPage` with an `ItemList`, `SoftwareSourceCode`, `BreadcrumbList`).
- A registration-mark favicon and app icon, replacing the Next.js default.
- Project docs: README, ARCHITECTURE, CONTRIBUTING, this changelog, issue templates and the MIT `LICENSE` file.

### Fixed

- Zap and Radar no longer override the color you pass through `className`: their palette sits on their own parts, so the root's `currentColor` is yours.
- A right-click no longer leaves cursors pressed: the context menu swallowed the button release. Only the main button counts as a press now, and leaving the window releases it.
- Cursors in the gallery's tiles no longer read the tile's own link as a hover: Frame framed the whole tile, Readout showed its size, and Ring, Gear and Orbit stayed in their hover state.
- Touches on a touchscreen laptop no longer wake the mouse cursor.
- Confetti starts clean each time the pointer comes back, instead of showing bits frozen from the last visit.
- Readout's label flips to the other side of the crosshair near the right and bottom edges instead of running off screen.
- Flashlight's pool of light reads on dark pages.
- The sidebar scrolls to the current cursor, so it stays visible far down the index.
- At 1024px, the home hero preview's controls no longer run under the seal.
- Controls inside previews that exist only to be hovered or pressed hide on touch screens, where they did nothing.
- Each cursor page's Props row now describes what `className` does for that cursor; it no longer tells cursors with their own colors to use `mix-blend-difference`.
- The sticky bar's section links, "View cursor" and the sidebar's "All cursors" now have 24px targets.

### Changed

- Trail, Offset, Ribbon, Confetti, Comet, Rocket, Astronaut, Ghost, Spider, Googly and Jelly now react to links and buttons: Trail's head swells, Offset's rings misregister, Ribbon fattens, Confetti pops a burst, Comet gains a coma, Rocket's engine roars, Astronaut reels in, Ghost swoops closer, Spider scuttles, Googly's eyes go wide and Jelly swells.
- `useCursor` is its own registry item (`registry:hook`). Cursors declare it in `registryDependencies`, so the shadcn CLI installs it once into your hooks folder (`@/hooks/use-cursor.ts`), rewrites the cursors' imports to your alias, and skips it when it is already there. Each cursor now ships a single file.
- The sticky bar now links to sections ("Cursors", "Placement") instead of listing every cursor, so it holds at any number of them.
- Cursor pages live at `/cursors/<name>`. They put the title on top with the install command beside it, show the live preview at full width and add a credits row (number, kind, files, dependencies, license). The sticky bar's Install jumps to the current cursor's command.
- The home page shows the first five cursors and links to the full list.
- Page titles and descriptions name the cursor and "React" for search.
- The site no longer shows cursor numbers: the sidebar, gallery, credits row, pager and lists use names alone. The README's cursor table keeps its numbers.
- The hook page's Used by list groups every cursor by category, in columns.

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
