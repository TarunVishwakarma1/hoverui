"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const ROOTS = [-7, -2.5, 2.5, 7];
const SEGMENTS = 7;
const LINK = 5;

/** The jellyfish's bell; exported so a page can draw it at rest. */
export function JellyfishArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 14" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M2 12C2 4 7 0 12 0s10 4 10 12c-3-1.5-6 1-10-.5C8 13 5 10.5 2 12Z" fill="rgb(192 132 252 / 0.55)" stroke="#a855f7" strokeWidth="1" />
      <g fill="#f5d0fe">
        <circle cx="9" cy="5" r="1" />
        <circle cx="14.5" cy="4" r="0.8" />
        <circle cx="12" cy="8" r="0.9" />
      </g>
    </svg>
  );
}

/** A jellyfish drifting after the pointer in pulses, tentacles trailing behind; it glows over anything clickable and clenches on press. */
export function JellyfishCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    phase: 0,
    glow: 0,
    arms: ROOTS.map(() => Array.from({ length: SEGMENTS }, () => ({ x: 0, y: 0 }))),
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.reduced) st.phase += p.dt * (p.hover ? 9 : 5);
    // Each beat of the bell is a push: it moves on the contraction, coasts between.
    const push = Math.max(Math.sin(st.phase), 0);
    st.x += (p.x - st.x) * p.ease(2 + 5 * push);
    st.y += (p.y - 26 - st.y) * p.ease(2 + 5 * push);
    st.glow += ((p.hover ? 1 : 0) - st.glow) * p.ease(8);
    const beat = p.reduced ? 0 : Math.sin(st.phase);
    const [sx, sy] = p.down ? [0.8, 1.15] : [1 + beat * 0.1, 1 - beat * 0.08];
    const [tentacles, bell, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    bell.style.transform = `translate(${st.x}px, ${st.y}px) scale(${sx}, ${sy})`;
    bell.style.filter = `drop-shadow(0 0 ${st.glow * 8}px rgb(232 121 249 / ${st.glow}))`;
    // Tentacles: chains that hang from under the bell, each link dragged after the one above it.
    st.arms.forEach((arm, i) => {
      let [ax, ay] = [st.x + ROOTS[i] * sx, st.y + 6];
      let d = "";
      arm.forEach((pt, j) => {
        if (!p.dt) [pt.x, pt.y] = [ax, ay + LINK];
        pt.y += 30 * p.dt;
        const [dx, dy] = [pt.x - ax, pt.y - ay];
        const len = Math.hypot(dx, dy) || 1;
        [pt.x, pt.y] = [ax + (dx / len) * LINK, ay + (dy / len) * LINK];
        d += `${j ? "L" : "M"}${ax} ${ay}`;
        [ax, ay] = [pt.x, pt.y];
      });
      tentacles.children[i].setAttribute("d", `${d}L${ax} ${ay}`);
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible" fill="none" stroke="#c084fc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        {ROOTS.map((r) => (
          <path key={r} />
        ))}
      </svg>
      <JellyfishArt className="absolute h-[18px] w-8 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
