"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

// 1-bit pointers, X for black and o for white, drawn at 2x.
const ARROW = [
  "X          ",
  "XX         ",
  "XoX        ",
  "XooX       ",
  "XoooX      ",
  "XooooX     ",
  "XoooooX    ",
  "XooooooX   ",
  "XoooooooX  ",
  "XooooooooX ",
  "XoooooXXXXX",
  "XooXooX    ",
  "XoX XooX   ",
  "XX  XooX   ",
  "X    XooX  ",
  "     XooX  ",
  "      XX   ",
];
const HAND = [
  "     XX         ",
  "    XooX        ",
  "    XooX        ",
  "    XooX        ",
  "    XooXXX      ",
  "    XooXooXXX   ",
  "    XooXooXooXX ",
  " XX XooXooXooXoX",
  "XooXXooooooooXoX",
  "XoooXooooooooooX",
  " XoooooooooooooX",
  "  XooooooooooooX",
  "  XooooooooooooX",
  "   XooooooooooX ",
  "    XooooooooX  ",
  "    XooooooooX  ",
  "    XXXXXXXXXX  ",
];
const WAIT = [
  "XXXXXXXXXXX",
  " XoooooooX ",
  " XoooooooX ",
  "  XoXXXoX  ",
  "   XoXoX   ",
  "    XoX    ",
  "    XoX    ",
  "   XoooX   ",
  "  XoooooX  ",
  " XoooXoooX ",
  " XooXXXooX ",
  " XoXXXXXoX ",
  "XXXXXXXXXXX",
];
const pixels = (rows: string[], ch: string) => rows.flatMap((row, y) => [...row].map((c, x) => (c === ch ? `M${x} ${y}h1v1h-1z` : ""))).join("");

/** One of the 1-bit pointers at 2x, positioned so its hotspot (x, y in pixels) sits on its parent's origin. */
function Bitmap({ rows, x, y }: { rows: string[]; x: number; y: number }) {
  const [w, h] = [rows[0].length, rows.length];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w * 2} height={h * 2} shapeRendering="crispEdges" className="absolute" style={{ left: -x * 2, top: -y * 2 }}>
      <path d={pixels(rows, "o")} fill="#fff" />
      <path d={pixels(rows, "X")} fill="#111" />
    </svg>
  );
}

/** Each pointer with its hotspot, in the order the cursor switches between them. */
const SPRITES = { arrow: [ARROW, 0, 0], hand: [HAND, 5.5, 0], wait: [WAIT, 5.5, 6.5] } as const;

/** One of the pointers, its hotspot on this element's top left (give it a position); exported so a page can draw them at rest. */
export function ClassicArt({ state = "arrow", className = "" }: { state?: keyof typeof SPRITES; className?: string }) {
  const [rows, x, y] = SPRITES[state];
  return (
    <div className={className}>
      <Bitmap rows={rows} x={x} y={y} />
    </div>
  );
}

/** The 1-bit desktop pointer, pixel for pixel: the arrow, a pointing hand over anything clickable, and the hourglass while you press. */
export function ClassicCursor({ className = "" }: { className?: string }) {
  const s = useRef({ mode: -1, t: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const mode = p.down ? 2 : p.hover ? 1 : 0;
    const pointer = el.firstElementChild as HTMLElement;
    const [, , wait] = pointer.children as HTMLCollectionOf<SVGElement>;
    if (mode !== st.mode) {
      [...pointer.children].forEach((c, i) => ((c as SVGElement).style.display = i === mode ? "" : "none"));
      st.mode = mode;
      st.t = 0;
    }
    pointer.style.transform = `translate(${p.x}px, ${p.y}px)`;
    // The hourglass turns over every two-thirds of a second while it waits.
    wait.style.rotate = !p.reduced && Math.floor(st.t * 1.5) % 2 ? "180deg" : "";
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0">
        {Object.values(SPRITES).map(([rows, x, y]) => (
          <Bitmap key={x + y} rows={rows} x={x} y={y} />
        ))}
      </div>
    </div>
  );
}
