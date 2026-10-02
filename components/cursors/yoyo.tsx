"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The yo-yo, face on, its markings in a `data-spin` group; exported so a page can draw it at rest. */
export function YoyoArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#3d7bff" stroke="currentColor" strokeWidth="1.2" />
      <g data-spin style={{ transformOrigin: "12px 12px" }} stroke="#fff" strokeLinecap="round">
        <circle cx="12" cy="12" r="6.5" fill="none" strokeWidth="0.8" opacity="0.6" />
        <path d="M12 2.5v3M12 18.5v3" strokeWidth="1.4" />
      </g>
      <circle cx="12" cy="12" r="2" fill="#fff" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/** A yo-yo swinging on its string below the pointer; a press throws it down to sleep, spinning, and letting go reels it back. Over anything clickable it climbs up close. */
export function YoyoCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, len: 48, spin: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const goal = p.down ? 120 : p.hover ? 24 : 48;
    const before = st.len;
    st.len += (goal - st.len) * p.ease(p.down ? 9 : 6);
    if (!p.dt || p.reduced) [st.x, st.y, st.vx, st.vy] = [p.x, p.y + st.len, 0, 0];
    else {
      // A pendulum: gravity, a little air drag, and a string held taut at its length.
      st.vy += 1400 * p.dt;
      st.vx *= 1 - Math.min(p.dt * 1.5, 1);
      st.vy *= 1 - Math.min(p.dt * 1.5, 1);
      st.x += st.vx * p.dt;
      st.y += st.vy * p.dt;
      const [dx, dy] = [st.x - p.x, st.y - p.y];
      const d = Math.hypot(dx, dy) || 1;
      const [nx, ny] = [dx / d, dy / d];
      [st.x, st.y] = [p.x + nx * st.len, p.y + ny * st.len];
      const out = st.vx * nx + st.vy * ny;
      [st.vx, st.vy] = [st.vx - out * nx, st.vy - out * ny];
      // Unwinding spins it; held at the bottom, it sleeps, still spinning.
      st.spin += (st.len - before) * 0.15 + (p.down ? p.dt * 20 : 0);
    }
    const [string, yoyo] = el.children as HTMLCollectionOf<HTMLElement>;
    const line = string.firstElementChild!;
    line.setAttribute("x1", String(p.x));
    line.setAttribute("y1", String(p.y));
    line.setAttribute("x2", String(st.x));
    line.setAttribute("y2", String(st.y));
    yoyo.style.transform = `translate(${st.x}px, ${st.y}px)`;
    (yoyo.querySelector("[data-spin]") as SVGElement).style.transform = `rotate(${st.spin}rad)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 size-px overflow-visible">
        <line stroke="currentColor" strokeWidth="1" />
      </svg>
      <YoyoArt className="absolute size-6 -translate-1/2" />
    </div>
  );
}
