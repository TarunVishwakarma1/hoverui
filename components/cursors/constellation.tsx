"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 12;
const LIFE = 2.4;
const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";

/** Draws a constellation as you move: a star every few steps, joined to the last, fading out behind you. Over anything clickable the pointer's star flares; a click sets a bright one. */
export function ConstellationCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    stars: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, age: Infinity, r: 1.6 })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    t: 0,
    flare: 1,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const drop = (r: number) => {
      Object.assign(st.stars[st.next], { x: p.x, y: p.y, age: 0, r });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const b of st.stars) b.age = Infinity;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    st.t += p.dt;
    if (st.travel > 46) {
      st.travel = 0;
      drop(1.6);
    }
    if (p.down && !st.wasDown) drop(3);
    st.wasDown = p.down;

    const [lines, dots, star] = el.children as HTMLCollectionOf<SVGElement & HTMLElement>;
    const fade = (age: number) => Math.max(0, 1 - age / LIFE);
    st.stars.forEach((b, i) => {
      b.age += p.dt;
      const twinkle = p.reduced ? 1 : 0.8 + 0.2 * Math.sin(st.t * 6 + i);
      const dot = dots.children[i];
      dot.setAttribute("cx", String(b.x));
      dot.setAttribute("cy", String(b.y));
      dot.setAttribute("r", String(b.r * twinkle));
      dot.setAttribute("opacity", String(fade(b.age)));
      // Each star joins the one dropped before it, while both are still lit.
      const prev = st.stars[(i + COUNT - 1) % COUNT];
      const line = lines.children[i];
      line.setAttribute("x1", String(prev.x));
      line.setAttribute("y1", String(prev.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      line.setAttribute("opacity", String(i === st.next ? 0 : Math.min(fade(b.age), fade(prev.age)) * 0.5));
    });
    // A live line from the newest star to the pointer: the one being drawn.
    const last = st.stars[(st.next + COUNT - 1) % COUNT];
    const live = lines.children[COUNT];
    live.setAttribute("x1", String(last.x));
    live.setAttribute("y1", String(last.y));
    live.setAttribute("x2", String(p.x));
    live.setAttribute("y2", String(p.y));
    live.setAttribute("opacity", String(fade(last.age) * 0.3));
    st.flare += ((p.down ? 0.8 : p.hover ? 2 : 1) - st.flare) * p.ease(12);
    star.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.reduced ? 0 : st.t * 30}deg) scale(${st.flare})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        {Array.from({ length: COUNT + 1 }, (_, i) => (
          <line key={i} stroke="currentColor" strokeWidth="1" opacity="0" />
        ))}
      </svg>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        {Array.from({ length: COUNT }, (_, i) => (
          <circle key={i} fill="currentColor" opacity="0" />
        ))}
      </svg>
      <svg viewBox="0 0 24 24" className="absolute size-3.5 -translate-1/2">
        <path d={STAR} fill="currentColor" />
      </svg>
    </div>
  );
}
