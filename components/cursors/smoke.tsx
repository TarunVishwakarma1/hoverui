"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const PUFFS = 32;
const RINGS = 3;
/** A puff of smoke: the cursor's own color, thinning to nothing at its edge. */
const PUFF = "radial-gradient(circle, color-mix(in srgb, currentColor 24%, transparent), color-mix(in srgb, currentColor 9%, transparent) 45%, transparent 70%)";

/**
 * A glowing ember at the pointer, like the tip of a stick of incense, with a thread of smoke curling up from it. Moving
 * leaves a trail of drifting smoke. Over anything clickable the smoke thickens and swirls round the pointer; hold to
 * pour it out; a click blows a smoke ring that rises, wobbling as it widens.
 */
export function SmokeCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    puffs: Array.from({ length: PUFFS }, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: Infinity, life: 2, curl: 0 })),
    rings: Array.from({ length: RINGS }, () => ({ x: 0, y: 0, age: Infinity })),
    next: 0,
    nextRing: 0,
    due: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    t: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const puff of [...st.puffs, ...st.rings]) puff.age = Infinity;
    }
    const puff = (vx: number, vy: number) => {
      Object.assign(st.puffs[st.next], { x: p.x, y: p.y - 4, vx, vy, age: 0, life: 1.6 + Math.random() * 0.9, curl: Math.random() * 6 });
      st.next = (st.next + 1) % PUFFS;
    };
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    const [dx, dy] = [p.x - st.lx, p.y - st.ly];
    [st.lx, st.ly] = [p.x, p.y];
    if (!p.reduced) {
      // A thin steady thread at rest, thicker over a control, poured out while held, and a trail as you move.
      st.due -= p.dt;
      if (st.due <= 0) {
        puff((Math.random() - 0.5) * 8, -(26 + Math.random() * 14));
        st.due = p.down ? 0.04 : p.hover ? 0.07 : 0.16;
      }
      for (; st.travel > 16; st.travel -= 16) puff(-dx * 3 + (Math.random() - 0.5) * 10, -dy * 3 - 18);
      if (p.down && !st.wasDown) {
        Object.assign(st.rings[st.nextRing], { x: p.x, y: p.y - 10, age: 0 });
        st.nextRing = (st.nextRing + 1) % RINGS;
      }
    }
    st.wasDown = p.down;

    const [smoke, rings, ember] = el.children as HTMLCollectionOf<HTMLElement>;
    st.puffs.forEach((pf, i) => {
      const node = smoke.children[i] as HTMLElement;
      if (pf.age >= pf.life) {
        node.style.opacity = "0";
        return;
      }
      pf.age += p.dt;
      // Over a control the smoke is drawn round the pointer in a slow vortex instead of straight up.
      if (p.hover) {
        const [rx, ry] = [pf.x - p.x, pf.y - p.y];
        const r = Math.hypot(rx, ry) || 1;
        pf.vx += ((-ry / r) * 70 - (rx / r) * 12 - pf.vx) * Math.min(p.dt * 3, 1);
        pf.vy += ((rx / r) * 70 - (ry / r) * 12 - 10 - pf.vy) * Math.min(p.dt * 3, 1);
      } else pf.vy -= 6 * p.dt;
      // Curling: a lazy side-to-side wander that grows as the puff rises.
      pf.x += (pf.vx + Math.sin(pf.age * 2.4 + pf.curl) * 14 * pf.age) * p.dt;
      pf.y += pf.vy * p.dt;
      pf.vx *= 1 - Math.min(p.dt * 0.8, 1);
      const k = pf.age / pf.life;
      node.style.transform = `translate(${pf.x}px, ${pf.y}px) scale(${0.6 + k * 1.7})`;
      node.style.opacity = String(Math.min(k / 0.25, 1) * (1 - k) ** 1.2);
    });
    st.rings.forEach((ring, i) => {
      ring.age += p.dt;
      const k = Math.min(ring.age / 1.5, 1);
      const node = rings.children[i] as HTMLElement;
      // It rises, widens and wobbles, a torus seen from the side.
      const wobble = 1 + Math.sin(ring.age * 9) * 0.06 * (1 - k);
      node.style.transform = `translate(${ring.x}px, ${ring.y - k * 70}px) scale(${(0.5 + k * 1.3) * wobble}, ${(0.5 + k * 1.1) / wobble})`;
      node.style.opacity = String(k < 1 ? 0.85 * (1 - k) ** 1.4 : 0);
    });
    // The ember breathes; it flares while you hold.
    const glow = p.reduced ? 1 : 1 + Math.sin(st.t * 5) * 0.12 + (p.down ? 0.3 : 0);
    ember.style.transform = `translate(${p.x}px, ${p.y}px) scale(${glow})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {/* A soft blur over the puffs melts them into one stream of smoke. */}
      <div className="blur-[2.5px]">
        {Array.from({ length: PUFFS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 size-6 -translate-1/2 rounded-full opacity-0" style={{ background: PUFF }} />
        ))}
      </div>
      <div>
        {Array.from({ length: RINGS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 h-3.5 w-9 -translate-1/2 rounded-[50%] border-[3px] opacity-0" style={{ borderColor: "color-mix(in srgb, currentColor 30%, transparent)", filter: "blur(1.5px)" }} />
        ))}
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-[#ff7a2e] shadow-[0_0_6px_2px_rgb(255_120_40/0.65)]" />
    </div>
  );
}
