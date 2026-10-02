"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A goldfish facing right, tail marked `data-tail`; exported so a page can draw it at rest. */
export function FishArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 20" className={`overflow-visible ${className}`} aria-hidden>
      <path data-tail d="M9 10 1 3l2 7-2 7Z" fill="#ff8a3d" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" style={{ transformOrigin: "9px 10px" }} />
      <path d="M7 10c6-8 20-9 28 0-8 9-22 8-28 0Z" fill="#ff8a3d" stroke="currentColor" strokeWidth="1.2" />
      <path d="M17 4.2c2-2.6 5.5-2.8 7.5-1" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M25 6c-1.6 2.6-1.6 5.4 0 8" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="29" cy="8.3" r="1.5" fill="#111" />
    </svg>
  );
}

/** A goldfish that swims after the pointer and waits just short of it; over anything clickable it comes in to nibble, and a click scares it off for a moment. */
export function FishCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, heading: 0, wag: 0, flee: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.dt) [st.x, st.y, st.vx, st.vy] = [p.x - 40, p.y, 0, 0];
    if (p.down && !st.wasDown) st.flee = 0.5;
    st.wasDown = p.down;
    st.flee = Math.max(st.flee - p.dt, 0);
    const [dx, dy] = [p.x - st.x, p.y - st.y];
    const d = Math.hypot(dx, dy) || 1;
    const stop = p.hover ? 12 : 40;
    // Swim toward the pointer, easing off near it; scared, swim straight away.
    const want = st.flee ? 520 : d > stop ? Math.min((d - stop) * 4, 420) : 0;
    const dir = st.flee ? -1 : 1;
    st.vx += ((dx / d) * want * dir - st.vx) * p.ease(st.flee ? 10 : 4);
    st.vy += ((dy / d) * want * dir - st.vy) * p.ease(st.flee ? 10 : 4);
    st.x += st.vx * p.dt;
    st.y += st.vy * p.dt;
    const speed = Math.hypot(st.vx, st.vy);
    if (speed > 15) st.heading += Math.atan2(Math.sin(Math.atan2(st.vy, st.vx) - st.heading), Math.cos(Math.atan2(st.vy, st.vx) - st.heading)) * p.ease(8);
    // The tail beats faster the harder it swims, and idles gently at rest.
    if (!p.reduced) st.wag += p.dt * (5 + speed * 0.05);
    const [fish, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const flip = Math.cos(st.heading) < 0 ? -1 : 1;
    fish.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.heading}rad) scale(1, ${flip})`;
    (fish.querySelector("[data-tail]") as SVGElement).style.transform = `rotate(${Math.sin(st.wag) * 22}deg)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <FishArt className="absolute h-5 w-10 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
