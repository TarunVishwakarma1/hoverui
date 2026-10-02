---
name: hover-ui
description: Copy-paste cursor components for React, shown as the live previews of a design annual.
colors:
  paper: "#f5f4f6"
  paper-warm: "#faf6f5"
  paper-cool: "#eef3ef"
  preview: "#ebeaee"
  ink: "#16181a"
  ink-soft: "#55585c"
  hairline: "#c9c7c4"
  seal: "#dcddf3"
  paper-dark: "#131315"
  paper-warm-dark: "#1a1719"
  paper-cool-dark: "#121815"
  preview-dark: "#1d1d21"
  ink-dark: "#e9e8e4"
  ink-soft-dark: "#9b9994"
  hairline-dark: "#3a3a40"
  seal-dark: "#363962"
typography:
  display:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "clamp(3rem, 6.4vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline-row:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
  body-small:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  control:
    fontFamily: "Host Grotesk, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Fragment Mono, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.14em"
  code:
    fontFamily: "Fragment Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
    fontFeature: "\"liga\" 0, \"calt\" 0"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  gutter-sm: "24px"
  gutter: "40px"
  stack-sm: "16px"
  stack: "24px"
  stack-md: "32px"
  column-gap: "40px"
  section-sm: "64px"
  section: "80px"
  section-lg: "96px"
  bar: "72px"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "9px 16px"
  button-primary-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "9px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  install-command:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  install-command-quiet:
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
  code-figure:
    backgroundColor: "{colors.paper-warm}"
    typography: "{typography.code}"
    rounded: "{rounded.none}"
    padding: "20px"
  preview:
    backgroundColor: "{colors.preview}"
    rounded: "{rounded.none}"
    padding: "32px"
  site-bar:
    backgroundColor: "{colors.paper}"
    height: "{spacing.bar}"
  stamp:
    backgroundColor: "{colors.seal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "144px"
  pager-arrow:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "44px"
  theme-toggle:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "40px"
  theme-toggle-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: hover-ui

## Overview

**Creative North Star: "The Live Annual"**

hover-ui is set like the reproduction section of a design annual (the plate section of a printed book is the world's origin) in which every reproduction is live. The page is a sheet of uncoated stock, near-white by default and black in the Black-stock edition; each cursor is shown in a registered preview, a flat grey field framed by printer's registration marks at its four corners, credited underneath like a reproduction in a printed book. The visitor arrives already wearing the site's own registration-mark cursor (Register, cursor 05, mounted in `<body>`), and every preview they enter hands the pointer to that preview's cursor.

The system is quiet so the cursors can be loud. One grotesque at a single weight carries everything a person reads or presses; a small caps mono carries only the apparatus of the annual: credits, data and code. Ink, never black, on paper; hairlines rather than boxes; one periwinkle seal as the only color. Nothing moves on its own except the seal's slow turning ring.

It refuses the dark bento grid of equal preview cards that component libraries ship; even on black stock, previews vary in span and aspect, sit one tonal step off the sheet in either edition, and are separated by rules and margin, not by card chrome. One user-approved exception: the all-cursors page is a gallery of equal live preview tiles in a docs layout, still registered, ruled and credited, never carded.

**Key Characteristics:**
- Two editions of one annual: light, and the Black-stock edition (`color-scheme: dark`), same world on black uncoated stock. The OS setting picks the default; the bar's toggle overrides and persists. Either sheet drifts warm at the top-left and cool at the bottom-right.
- Host Grotesk 400 throughout; Fragment Mono 11px caps only for the annual's apparatus.
- Zero-radius rectangles for every control and surface; circles only for the seal, cursor-to-cursor arrows and the cursors themselves.
- Registration crosshairs at every preview corner and in the sidebar gutter beside the current entry; the same mark is the cursor hotspot and the logo.
- Each preview shows a resting geometric specimen of its cursor that fades while the live cursor is inside.

## Colors

A near-neutral paper-and-ink palette with a single cool accent; chroma is almost zero everywhere except the seal. Each token has a Black-stock value (the `-dark` keys in the frontmatter) swapped in under `:root[data-theme="dark"]`; prose names below cover both editions.

### Primary
- **Annual Ink** (ink): All text, 1px control outlines, the filled primary button and install command, registration marks and focus rings. A blue-leaning near-black so the page reads printed, not screened; in the Black-stock edition, a warm white (ink-dark).

### Secondary
- **Periwinkle Seal** (seal): The rotating letterpress stamp and text selection. One use per view; it is a stamp, not a theme color. On black stock it deepens (seal-dark) so Ink still reads on it.

### Neutral
- **Sheet** (paper): The page ground, the sticky bar, and the text color of filled controls.
- **Warm Edge** (paper-warm): The top-left drift of the sheet's gradient, code figures, and the inset inner preview.
- **Cool Edge** (paper-cool): The bottom-right drift of the sheet's gradient; never used as a fill on its own.
- **Preview Grey** (preview): The field of every live preview, one tonal step off the sheet so the preview reads as a printed area: one step darker on the light sheet, one step lighter on black stock.
- **Soft Ink** (ink-soft): Secondary copy, cursor descriptions, mono credits, inactive nav links and index entries.
- **Hairline** (hairline): Every 1px rule, the sticky bar's lower edge, code-figure borders, dashed list dividers, dotted grids inside previews, and the scrollbar thumb.

### Named Rules
**The Ink Not Black Rule.** Site text and fills use Annual Ink, never `#000`. Pure white appears only inside cursors: in those that blend by difference, where it renders as near-Ink over paper and as paper over Ink, and in the drawn cursors' own fills (Googly's eyes).

**The One Seal Rule.** The periwinkle seal is the only chromatic color on the site; it appears as the stamp and as selection, nothing else.

**The Reprint Rule.** The Black-stock edition is the same annual reprinted, not a second design: it swaps the eight color tokens and `color-scheme`, nothing else. Every surface, specimen and browser surface (selection, caret, scrollbar, focus ring) reads the tokens, so there are no `dark:` utilities and no per-theme overrides. Each light-mode contrast is mirrored (ink on paper 15.13:1 dark vs 16.24:1 light; ink-soft on paper 6.52:1 in both; ink on seal 8.93:1 vs 13.29:1).

**The Reader's Stock Rule.** The edition defaults to `prefers-color-scheme` and follows OS changes live until the reader chooses; the toggle's choice persists (`localStorage` "theme") and wins. A blocking head script sets `data-theme` before first paint, so no edition ever flashes.

## Typography

**Display Font:** Host Grotesk (via `next/font`, sans fallback)
**Body Font:** Host Grotesk
**Label/Mono Font:** Fragment Mono (400)

**Character:** A single-weight grotesque that does all the speaking, paired with a typewriter-like mono that does all the cataloguing. Hierarchy comes from size and tracking alone; there is no bold.

### Hierarchy
- **Display** (400, clamp 48px to 92px, 0.98, -0.02em, balanced): The statement on the home page, "All cursors", the cursor name on a cursor page, the hook name on a hook page, the footer line. One per page.
- **Headline** (400, clamp 36px to 56px, 1.02, -0.02em): Home section heads ("The cursors", the placement statement).
- **Headline Row** (400, 28px/32px, -0.02em): Docs row heads in the left four columns: Usage, Props, Source on cursor pages; Used by, Your own cursor, API, Source on hook pages.
- **Title** (400, 22px/28px, -0.01em): Cursor names in credits, the home index row, gallery tile captions, the hook page's Used by list and prev/next navigation.
- **Body** (400, 17px/24px): Running copy, held to 34-46ch.
- **Body Small** (400, 15px/22px): Cursor descriptions and notes under install commands, max 52ch; sidebar cursor entries run at 15px/24px.
- **Control** (400, 15px/20px, sentence case): Buttons, Copy, "View cursor", "All cursors".
- **Label** (Fragment Mono 400, 11px/16px, 0.14em, uppercase): The bar's section links, sidebar group labels (linked to their gallery sections), gallery section counts, credit lines, code-figure captions, data terms, "Needs a mouse".
- **Code** (Fragment Mono 400, 13px/20px, ligatures off): Install commands, source, inline code (inline runs at 15px inside body copy), data values and the sidebar's hook entries (at 24px leading). A `data-*` attribute named in a cursor description is set in mono at 0.9em and never breaks.

Specimen captions inside previews wrap with `text-wrap: pretty`.

### Named Rules
**The Plain Names Rule.** On the site, cursors are named, never numbered: credits, gallery captions, the home index row, the hook page's Used by list, the pager and the sidebar show the title alone. Nothing sits above a heading: no eyebrow, no kicker.

**The Two Voices Rule.** Anything a person reads as prose or presses is Host Grotesk in sentence case. Mono is reserved for credits, data, code (hook names in the sidebar are code), the bar's section links and the sidebar's group labels; controls never go mono or uppercase.

**The Copies As Shown Rule.** Code turns off ligatures and contextual alternates so source on screen reads exactly as it pastes.

## Layout

A 12-column grid inside a 1440px container with 24px gutters (40px from `sm`). Below `lg` everything stacks to one column; at `lg` the grid opens. A 72px sticky bar sits over everything; its items are spaced 24px apart on phones and 40px from `sm`.

The home first viewport fills the screen below the bar: statement, subcopy and install on the left six columns; the hero preview on the right six with the seal half off its lower-left corner. Beneath it a hairline index row lists the five featured cursors (five columns at `lg`, two at `sm`, divided by 1px rules and dashed row breaks). Further previews vary deliberately in span and aspect (8, 12, then 6 and 6 columns; 16/10, 21/9, 4/3), never a uniform card grid; the set ends with "Browse cursors".

Every `/cursors` and `/hooks` page sits in one docs layout. From `lg`, a sticky 13rem sidebar index stands beside the content (48px apart) and scrolls on its own once it outgrows the screen; its scroll box reaches 24px into the left gutter so the current-entry mark is never clipped. Below `lg` there is no sidebar.

The all-cursors page opens with the display title and a short intro, then one section per category: a hairline rule, the category name (28px) with its count in the mono label, and 48px below it a gallery of live preview tiles: one column, two from `sm`, three from `xl`, with 64px between columns and 80px between rows, enough to clear neighboring tiles' corner marks. Every tile is the same 4/3 registered preview with its caption beneath. Sections end 80px above the next rule.

Cursor and hook pages share one hero: the display title and description on the left, the install block on the right from `xl` (6/6, bottom-aligned). At `lg` the install sits under the description; on a cursor page on phones it comes after the preview. A cursor page's preview then runs the full content width (4/5, 16/10 from `sm`, 2/1 from `xl`) with a credits row of four data columns beneath it (two on phones). Hairline-topped docs rows follow, then the prev/next pager on cursor pages.

Rhythm is generous and vertical: 16-32px inside a block, 64-96px between sections, each section opened by a 1px hairline rule. Registered frames keep 22px of clear margin around them for the corner marks.

### Named Rules
**The Hairline Section Rule.** Sections are divided by a single 1px hairline and space, never by background bands or cards.

**The One Gallery Rule.** The all-cursors gallery is the only uniform grid of equal previews, approved by the user for that page ("Live preview tiles"). Every other set of previews varies in span and aspect.

## Elevation & Depth

Completely flat. There are no shadows anywhere. Depth is tonal and printed: the preview field sits one tonal step off the sheet (darker on light stock, lighter on black), the inner preview one step warmer, and the sheet itself carries two very large radial drifts (warm top-left, cool bottom-right). The only lift is motion: the seal rises 4px on hover.

### Named Rules
**The Printed Depth Rule.** If something needs to stand forward, change its tone or rule it off; never cast a shadow.

## Shapes

Rectangles with square corners (0px) for every control, preview, code figure and install command. Borders are 1px: Ink for controls, Hairline for structure. Circles are the deliberate exception and come from the world itself: the seal stamp, the 44px prev/next arrows, and every cursor's dot, ring and pill, along with the drawn cursors' own shapes. The registration mark (crosshair through a small circle, 1px stroke) is the recurring silhouette: logo, preview and list corners, and the site cursor's hotspot. Arrows are 1.25px stroked SVG lines.

### Named Rules
**The Square Control Rule.** Anything rectangular is square-cornered. Roundness is reserved for circles, and circles are reserved for the seal, arrow buttons and cursors.

## Components

### Buttons
Flat, ruled and immediate.
- **Shape:** Square corners (0px), 1px Ink border, 9px by 16px padding, 8px gap to a trailing arrow.
- **Primary:** Filled Ink with Sheet text. One filled primary per first viewport, and on the home page that slot belongs to the install command.
- **Hover / Focus:** Primary inverts to Sheet with Ink text; secondary fills Ink with Sheet text. Both transition color in 0.1s ease. Focus is a 1px Ink outline offset 3px, site-wide.
- **Secondary:** 1px Ink outline on transparent; the default for every other control (Install in the bar, "Browse cursors", in-preview links).

### Install Command
The site's primary action: the full `npx shadcn@latest add` command set in 13px mono with a "Copy" control fused to its right edge by a divider. Filled Ink where it is the page's main action (home first viewport, the cursor-page hero's install block, footer); 1px Ink outline ("quiet") where it repeats under every cursor credit. The URL breaks only between its segments on phones. Copy confirms as "Copied" (or "Select to copy" on failure) for 1.8s through a live region. The cursor and hook pages' install block (`#install`) adds a soft-ink note: on a cursor page it names the one cursor file and says the CLI installs the useCursor hook (linked) once into the hooks folder; on the hook page it names the hook file.

### Preview (signature)
- **Corner Style:** Square, with a 24px registration mark set 22px outside each corner.
- **Background:** Preview Grey by default; Warm Edge for a preview nested inside another.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Contents:** The preview's live cursor plus its specimen: a composition authored for that cursor and a resting geometric drawing of the cursor itself, which fades out over 150ms while the live cursor is active (keyed on the `data-preview` surface). Ring and Register specimens reuse the plain resting mark (`Glyph`).
- **Cursorless:** On devices without a fine hovering pointer (the same media gate the cursor hook uses), copy inside previews swaps to touch-true wording, controls that exist only to be hovered or pressed (a specimen's "Button", "Press and hold") hide, and "Needs a mouse" appears as a mono label in the preview's top margin, between the corner marks. Gallery tiles turn the note off; the page intro carries the touch wording instead.

### Cursor Credits
A hairline rule, then the title (22px), "View cursor" with an arrow at the far right, a soft-ink description, and the quiet install command. On a cursor page the credits become a four-column data row under the preview: Kind, Hook, Dependencies, License, each a mono label over a 13px mono value; Hook links to useCursor. The Source row shows only the cursor file, then a sentence linking the hook, which has its own page.

### Gallery Tile
The all-cursors entry: one link (`data-cursor-label` "Open <title>") wrapping a 4/3 registered preview. The tile wears its cursor live; otherwise it shows a resting scene, which is the cursor drawn engaged with a small target, about 120-220px across: Ring swollen around an underlined "Case study", a 14-dot Trail arc, an Ink bar under Blend's difference disc, Label's "View" pill over a hairline-underlined word, and Register's opened ring over a 1px outline "Button". The rest follow the same pattern, such as Frame's corners and Doodle's scribbled loop around a hairline "Button", Magnet's control leaning off its dashed resting outline, Readout's crosshair with its coordinates, Classic's arrow, hand and hourglass side by side, and Flashlight's dark panel with a pool of light. Drawn cursors use their own exported art, so a scene never redraws a cursor by hand. A scene's wrapper takes no transform, because a transform would isolate Blend's disc from the field it inverts. The caption sits 32px below the preview: a hairline rule, then the title (22px, underlined on hover), then the Soft Ink description (15px, max 52ch).

### Docs Row
The shared section on cursor and hook pages: a 1px Hairline top rule and 48px of vertical padding, with the 28px heading in four columns and content in eight (20px between items). It stacks below `lg`. Definition lists inside a row (Props, API) are ruled in Hairline top and bottom, with a 13px mono term in an 11rem column and a Soft Ink definition. The hook page's Used by row groups every cursor by category the way the sidebar does (mono group label over 15px titles), in balanced columns: two on phones, three from `sm`, four from `xl`.

### Code Figure
A Hairline-bordered figure on translucent Warm Edge; a mono-label caption bar with Copy at the right, then 13px code with 20px padding, wrapping instead of scrolling.

### Navigation
- **Sticky bar:** 72px, Sheet background, Hairline bottom rule. Mark plus "hover-ui" at left; section links in the mono label, Soft Ink, turning Ink on hover: "Cursors" (always), lit Ink and underlined 6px below on `/cursors` and every cursor page, and "Placement" and "GitHub" (the repository) from `sm`. The theme toggle and a secondary Install button sit at right; Install jumps to the current cursor's install block on a cursor page and to the home page's everywhere else.
- **Sidebar index:** From `lg` on every cursor and hook page, in order: "All cursors" in the control style (underlined on hover); each registry category as a mono group label over its entries (15px titles); then a "Hooks" group whose entries are set in 13px mono. Entries are Soft Ink and turn Ink on hover. The current entry is marked by the 16px registration mark hung in the gutter to its left, never by an underline; current cursor and hook entries also turn Ink.
- **Cursor-to-cursor:** 44px circular Ink-outlined arrow buttons that fill Ink on hover in 0.1s, beside the neighbor's title.

### Seal Stamp
A 128px (144px from `sm`) Periwinkle Seal disc with a mono text ring turning once every 25s linear and a centered out-arrow. It lifts 4px over 0.6s on the annual ease when hovered. Under reduced motion it stands still. One per view, hung off a registered frame's corner: today only the home hero preview's lower-left.

### Theme Toggle
A 40px square in the bar's right cluster, before Install: 1px Ink outline, square corners, inverting to filled Ink with Sheet on hover in 0.1s like the secondary button. It holds an authored 1.25px-stroke density patch (a circle with its left half filled), a printer's mark that mirrors whichever stock the page is on. It is a toggle button: `aria-label` "Dark theme" with `aria-pressed`. The switch runs through a document View Transition, the browser's default root crossfade (about 250ms, ease, opacity only), kept under reduced motion because it prevents a jarring brightness change rather than adding movement; where View Transitions are unsupported it switches instantly. This is the system's only theme motion.

### Cursors (the product)
Fixed, `aria-hidden`, non-interactive overlays, sixty of them in thirteen categories. The monochrome ones draw in `currentColor` (Ink by default) from circles and 1px strokes; the rest carry their own palette. Every one reacts to hover and press. They appear over 150ms only on a fine hovering pointer and snap instead of easing under reduced motion.

On this site every cursor is mounted with `cursorTone` (`text-white mix-blend-difference`, in `app/catalog.tsx`) so it stays visible over Ink-filled hover states, the install command and the Ink tile. The exceptions keep their own colors (`ownColors`): Label, whose pill carries words that would show the text beneath through an inverted pill, so it stays an opaque Ink pill with a 1px hairline in its own contrast color; the colorful and drawn cursors (Offset, Ribbon, Confetti, Glow, Neon, Sparkle, Splat, Rocket, Astronaut, UFO, Ghost, Pumpkin, Candle, Compass, Radar, Googly, Classic, Chomp, Matrix, Zap, Sun, Balloon, Yo-yo, Fish, Jellyfish), which would turn to negatives; Tooltip, whose tip carries words like Label's pill; Flashlight, whose dark would become a glare; and Glass, Focus and Goggles, whose lenses a blend would cut off from the page they see.

Cursors need no theme work: difference-blended cursors invert against either stock, Label's pill computes its own contrast text, and own-color cursors keep their palette in both editions, drawing outlines in `currentColor`.

## Do's and Don'ts

### Do:
- **Do** set every control in Host Grotesk 15px sentence case, filled Ink for the single primary and 1px Ink outline for everything else.
- **Do** frame every live preview with registration marks at all four corners and give it a resting specimen that fades while its cursor is active.
- **Do** mirror the cursor hook's media gate with `cursorless` copy so every preview stays true on touch.
- **Do** divide sections with a single 1px Hairline rule and generous space.
- **Do** mark the current sidebar entry with the registration mark in the gutter, not an underline.
- **Do** turn ligatures off in code.
- **Do** mount site cursors with `cursorTone` so they read over paper and Ink alike, except the own-color cursors (`ownColors`).
- **Do** style new surfaces only through the color tokens so they reprint correctly on black stock.

### Don't:
- **Don't** put an eyebrow or kicker above any heading.
- **Don't** show cursor numbers on the site; a cursor is its name there.
- **Don't** set controls in mono or uppercase; mono is for credits, data, code, the bar's section links and the sidebar's group labels.
- **Don't** place more than one filled Ink primary in a first viewport.
- **Don't** add shadows or rounded rectangles.
- **Don't** add `dark:` utilities or per-theme overrides; a surface that needs one is reading the wrong token.
- **Don't** use pure black for text or fills, or any accent beyond the periwinkle seal.
- **Don't** lay previews out as a uniform grid of equal cards; the all-cursors gallery is the one user-approved exception.
- **Don't** animate anything on its own except the seal's ring.
