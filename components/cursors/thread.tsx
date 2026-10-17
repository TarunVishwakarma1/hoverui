"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The most letters the thread holds. */
const MAX = 64;

/** What a control calls itself: its data-cursor-label, aria-label or title, else its text, kept short. */
function name(el: Element) {
  const words = (el.getAttribute("data-cursor-label") || el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().replace(/\s+/g, " ");
  return words.length > 32 ? `${words.slice(0, 31)}…` : words;
}

/**
 * The point `s` px round a pill centred on (`cx`, `cy`), clockwise from the top-left end of its top edge, and the way
 * the pill runs there: `half` is half its straight length and `r` its round ends' radius. With `half` 0 it is a circle.
 */
function round(cx: number, cy: number, half: number, r: number, s: number) {
  const straight = half * 2;
  const total = 2 * straight + 2 * Math.PI * r;
  s = ((s % total) + total) % total;
  if (s < straight) return { x: cx - half + s, y: cy - r, a: 0 };
  s -= straight;
  if (s < Math.PI * r) return { x: cx + half + r * Math.sin(s / r), y: cy - r * Math.cos(s / r), a: s / r };
  s -= Math.PI * r;
  if (s < straight) return { x: cx + half - s, y: cy + r, a: Math.PI };
  s -= straight;
  return { x: cx - half - r * Math.sin(s / r), y: cy + r * Math.cos(s / r), a: Math.PI + s / r };
}

/**
 * Your own words on a thread. While the pointer rests they wind round it in a slowly turning ring; move, and they
 * unspool along your path, reading the way you go; over anything clickable they wrap the control in a ring that spells
 * its name. A click scatters the letters, and they find their places again.
 */
export function ThreadCursor({
  className = "",
  text = "follow the thread · ",
  size = 12,
}: {
  className?: string;
  /** The words on the thread; over a control they give way to its name. */
  text?: string;
  /** The letters' size, in px. */
  size?: number;
}) {
  const s = useRef({
    letters: Array.from({ length: MAX }, () => ({ x: 0, y: 0, a: 0, vx: 0, vy: 0, va: 0, ch: "" })),
    widths: new Map<string, number>(),
    measure: null as CanvasRenderingContext2D | null,
    turn: 0,
    heading: 0,
    still: 1,
    loose: 0,
    lx: 0,
    ly: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [line, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    if (!p.dt) {
      // Measured in the letters' own font, so they sit as close as they would in a word.
      const font = getComputedStyle(line);
      st.measure ??= document.createElement("canvas").getContext("2d");
      if (st.measure) st.measure.font = `${font.fontWeight} ${size}px ${font.fontFamily}`;
      st.widths.clear();
      [st.lx, st.ly, st.loose] = [p.x, p.y, 0];
      for (const letter of st.letters) Object.assign(letter, { x: p.x, y: p.y, a: 0 });
    }
    const width = (ch: string) => {
      let w = st.widths.get(ch);
      if (w === undefined) st.widths.set(ch, (w = (st.measure?.measureText(ch).width ?? size * 0.55) + size * 0.05));
      return w;
    };

    const moved = Math.hypot(p.x - st.lx, p.y - st.ly);
    if (moved > 0.5) st.heading = Math.atan2(p.y - st.ly, p.x - st.lx);
    [st.lx, st.ly] = [p.x, p.y];
    st.still = moved > 0.5 ? 0 : st.still + p.dt;
    if (p.down && !st.wasDown && !p.reduced) {
      // A click: every letter flies off, spinning, and falls a moment before it finds its place again.
      st.loose = 0.45;
      for (const letter of st.letters) {
        const out = Math.atan2(letter.y - p.y, letter.x - p.x) + (Math.random() - 0.5);
        const v = 160 + Math.random() * 220;
        Object.assign(letter, { vx: Math.cos(out) * v, vy: Math.sin(out) * v - 120, va: (Math.random() - 0.5) * 16 });
      }
    }
    st.wasDown = p.down;
    if (!p.reduced) st.turn += p.dt * 18;

    // Where each letter belongs: in a ring round the control or the resting pointer, or strung behind it as it moves.
    const box = p.hover?.getBoundingClientRect();
    const ringed = p.reduced || !!box || st.still > 0.25;
    let words = text;
    const targets: { x: number; y: number; a: number }[] = [];
    if (ringed) {
      // Round a control, its name as many times as fit; round the pointer, your words once, in a ring just their size.
      const unit = box ? `${name(p.hover!)} · ` : text;
      const unitWidth = [...unit].reduce((sum, ch) => sum + width(ch), 0) || 1;
      const pad = size * 1.1;
      const r = box ? box.height / 2 + pad : Math.max(size * 1.5, (unitWidth * 1.15) / (2 * Math.PI));
      const half = box ? Math.max(0, box.width / 2 + pad - r) : 0;
      const around = 4 * half + 2 * Math.PI * r;
      words = unit.repeat(Math.max(1, Math.min(Math.round(around / unitWidth), Math.floor(MAX / Math.max(unit.length, 1)))));
      const spacing = around / ([...words].reduce((sum, ch) => sum + width(ch), 0) || 1);
      const [cx, cy] = box ? [box.left + box.width / 2, box.top + box.height / 2] : [p.x, p.y];
      let at = st.turn;
      for (const ch of [...words].slice(0, MAX)) {
        const w = width(ch) * spacing;
        targets.push(round(cx, cy, half, r, at + w / 2));
        at += w;
      }
    } else {
      // Strung behind the pointer like a thread: each letter held its own width behind the one after it, so the words
      // end at the pointer and read the way you are going. Turn back and the thread is pushed along, never folded.
      const chars = [...words].slice(0, MAX);
      let [lx, ly, lw] = [p.x, p.y, size * 1.6];
      for (let i = chars.length - 1; i >= 0; i--) {
        const letter = st.letters[i];
        const w = width(chars[i]);
        const want = (lw + w) / 2;
        let [dx, dy] = [letter.x - lx, letter.y - ly];
        let d = Math.hypot(dx, dy);
        if (d < 0.01) [dx, dy, d] = [-Math.cos(st.heading), -Math.sin(st.heading), 1];
        const [x, y] = [lx + (dx / d) * want, ly + (dy / d) * want];
        targets[i] = { x, y, a: Math.atan2(ly - y, lx - x) };
        [lx, ly, lw] = [x, y, w];
      }
    }

    st.loose = Math.max(0, st.loose - p.dt);
    const chars = [...words];
    st.letters.forEach((letter, i) => {
      const node = line.children[i] as HTMLElement;
      const target = targets[i];
      if (!target) {
        node.style.opacity = "0";
        [letter.x, letter.y] = [p.x, p.y];
        return;
      }
      if (letter.ch !== chars[i]) node.textContent = letter.ch = chars[i];
      if (st.loose) {
        letter.vy += 900 * p.dt;
        letter.x += letter.vx * p.dt;
        letter.y += letter.vy * p.dt;
        letter.a += letter.va * p.dt;
      } else {
        // Held nearly taut on the thread, gathering more softly into a ring.
        const k = p.ease(ringed ? 12 : 40);
        letter.x += (target.x - letter.x) * k;
        letter.y += (target.y - letter.y) * k;
        letter.a += (Math.atan2(Math.sin(target.a - letter.a), Math.cos(target.a - letter.a)) * k);
      }
      node.style.opacity = "1";
      node.style.transform = `translate(${letter.x}px, ${letter.y}px) rotate(${letter.a}rad)`;
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="font-medium leading-none" style={{ fontSize: size }}>
        {Array.from({ length: MAX }, (_, i) => (
          <span key={i} className="absolute top-0 left-0 -translate-1/2 whitespace-pre opacity-0" />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
