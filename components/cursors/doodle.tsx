"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A hand-drawn loop: a little more than one turn of an ellipse, its radius creeping outward so the ends overlap, every point nudged by `seed`. */
function doodle(cx: number, cy: number, rx: number, ry: number, seed: number) {
  let d = "";
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2.15 - 0.5;
    const j = 0.94 + (0.12 * i) / 48 + Math.sin(seed + i * 1.1) * 0.04;
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rx * j).toFixed(1)} ${(cy + Math.sin(a) * ry * j).toFixed(1)}`;
  }
  return d;
}

/** One loop around a `rx` by `ry` ellipse, at rest; exported so a page can draw it. */
export function DoodleArt({ rx, ry, className = "" }: { rx: number; ry: number; className?: string }) {
  const [w, h] = [rx * 2.4, ry * 2.4];
  return (
    <svg viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <path d={doodle(0, 0, rx, ry, 3)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A pen loop around the pointer whose line "boils" like hand-drawn animation; over anything clickable it scribbles a circle around the control. */
export function DoodleCursor({ className = "" }: { className?: string }) {
  const s = useRef({ cx: 0, cy: 0, rx: 14, ry: 14, seed: 0, t: 0, next: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const box = p.hover?.getBoundingClientRect();
    // Around a control: an ellipse wide enough to clear its corners.
    const [tx, ty, trx, tr] = box
      ? [box.left + box.width / 2, box.top + box.height / 2, box.width * 0.62 + 6, box.height * 0.68 + 6]
      : [p.x, p.y, 14, 14];
    const k = p.ease(14);
    const press = p.down ? 0.7 : 1;
    st.cx += (tx - st.cx) * k;
    st.cy += (ty - st.cy) * k;
    st.rx += (trx * press - st.rx) * k;
    st.ry += (tr * press - st.ry) * k;
    // A new wobble about eight times a second: the "boiling line" of drawn animation.
    st.t += p.dt;
    if (!p.reduced && st.t > st.next) [st.seed, st.next] = [Math.random() * 100, st.t + 0.12];
    const [svg, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    svg.firstElementChild!.setAttribute("d", doodle(st.cx, st.cy, st.rx, st.ry, st.seed));
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
