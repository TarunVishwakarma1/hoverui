"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** How many glyphs the pointer can have spilled at once. */
const SPILL = 10;

/** What a control calls itself: its data-cursor-label, aria-label or title, else its text, kept short. */
function name(el: Element) {
  const words = (el.getAttribute("data-cursor-label") || el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().replace(/\s+/g, " ");
  return words.length > 32 ? `${words.slice(0, 31)}…` : words;
}

/**
 * A terminal's block cursor that spills glyphs of code as it moves and blinks when you stop. Over anything clickable a
 * tag opens beside it and the control's name decodes out of scrambled glyphs, letter by letter, the way a computer
 * cracks a password in a film; a click scrambles it and decodes it again.
 */
export function CipherCursor({
  className = "",
  glyphs = "!<>-_/[]=+*^?#01",
}: {
  className?: string;
  /** The characters a name scrambles through before it decodes. */
  glyphs?: string;
}) {
  const s = useRef({
    hover: null as Element | null,
    text: "",
    locks: [] as number[],
    t: 0,
    shown: "",
    roll: 0,
    x: 0,
    y: 0,
    idle: 0,
    clock: 0,
    since: 0,
    spill: Array.from({ length: SPILL }, () => ({ x: 0, y: 0, age: Infinity, roll: 0 })),
    next: 0,
    lx: 0,
    ly: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [spill, tag, block] = el.children as HTMLCollectionOf<HTMLElement>;
    const pick = () => glyphs[Math.floor(Math.random() * glyphs.length)] ?? "#";
    // Each letter locks in turn, after a few scrambles of its own; under reduced motion, all at once.
    const decode = (text: string) => {
      st.text = text;
      st.t = 0;
      st.roll = 0;
      st.locks = [...text].map((_, i) => (p.reduced ? 0 : 0.12 + i * 0.03 + Math.random() * 0.14));
    };
    if (!p.dt) [st.x, st.y, st.lx, st.ly] = [p.x, p.y, p.x, p.y];
    st.clock += p.dt;
    const click = p.down && !st.wasDown;
    st.wasDown = p.down;
    // A new control: decode its name. A click on it: scramble and decode again.
    if (p.hover !== st.hover) {
      st.hover = p.hover;
      if (p.hover) decode(name(p.hover));
      tag.toggleAttribute("data-open", !!p.hover);
    } else if (click && st.hover) decode(st.text);
    if (st.hover) {
      st.t += p.dt;
      st.roll -= p.dt;
      if (st.roll <= 0) {
        // Locked letters as they are; the rest reshuffled a dozen or so times a second.
        st.roll = 0.07;
        const shown = [...st.text].map((ch, i) => (st.t >= st.locks[i] || ch === " " ? ch : pick())).join("");
        if (shown !== st.shown) tag.querySelector("[data-text]")!.textContent = st.shown = shown;
      }
    }

    // Moving spills a glyph every so often, and a click a handful; each scrambles as it drifts up and fades.
    const moved = Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    st.idle = moved ? 0 : st.idle + p.dt;
    const drop = (x: number, y: number) => {
      Object.assign(st.spill[st.next], { x, y, age: 0, roll: 0 });
      st.next = (st.next + 1) % SPILL;
    };
    if (!p.reduced) {
      st.since += moved;
      if (st.since > 26) {
        st.since = 0;
        drop(p.x, p.y);
      }
      if (click) for (let i = 0; i < 5; i++) drop(p.x + (Math.random() - 0.5) * 44, p.y + (Math.random() - 0.5) * 30);
    }
    st.spill.forEach((glyph, i) => {
      const node = spill.children[i] as HTMLElement;
      glyph.age += p.dt;
      if (glyph.age > 0.5) {
        node.style.opacity = "0";
        return;
      }
      glyph.roll -= p.dt;
      if (glyph.roll <= 0) {
        glyph.roll = 0.06;
        node.textContent = pick();
      }
      node.style.transform = `translate(${glyph.x}px, ${glyph.y - glyph.age * 16}px)`;
      node.style.opacity = String(1 - glyph.age / 0.5);
    });

    // The tag trails a little below and to the right of the pointer; the block blinks once you stop.
    st.x += (p.x - st.x) * p.ease(22);
    st.y += (p.y - st.y) * p.ease(22);
    tag.style.transform = `translate(${st.x + 12}px, ${st.y + 14}px)`;
    block.style.transform = `translate(${p.x}px, ${p.y}px)`;
    block.style.opacity = !p.reduced && st.idle > 0.6 && Math.floor(st.clock * 1.9) % 2 ? "0.2" : "1";
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="font-mono text-[11px] leading-none">
        {Array.from({ length: SPILL }, (_, i) => (
          <span key={i} className="absolute top-0 left-0 -translate-1/2 opacity-0" />
        ))}
      </div>
      <div className="group absolute top-0 left-0">
        {/* The hairline uses the text's contrast color, so the tag keeps its edge over its own color. */}
        <div
          className="flex origin-top-left scale-90 items-center gap-1.5 rounded-sm bg-current px-2 py-1 font-mono text-[11px] leading-4 whitespace-pre opacity-0 transition-[scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity group-data-open:scale-100 group-data-open:opacity-100"
          style={{ boxShadow: "0 0 0 1px oklch(from currentColor calc((0.7 - l) * 1000) 0 0 / 0.35)" }}
        >
          {/* Black or white, whichever reads on currentColor; plain white where relative colors are unsupported. */}
          <span className="text-white opacity-60" style={{ color: "oklch(from currentColor calc((0.7 - l) * 1000) 0 0)" }}>
            ›
          </span>
          <span data-text className="text-white" style={{ color: "oklch(from currentColor calc((0.7 - l) * 1000) 0 0)" }} />
        </div>
      </div>
      <div className="absolute h-3 w-[7px] -translate-1/2 bg-current" />
    </div>
  );
}
