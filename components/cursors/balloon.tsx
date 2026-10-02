"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The balloon, knot at the bottom centre; exported so a page can draw it at rest. */
export function BalloonArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden>
      <path d="M12 1c6.6 0 10 5.2 10 11 0 6.5-5.5 12-10 13C7.5 24 2 18.5 2 12 2 6.2 5.4 1 12 1Z" fill="#ff4d5e" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 25h3l-.7 2h-1.6Z" fill="#ff4d5e" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <ellipse cx="8" cy="8" rx="2" ry="3.5" fill="#fff" opacity="0.55" transform="rotate(-20 8 8)" />
    </svg>
  );
}

const LENGTH = 64;

/** A balloon on a string, tugging up from the pointer and swaying as you move; it puffs up over anything clickable, and a click pops it (it comes back). */
export function BalloonCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, size: 1, popped: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.dt || p.reduced) [st.x, st.y, st.vx, st.vy] = [p.x + 8, p.y - LENGTH, 0, 0];
    else {
      // Buoyancy up, air drag, and a string it cannot stretch.
      st.vy -= 900 * p.dt;
      st.vx *= 1 - Math.min(p.dt * 3, 1);
      st.vy *= 1 - Math.min(p.dt * 3, 1);
      st.x += st.vx * p.dt;
      st.y += st.vy * p.dt;
      const [dx, dy] = [st.x - p.x, st.y - p.y];
      const d = Math.hypot(dx, dy) || 1;
      if (d > LENGTH) {
        const [nx, ny] = [dx / d, dy / d];
        [st.x, st.y] = [p.x + nx * LENGTH, p.y + ny * LENGTH];
        const out = st.vx * nx + st.vy * ny;
        if (out > 0) [st.vx, st.vy] = [st.vx - out * nx, st.vy - out * ny];
      }
    }
    // A click pops it; it regrows half a second after you let go.
    if (p.down && !st.wasDown && !st.popped) [st.popped, st.size] = [0.001, 0];
    st.wasDown = p.down;
    if (st.popped) st.popped += p.dt;
    if (st.popped > 0.5 && !p.down) st.popped = 0;
    if (!st.popped) st.size += ((p.hover ? 1.25 : 1) - st.size) * p.ease(st.size < 0.9 ? 6 : 12);
    const [string, balloon, burst] = el.children as HTMLCollectionOf<HTMLElement>;
    const tilt = Math.atan2(st.x - p.x, p.y - st.y);
    string.style.opacity = st.size < 0.05 ? "0" : "1";
    string.firstElementChild!.setAttribute("d", `M${p.x} ${p.y}Q${(p.x + st.x) / 2 - st.vx * 0.04} ${(p.y + st.y) / 2} ${st.x} ${st.y}`);
    balloon.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${tilt}rad) scale(${st.size})`;
    const age = st.popped ? st.popped / 0.25 : 1;
    burst.style.transform = `translate(${st.x}px, ${st.y - 18}px) scale(${0.5 + age})`;
    burst.style.opacity = String(Math.max(0, 1 - age));
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        <path fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {/* Zero-size wrapper on the knot: the balloon tilts and swells around it. */}
      <div className="absolute top-0 left-0">
        <BalloonArt className="absolute top-[-34px] left-[-15px] h-[35px] w-[30px]" />
      </div>
      <svg viewBox="-12 -12 24 24" className="absolute size-12 -translate-1/2 opacity-0" stroke="#ff4d5e" strokeWidth="1.5" strokeLinecap="round">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M0-7v-4" transform={`rotate(${i * 45})`} />
        ))}
      </svg>
    </div>
  );
}
