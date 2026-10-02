"use client";

import { type CSSProperties, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 36;
const LIFE = 2.6;
const jitter = (r: number) => (Math.random() - 0.5) * 2 * r;

/** A six-armed snowflake in `currentColor`; exported so a page can draw it at rest. */
export function SnowflakeArt({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 12 12" className={className} style={style} aria-hidden>
      <path d="M6 0v12M.8 3l10.4 6M.8 9l10.4-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Snowflakes drift down off your path, swaying as they go; over anything clickable a flurry gathers, and a click blows out a gust. */
export function SnowCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    flakes: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, vx: 0, vy: 0, sway: 0, size: 1, age: Infinity })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    t: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    const shed = (x: number, y: number, vx: number, size: number) => {
      Object.assign(st.flakes[st.next], { x, y, vx, vy: 30 + Math.random() * 25, sway: Math.random() * 6, size, age: 0 });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const f of st.flakes) f.age = Infinity;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    st.t += p.dt;
    if (!p.reduced) {
      for (; st.travel > 12; st.travel -= 12) shed(p.x + jitter(6), p.y + jitter(6), 0, 0.5 + Math.random() * 0.6);
      if (p.hover && Math.random() < p.dt * 14) shed(p.x + jitter(22), p.y + jitter(14), 0, 0.6 + Math.random() * 0.6);
      if (p.down && !st.wasDown) for (let i = 0; i < 12; i++) shed(p.x, p.y, jitter(260), 0.6 + Math.random() * 0.5);
    }
    st.wasDown = p.down;
    st.flakes.forEach((f, i) => {
      f.age += p.dt;
      f.vx *= 1 - Math.min(p.dt * 3, 1);
      f.x += f.vx * p.dt;
      f.y += f.vy * p.dt;
      const x = f.x + Math.sin(f.age * 2 + f.sway) * 8;
      els[i].style.transform = `translate(${x}px, ${f.y}px) rotate(${f.age * 60}deg) scale(${f.size})`;
      els[i].style.opacity = String(Math.max(0, Math.min(1, (LIFE - f.age) / 0.8)));
    });
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.reduced ? 0 : st.t * 40}deg) scale(${p.down ? 0.7 : p.hover ? 1.5 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <SnowflakeArt key={i} className="absolute size-2.5 -translate-1/2" style={{ opacity: 0 }} />
      ))}
      <SnowflakeArt className="absolute size-3.5 -translate-1/2" />
    </div>
  );
}
