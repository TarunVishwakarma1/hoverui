"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 30;

/** A cloud silhouette in `currentColor`; exported so a page can draw it at rest. */
export function CloudArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden>
      <g fill="currentColor">
        <circle cx="11" cy="15" r="7" />
        <circle cx="20" cy="10" r="8.5" />
        <circle cx="29" cy="14.5" r="7" />
        <rect x="11" y="14" width="18" height="8" />
      </g>
    </svg>
  );
}

/** A little cloud drifting over the pointer; over anything clickable it drizzles, and a press brings a downpour. */
export function CloudCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    drops: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, vy: 0, fall: Infinity })),
    next: 0,
    x: 0,
    y: 0,
    t: 0,
    size: 1,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    st.t += p.dt;
    st.x += (p.x - st.x) * p.ease(5);
    st.y += (p.y - 34 - st.y) * p.ease(5);
    st.size += ((p.hover || p.down ? 1.2 : 1) - st.size) * p.ease(8);
    const bob = p.reduced ? 0 : Math.sin(st.t * 2) * 2;
    if (!p.dt) for (const d of st.drops) d.fall = Infinity;
    // Rain per second: a drizzle over a control, a downpour on press.
    const rate = p.down ? 70 : p.hover ? 12 : 0;
    if (Math.random() < rate * p.dt) {
      Object.assign(st.drops[st.next], { x: st.x + (Math.random() - 0.5) * 26 * st.size, y: st.y + bob + 8, vy: 380 + Math.random() * 120, fall: 0 });
      st.next = (st.next + 1) % COUNT;
    }
    st.drops.forEach((d, i) => {
      const step = d.vy * p.dt;
      d.y += step;
      d.fall += step;
      els[i].style.transform = `translate(${d.x}px, ${d.y}px)`;
      // Each drop fades out over its fall of about 90px.
      els[i].style.opacity = String(Math.max(0, 1 - d.fall / 90));
    });
    els[COUNT].style.transform = `translate(${st.x}px, ${st.y + bob}px) scale(${st.size})`;
    els[COUNT + 1].style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} className="absolute h-2 w-px -translate-1/2 bg-current opacity-0" />
      ))}
      <CloudArt className="absolute h-6 w-10 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
