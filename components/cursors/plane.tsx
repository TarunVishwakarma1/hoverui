"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const TRAIL = 18;

/** A paper plane, nose to the upper right; exported so a page can draw it at rest. */
export function PlaneArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
    </svg>
  );
}

/** A paper plane gliding after the pointer and banking into its turns, a dashed trail behind; it circles anything clickable, and a click throws it. */
export function PlaneCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, heading: 0, t: 0, boost: 0, trail: [] as number[][], wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) [st.x, st.y, st.vx, st.vy, st.trail] = [p.x - 30, p.y + 20, 0, 0, []];
    if (p.down && !st.wasDown) st.boost = 0.35;
    st.wasDown = p.down;
    st.boost = Math.max(st.boost - p.dt, 0);
    // Over a control it circles; otherwise it glides in and hangs just short of the pointer.
    const circle = p.hover && !p.reduced;
    const [tx, ty] = circle ? [p.x + Math.cos(st.t * 3) * 34, p.y + Math.sin(st.t * 3) * 34] : [p.x, p.y];
    const [dx, dy] = [tx - st.x, ty - st.y];
    const d = Math.hypot(dx, dy) || 1;
    let [wx, wy] = [0, 0];
    if (st.boost) [wx, wy] = [Math.cos(st.heading) * 800, Math.sin(st.heading) * 800];
    else if (circle || d > 20) {
      const speed = Math.min((circle ? d : d - 20) * 7, 700);
      [wx, wy] = [(dx / d) * speed, (dy / d) * speed];
    }
    st.vx += (wx - st.vx) * p.ease(st.boost ? 12 : 6);
    st.vy += (wy - st.vy) * p.ease(st.boost ? 12 : 6);
    st.x += st.vx * p.dt;
    st.y += st.vy * p.dt;
    if (p.reduced) [st.x, st.y] = [p.x, p.y];
    if (Math.hypot(st.vx, st.vy) > 20) {
      const to = Math.atan2(st.vy, st.vx);
      st.heading += Math.atan2(Math.sin(to - st.heading), Math.cos(to - st.heading)) * p.ease(10);
    }
    st.trail.unshift([st.x, st.y]);
    st.trail.length = Math.min(st.trail.length, p.reduced ? 1 : TRAIL);
    const [trail, plane, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    trail.firstElementChild!.setAttribute("points", st.trail.join(" "));
    // The art's nose points 45° up from level.
    plane.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.heading + Math.PI / 4}rad)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        <polyline fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.45" />
      </svg>
      <PlaneArt className="absolute size-6 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
