"use client";

import { type CSSProperties, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 8;
const COLORS = ["#ff5a5f", "#ffb400", "#00c2a8", "#3d7bff", "#b45cff"];
/** A wobbly blob: a circle pushed out in five and nine lobes. */
const BLOB =
  Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const r = 12 + 3.5 * Math.sin(a * 5) + 1.8 * Math.sin(a * 9 + 1);
    return `${i ? "L" : "M"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  }).join("") + "Z";
const DROPS = [
  [17, -6, 2],
  [-15, 10, 1.6],
  [6, 17, 1.2],
  [-8, -17, 1.4],
];

/** One paint splat, colored by `currentColor`; exported so a page can draw it at rest. */
export function SplatArt({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} style={style} aria-hidden>
      <g fill="currentColor">
        <path d={BLOB} />
        {DROPS.map(([cx, cy, r]) => (
          <circle key={cx} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
}

/** A loaded brush: every click leaves a splat of paint that fades, each a new color; over anything clickable the brush swells. */
export function SplatCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    splats: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, rot: 0, size: 1, age: Infinity })),
    next: 0,
    color: 0,
    tip: 1,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    if (!p.dt) for (const b of st.splats) b.age = Infinity;
    if (p.down && !st.wasDown) {
      Object.assign(st.splats[st.next], { x: p.x, y: p.y, rot: Math.random() * 360, size: 0.8 + Math.random() * 0.5, age: 0 });
      els[st.next].style.color = COLORS[st.color];
      st.next = (st.next + 1) % COUNT;
      st.color = (st.color + 1) % COLORS.length;
    }
    st.wasDown = p.down;
    st.splats.forEach((b, i) => {
      b.age += p.dt;
      // Pops in fast, holds, then fades over its last 0.6s.
      const pop = p.reduced ? 1 : 1 - (1 - Math.min(b.age / 0.12, 1)) ** 3;
      els[i].style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg) scale(${b.size * (0.5 + 0.5 * pop)})`;
      els[i].style.opacity = String(Math.max(0, Math.min(1, (2.5 - b.age) / 0.6)));
    });
    st.tip += ((p.down ? 0.6 : p.hover ? 2 : 1) - st.tip) * p.ease(14);
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.tip})`;
    els[COUNT].style.color = COLORS[st.color];
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <SplatArt key={i} className="absolute size-14 -translate-1/2 opacity-0" />
      ))}
      <div className="absolute size-3 -translate-1/2 rounded-full bg-current" style={{ color: COLORS[0] }} />
    </div>
  );
}
