---
name: hover-ui
description: Copy-paste cursor components for React, shown as the live plates of a design annual.
colors:
  paper: "#f5f4f6"
  paper-warm: "#faf6f5"
  paper-cool: "#eef3ef"
  plate: "#ebeaee"
  ink: "#16181a"
  ink-soft: "#55585c"
  hairline: "#c9c7c4"
  seal: "#dcddf3"
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
  plate:
    backgroundColor: "{colors.plate}"
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
  plate-arrow:
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "44px"
---

# Design System: hover-ui

## Overview

**Creative North Star: "The Live Plate Section"**

hover-ui is set as the plate section of a design annual where every plate is live. The page is a sheet of uncoated near-white stock; each cursor is a registered plate, a flat grey field framed by printer's registration marks at its four corners, credited underneath like a reproduction in a printed book. The visitor arrives already wearing the site's own registration-mark cursor (Register, plate 05, mounted in `<body>`), and every plate they enter hands the pointer to that plate's cursor.

The system is quiet so the cursors can be loud. One grotesque at a single weight carries everything a person reads or presses; a small caps mono carries only the apparatus of the annual: credits, plate numbers, data and code. Ink, never black, on paper; hairlines rather than boxes; one periwinkle seal as the only color. Nothing moves on its own except the seal's slow turning ring.

It refuses the dark bento grid of equal preview cards that component libraries ship: plates vary in span and aspect, sit on a light sheet, and are separated by rules and margin, not by card chrome.

**Key Characteristics:**
- Light only (`color-scheme: light`); a paper sheet drifting warm at the top-left and cool at the bottom-right.
- Host Grotesk 400 throughout; Fragment Mono 11px caps only for the annual's apparatus.
- Zero-radius rectangles for every control and surface; circles only for the seal, plate-to-plate arrows and the cursors themselves.
- Registration crosshairs at every plate corner; the same mark is the cursor hotspot and the logo.
- Each plate shows a resting geometric specimen of its cursor that fades while the live cursor is inside.

## Colors

A near-neutral paper-and-ink palette with a single cool accent; chroma is almost zero everywhere except the seal.

### Primary
- **Annual Ink** (ink): All text, 1px control outlines, the filled primary button and install command, registration marks and focus rings. A blue-leaning near-black so the page reads printed, not screened.

### Secondary
- **Periwinkle Seal** (seal): The rotating letterpress stamp and text selection. One use per view; it is a stamp, not a theme color.

### Neutral
- **Sheet** (paper): The page ground, the sticky bar, and the text color of filled controls.
- **Warm Edge** (paper-warm): The top-left drift of the sheet's gradient, code figures, and the inset inner plate.
- **Cool Edge** (paper-cool): The bottom-right drift of the sheet's gradient; never used as a fill on its own.
- **Plate Grey** (plate): The field of every live plate, one step darker than the sheet so the plate reads as a printed area.
- **Soft Ink** (ink-soft): Secondary copy, plate descriptions, mono credits and plate numbers, inactive nav tokens.
- **Hairline** (hairline): Every 1px rule, the sticky bar's lower edge, code-figure borders, dotted grids inside plates, and the scrollbar thumb.

### Named Rules
**The Ink Not Black Rule.** Site text and fills use Annual Ink, never `#000`. Pure white appears only inside cursors that blend by difference, where it renders as near-Ink over paper and as paper over Ink.

**The One Seal Rule.** The periwinkle seal is the only chromatic color on the site; it appears as the stamp and as selection, nothing else.

## Typography

**Display Font:** Host Grotesk (via `next/font`, sans fallback)
**Body Font:** Host Grotesk
**Label/Mono Font:** Fragment Mono (400)

**Character:** A single-weight grotesque that does all the speaking, paired with a typewriter-like mono that does all the cataloguing. Hierarchy comes from size and tracking alone; there is no bold.

### Hierarchy
- **Display** (400, clamp 48px to 92px, 0.98, -0.02em, balanced): The statement on the home page, the plate name on a plate page, the footer line. One per page.
- **Headline** (400, clamp 36px to 56px, 1.02, -0.02em): Home section heads ("The plates", the placement statement).
- **Headline Row** (400, 28px/32px, -0.02em): Section heads on plate pages (Install, Usage, Props, Source), sitting in the left four columns.
- **Title** (400, 22px/28px, -0.01em): Plate names in credits, the plate index and prev/next navigation.
- **Body** (400, 17px/24px): Running copy, held to 34-46ch.
- **Body Small** (400, 15px/22px): Plate descriptions and notes under install commands, max 52ch.
- **Control** (400, 15px/20px, sentence case): Buttons, Copy, "View plate".
- **Label** (Fragment Mono 400, 11px/16px, 0.14em, uppercase): Plate numbers, sticky-bar plate tokens, credit lines, code-figure captions, data terms, "Needs a mouse".
- **Code** (Fragment Mono 400, 13px/20px, ligatures off): Install commands, source, inline code (inline runs at 15px inside body copy) and data values.

### Named Rules
**The Number Trails Rule.** A plate's number follows its title on the same baseline, in the mono label. Nothing sits above a heading: no eyebrow, no kicker.

**The Two Voices Rule.** Anything a person reads as prose or presses is Host Grotesk in sentence case. Mono is reserved for credits, data, code and the bar's plate tokens; controls never go mono or uppercase.

**The Copies As Shown Rule.** Code turns off ligatures and contextual alternates so source on screen reads exactly as it pastes.

## Layout

A 12-column grid inside a 1440px container with 24px gutters (40px from `sm`). Below `lg` everything stacks to one column; at `lg` the grid opens. A 72px sticky bar of mono plate tokens sits over everything (tokens appear from `lg`; below that only the mark, name and Install remain).

The home first viewport fills the screen below the bar: statement, subcopy and install on the left six columns; the hero plate on the right six with the seal half off its lower-left corner. Beneath it a hairline index row lists every plate (five columns at `lg`, two at `sm`, divided by 1px rules and dashed row breaks). Further plates vary deliberately in span and aspect (8, 12, then 6 and 6 columns; 16/10, 21/9, 4/3), never a uniform card grid.

Plate pages use a 4/8 split: name, description and a mono data list on the left, the plate on the right; then hairline-topped rows with the heading in four columns and content in eight.

Rhythm is generous and vertical: 16-32px inside a block, 64-96px between sections, each section opened by a 1px hairline rule. Plates keep 22px of clear margin around them for the corner marks.

### Named Rules
**The Hairline Section Rule.** Sections are divided by a single 1px hairline and space, never by background bands or cards.

## Elevation & Depth

Completely flat. There are no shadows anywhere. Depth is tonal and printed: the plate field sits one step below the sheet, the inner plate one step warmer, and the sheet itself carries two very large radial drifts (warm top-left, cool bottom-right). The only lift is motion: the seal rises 4px on hover.

### Named Rules
**The Printed Depth Rule.** If something needs to stand forward, change its tone or rule it off; never cast a shadow.

## Shapes

Rectangles with square corners (0px) for every control, plate, code figure and install command. Borders are 1px: Ink for controls, Hairline for structure. Circles are the deliberate exception and come from the world itself: the seal stamp, the 44px prev/next plate arrows, and every cursor's dot, ring and pill. The registration mark (crosshair through a small circle, 1px stroke) is the recurring silhouette: logo, plate corners, and the site cursor's hotspot. Arrows are 1.25px stroked SVG lines.

### Named Rules
**The Square Control Rule.** Anything rectangular is square-cornered. Roundness is reserved for circles, and circles are reserved for the seal, arrow buttons and cursors.

## Components

### Buttons
Flat, ruled and immediate.
- **Shape:** Square corners (0px), 1px Ink border, 9px by 16px padding, 8px gap to a trailing arrow.
- **Primary:** Filled Ink with Sheet text. One filled primary per first viewport, and on the home page that slot belongs to the install command.
- **Hover / Focus:** Primary inverts to Sheet with Ink text; secondary fills Ink with Sheet text. Both transition color in 0.1s ease. Focus is a 1px Ink outline offset 3px, site-wide.
- **Secondary:** 1px Ink outline on transparent; the default for every other control (Install in the bar, "Browse plates", in-plate links).

### Install Command
The site's primary action: the full `npx shadcn@latest add` command set in 13px mono with a "Copy" control fused to its right edge by a divider. Filled Ink where it is the page's main action (home first viewport, plate-page Install row, footer); 1px Ink outline ("quiet") where it repeats under every plate credit. The URL breaks only between its segments on phones. Copy confirms as "Copied" (or "Select to copy" on failure) for 1.8s through a live region.

### Plate (signature)
- **Corner Style:** Square, with a 24px registration mark set 22px outside each corner.
- **Background:** Plate Grey by default; Warm Edge for a plate nested inside another.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Contents:** The plate's live cursor plus its specimen: a composition authored for that cursor and a resting geometric drawing of the cursor itself, which fades out over 150ms while the live cursor is active.
- **Cursorless:** On devices without a fine hovering pointer (the same media gate the cursor hook uses), copy inside plates swaps to touch-true wording and "Needs a mouse" appears as a mono label in the plate's top margin, between the corner marks.

### Plate Credits
A hairline rule, then the title (22px) with its mono number trailing on the baseline, "View plate" with an arrow at the far right, a soft-ink description, and the quiet install command.

### Code Figure
A Hairline-bordered figure on translucent Warm Edge; a mono-label caption bar with Copy at the right, then 13px code with 20px padding, wrapping instead of scrolling.

### Navigation
- **Sticky bar:** 72px, Sheet background, Hairline bottom rule. Mark plus "hover-ui" at left; plate tokens ("01 RING") in the mono label, Soft Ink, turning Ink on hover; the current plate is Ink and underlined 6px below; a secondary Install button at right.
- **Plate-to-plate:** 44px circular Ink-outlined arrow buttons that fill Ink on hover in 0.1s, beside the neighbor's title and trailing number.

### Seal Stamp
A 128px (144px from `sm`) Periwinkle Seal disc with a mono text ring turning once every 25s linear and a centered out-arrow. It lifts 4px over 0.6s on the annual ease when hovered. Under reduced motion it stands still. One per view, hung off a plate's corner.

### Cursors (the product)
Fixed, `aria-hidden`, non-interactive overlays drawn in `currentColor` (Ink by default) from circles and 1px strokes: Ring, Trail, Blend, Label, Register. They appear over 150ms only on a fine hovering pointer and snap instead of easing under reduced motion.

On this site every cursor is mounted with `cursorTone` (`text-white mix-blend-difference`, in `app/plates.tsx`) so it stays visible over Ink-filled hover states, the install command and the Ink tile. Label is the exception: its pill carries words, and an inverted pill lets the text beneath show through. Label stays an opaque Ink pill with a 1px hairline in its own contrast color.

## Do's and Don'ts

### Do:
- **Do** set every control in Host Grotesk 15px sentence case, filled Ink for the single primary and 1px Ink outline for everything else.
- **Do** trail plate numbers after titles on the baseline in the 11px mono label.
- **Do** frame every live plate with registration marks at all four corners and give it a resting specimen that fades while its cursor is active.
- **Do** mirror the cursor hook's media gate with `cursorless` copy so every plate stays true on touch.
- **Do** divide sections with a single 1px Hairline rule and generous space.
- **Do** turn ligatures off in code.
- **Do** mount site cursors with `cursorTone` so they read over paper and Ink alike, except Label, which stays opaque.

### Don't:
- **Don't** put an eyebrow or kicker above any heading.
- **Don't** set controls in mono or uppercase; mono is for credits, data, code and the bar's plate tokens.
- **Don't** place more than one filled Ink primary in a first viewport.
- **Don't** add a dark theme, shadows, or rounded rectangles.
- **Don't** use pure black for text or fills, or any accent beyond the periwinkle seal.
- **Don't** lay plates out as a uniform grid of equal cards.
- **Don't** animate anything on its own except the seal's ring.
