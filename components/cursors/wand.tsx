"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const SPARKS = 40;
const COLORS = ["#ffd23f", "#b07cff", "#ff7ad9", "#fff6d6"];
const STAR = "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)";

/** The wand, its tip on the top-left corner; exported so a page can draw it at rest. */
export function WandArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`overflow-visible ${className}`} aria-hidden>
      <path d="M1 1 37 37" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M1 1 26 26" stroke="#9a6a3a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M26 26 37 37" stroke="#4a2f17" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M27.5 25.5 25.5 27.5M31.5 29.5 29.5 31.5" stroke="#c9a54a" strokeWidth="1.2" />
      <circle cx="1" cy="1" r="1.8" fill="#fff6d6" />
    </svg>
  );
}

/** How far a path turned, in radians: a full loop drawn either way comes to about ±2π. */
function turning(path: [number, number, number][]) {
  let total = 0;
  for (let i = 2; i < path.length; i++) {
    const a = Math.atan2(path[i - 1][1] - path[i - 2][1], path[i - 1][0] - path[i - 2][0]);
    const b = Math.atan2(path[i][1] - path[i - 1][1], path[i][0] - path[i - 1][0]);
    total += Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }
  return total;
}

/**
 * A wand whose tip is the pointer, spell sparks trailing it as you move. Over anything clickable the tip lights up and
 * sparks fizz round it; a click casts a burst. Draw a circle and it casts a shield: a ring of light that swells out
 * from the middle of your loop.
 */
export function WandCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    tilt: 0,
    light: 0,
    travel: 0,
    next: 0,
    t: 0,
    cooldown: 0,
    path: [] as [number, number, number][],
    shield: { x: 0, y: 0, age: Infinity },
    sparks: Array.from({ length: SPARKS }, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: Infinity, life: 1, color: COLORS[0] })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) [st.x, st.y, st.travel, st.path] = [p.x, p.y, 0, []];
    const [dx, dy] = [p.x - st.x, p.y - st.y];
    [st.x, st.y] = [p.x, p.y];
    const cast = (x: number, y: number, vx: number, vy: number, life = 0.9) => {
      Object.assign(st.sparks[st.next], { x, y, vx, vy, age: 0, life, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
      st.next = (st.next + 1) % SPARKS;
    };
    if (!p.reduced) {
      // Sparks fall off the tip every so far you move, and fizz round it over a control.
      st.travel += Math.hypot(dx, dy);
      for (; st.travel > 10; st.travel -= 10) cast(p.x, p.y, (Math.random() - 0.5) * 60, Math.random() * 40);
      if (p.hover && Math.random() < p.dt * 22) {
        const a = Math.random() * Math.PI * 2;
        cast(p.x + Math.cos(a) * 8, p.y + Math.sin(a) * 8, Math.cos(a) * 40, Math.sin(a) * 40, 0.5);
      }
      // A click casts a burst.
      if (p.down && !st.wasDown)
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2;
          cast(p.x, p.y, Math.cos(a) * 120, Math.sin(a) * 120, 0.6);
        }
      // A loop drawn in the last second and a bit casts a shield from its middle.
      st.cooldown = Math.max(st.cooldown - p.dt, 0);
      const last = st.path.at(-1);
      if (!last || Math.hypot(p.x - last[0], p.y - last[1]) > 4) st.path.push([p.x, p.y, st.t]);
      while (st.path.length && st.t - st.path[0][2] > 1.2) st.path.shift();
      if (!st.cooldown && st.path.length > 8 && Math.abs(turning(st.path)) > Math.PI * 1.9) {
        const xs = st.path.map((q) => q[0]);
        const ys = st.path.map((q) => q[1]);
        const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
        if (size > 30) {
          st.shield = { x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2, age: 0 };
          [st.path, st.cooldown] = [[], 0.8];
        }
      }
    }
    st.wasDown = p.down;
    st.tilt += (Math.max(-20, Math.min(20, dx * 1.5)) - st.tilt) * p.ease(8);
    st.light += ((p.hover ? 1 : 0) - st.light) * p.ease(8);

    const [shield, sparks, lumos, wand] = el.children as HTMLCollectionOf<HTMLElement>;
    st.shield.age += p.dt;
    const k = Math.min(st.shield.age / 0.8, 1);
    shield.style.transform = `translate(${st.shield.x}px, ${st.shield.y}px) scale(${0.3 + k * 1.4})`;
    shield.style.opacity = String(k < 1 ? 1 - k : 0);
    st.sparks.forEach((sp, i) => {
      sp.age += p.dt;
      sp.vy += 80 * p.dt;
      sp.x += sp.vx * p.dt;
      sp.y += sp.vy * p.dt;
      const spark = sparks.children[i] as HTMLElement;
      const life = Math.max(0, 1 - sp.age / sp.life);
      spark.style.transform = `translate(${sp.x}px, ${sp.y}px) rotate(${sp.age * 300}deg) scale(${0.4 + life * 0.8})`;
      spark.style.opacity = String(life);
      spark.style.background = sp.color;
    });
    lumos.style.transform = `translate(${p.x}px, ${p.y}px) scale(${0.6 + st.light * 0.8})`;
    lumos.style.opacity = String(0.25 + st.light * 0.75);
    wand.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.reduced ? 0 : st.tilt}deg)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-20 -translate-1/2 rounded-full border-2 border-[#b07cff] opacity-0 shadow-[0_0_14px_#b07cff,inset_0_0_14px_#b07cff]" />
      <div>
        {Array.from({ length: SPARKS }, (_, i) => (
          <div key={i} className="absolute size-2 -translate-1/2 opacity-0" style={{ clipPath: STAR }} />
        ))}
      </div>
      <div className="absolute size-10 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_246_214/0.9),rgb(255_210_63/0.25)_40%,transparent_70%)]" />
      <div className="absolute top-0 left-0 origin-top-left">
        <WandArt className="absolute top-0 left-0 size-8" />
      </div>
    </div>
  );
}
