"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A pair of googly eyes that trail the pointer; the pupils slosh around whenever the eyes move, and the eyes go wide over anything clickable. */
export function GooglyCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, px: 0, py: 2, vx: 0, vy: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [ox, oy] = [st.x, st.y];
    st.x += (p.x + 18 - st.x) * p.ease(9);
    st.y += (p.y - 22 - st.y) * p.ease(9);
    if (p.dt && !p.reduced) {
      // Pupils: a damped spring with a little gravity, kicked the opposite way the eyes move.
      st.vx += (-st.px * 160 - st.vx * 7) * p.dt - (st.x - ox) * 9;
      st.vy += (-st.py * 160 - st.vy * 7 + 300) * p.dt - (st.y - oy) * 9;
      st.px += st.vx * p.dt;
      st.py += st.vy * p.dt;
      const d = Math.hypot(st.px, st.py);
      if (d > 4) [st.px, st.py] = [(st.px * 4) / d, (st.py * 4) / d];
    }
    const [eyes, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    st.size += ((p.down ? 0.85 : p.hover ? 1.4 : 1) - st.size) * p.ease(14);
    eyes.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
    for (const pupil of eyes.querySelectorAll<HTMLElement>("[data-pupil]")) pupil.style.transform = `translate(${st.px}px, ${st.py}px)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute flex -translate-1/2 gap-0.5">
        {[0, 1].map((i) => (
          <div key={i} className="relative size-4 rounded-full border border-current bg-white">
            <div data-pupil className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-[#111]" />
          </div>
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
