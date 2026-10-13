"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const FLIES = 14;
/** A firefly's light: a lime core and a yellow-green bloom, with a dark edge, its body, so it still reads on white paper. */
const FIREFLY = { background: "#efff7a", boxShadow: "0 0 0 1px rgb(64 72 8 / 0.5), 0 0 8px 3px rgb(186 232 30 / 0.9)" };

/** A firefly's flash over one cycle (0 to 1): a quick rise, a slower fade, then dark until the next. */
const flash = (phase: number) => {
  const x = (((phase / (Math.PI * 2)) % 1) + 1) % 1;
  return x < 0.1 ? x / 0.1 : Math.max(0, 1 - (x - 0.1) / 0.45);
};

/**
 * A swarm of fireflies drifting round the pointer, each blinking on its own rhythm. Over anything clickable they settle
 * along its edge and, like the fireflies of the Smoky Mountains, fall into step until they flash together; leave it
 * and they drift apart again. A click scatters them.
 */
export function FirefliesCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    t: 0,
    flies: Array.from({ length: FLIES }, () => ({ x: 0, y: 0, vx: 0, vy: 0, phase: 0, rate: 1, wander: [0, 0, 0, 0], pull: 1 })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    // Every arrival hatches the swarm afresh, scattered round the pointer and each to its own rhythm.
    if (!p.dt)
      for (const f of st.flies)
        Object.assign(f, {
          x: p.x + (Math.random() - 0.5) * 80,
          y: p.y + (Math.random() - 0.5) * 60,
          vx: 0,
          vy: 0,
          phase: Math.random() * Math.PI * 2,
          rate: (0.55 + Math.random() * 0.35) * Math.PI * 2,
          wander: [0.4 + Math.random() * 0.6, 0.3 + Math.random() * 0.6, Math.random() * 6, Math.random() * 6],
          pull: 10 + Math.random() * 14,
        });
    const box = p.hover?.getBoundingClientRect();
    // Over a control the flashes are coupled, each nudged toward the swarm's mean, so they fall into step.
    let [cx, cy] = [0, 0];
    for (const f of st.flies) [cx, cy] = [cx + Math.cos(f.phase), cy + Math.sin(f.phase)];
    const mean = Math.atan2(cy, cx);
    if (p.down && !st.wasDown && !p.reduced)
      for (const f of st.flies) {
        const [dx, dy] = [f.x - p.x, f.y - p.y];
        const d = Math.hypot(dx, dy) || 1;
        [f.vx, f.vy] = [f.vx + (dx / d) * 520, f.vy + (dy / d) * 520];
      }
    st.wasDown = p.down;

    const [swarm, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    st.flies.forEach((f, i) => {
      let [tx, ty] = [p.x, p.y];
      if (box) {
        // Settled along the control's edge, each at its own place round the rim, creeping slowly.
        const perimeter = 2 * (box.width + box.height);
        let along = ((i / FLIES + st.t * 0.01) % 1) * perimeter;
        if (along < box.width) [tx, ty] = [box.left + along, box.top - 3];
        else if ((along -= box.width) < box.height) [tx, ty] = [box.right + 3, box.top + along];
        else if ((along -= box.height) < box.width) [tx, ty] = [box.right - along, box.bottom + 3];
        else [tx, ty] = [box.left - 3, box.bottom - (along - box.width)];
      } else if (!p.reduced) {
        // Otherwise each wanders its own slow loop round the pointer.
        const [a, b, u, v] = f.wander;
        [tx, ty] = [p.x + Math.sin(st.t * a + u) * 40, p.y + Math.cos(st.t * b + v) * 28];
      } else [tx, ty] = [p.x + Math.sin(i * 2.4) * 34, p.y + Math.cos(i * 1.7) * 24];
      if (p.reduced) [f.x, f.y] = [tx, ty];
      else {
        f.vx += ((tx - f.x) * f.pull - f.vx * 4.5) * p.dt;
        f.vy += ((ty - f.y) * f.pull - f.vy * 4.5) * p.dt;
        f.x += f.vx * p.dt;
        f.y += f.vy * p.dt;
        f.phase += f.rate * p.dt + (box ? 2.5 * Math.sin(mean - f.phase) * p.dt : 0);
      }
      const glow = p.reduced ? 0.7 : flash(f.phase);
      const fly = swarm.children[i] as HTMLElement;
      fly.style.transform = `translate(${f.x}px, ${f.y}px) scale(${0.55 + glow * 0.45})`;
      fly.style.opacity = String(0.4 + glow * 0.6);
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: FLIES }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 size-1.5 -translate-1/2 rounded-full" style={FIREFLY} />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
