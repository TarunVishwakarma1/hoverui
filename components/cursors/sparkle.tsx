"use client";

import { type CSSProperties, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 24;
const COLORS = ["#ffb800", "#ff5fa2", "#22b8e6", "#9b5cff"];
const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";
const jitter = (r: number) => (Math.random() - 0.5) * 2 * r;

/** A four-point star; exported so a page can draw it at rest. */
export function SparkleArt({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d={STAR} fill="currentColor" />
    </svg>
  );
}

/** Stars twinkle out along your path; over anything clickable they keep coming, and a click throws a ring of them. */
export function SparkleCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    stars: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, size: 1 })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    t: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const spawn = (x: number, y: number, vx: number, vy: number, size: number) => {
      Object.assign(st.stars[st.next], { x, y, vx, vy, size, life: 0 });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly] = [p.x, p.y];
      for (const b of st.stars) b.life = 1;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    st.t += p.dt;
    if (!p.reduced) {
      for (; st.travel > 18; st.travel -= 18) spawn(p.x + jitter(8), p.y + jitter(8), 0, 0, 0.6 + Math.random() * 0.6);
      if (p.hover && Math.random() < p.dt * 14) spawn(p.x + jitter(20), p.y + jitter(20), 0, 0, 1 + Math.random() * 0.6);
      if (p.down && !st.wasDown)
        for (let i = 0; i < 8; i++) spawn(p.x, p.y, Math.cos((i / 8) * Math.PI * 2) * 200, Math.sin((i / 8) * Math.PI * 2) * 200, 1.2);
    }
    st.wasDown = p.down;

    const els = el.children as HTMLCollectionOf<HTMLElement>;
    st.stars.forEach((b, i) => {
      if (b.life < 1) {
        b.life = Math.min(b.life + p.dt / 0.8, 1);
        b.x += b.vx * p.dt;
        b.y += b.vy * p.dt;
        b.vx *= 1 - Math.min(p.dt * 5, 1);
        b.vy *= 1 - Math.min(p.dt * 5, 1);
      }
      // Each star swells in and out of nothing while it turns.
      els[i].style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.life * 180}deg) scale(${Math.sin(b.life * Math.PI) * b.size})`;
    });
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.reduced ? 0 : st.t * 90}deg) scale(${p.down ? 0.7 : p.hover ? 1.5 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <SparkleArt key={i} className="absolute size-3 -translate-1/2" style={{ color: COLORS[i % COLORS.length] }} />
      ))}
      <SparkleArt className="absolute size-3.5 -translate-1/2" />
    </div>
  );
}
