"use client";

import { useId, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const DROPS = 8;
/** The pool the metal is drawn in: a box round the bead, big enough for the furthest droplet, small enough to filter cheaply. */
const BOX = 180;
/** Polished metal: a bright crown, the body, a dark underside. */
const METAL = "radial-gradient(circle at 38% 32%, #ffffff, #d4d8de 30%, #8a919c 66%, #3b4049)";

/**
 * The filter that turns grey discs into liquid metal: a blur and a hard alpha threshold make nearby drops flow together
 * like metaballs, and a specular light over the result gives them their chrome. Exported so a page can pour the metal
 * at rest; its user space is the element it is applied to, so the light sits up and to the left of that element.
 */
export function MercuryFilter({ id, size = BOX }: { id: string; size?: number }) {
  return (
    <svg aria-hidden className="absolute size-0">
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="goo" />
        <feGaussianBlur in="goo" stdDeviation="1.5" result="bump" />
        <feSpecularLighting in="bump" surfaceScale="3" specularConstant="1.1" specularExponent="26" lightingColor="#ffffff" result="shine">
          <fePointLight x={size * 0.32} y={size * 0.22} z="80" />
        </feSpecularLighting>
        <feComposite in="shine" in2="goo" operator="in" result="glint" />
        <feComposite in="goo" in2="glint" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" />
      </filter>
    </svg>
  );
}

/**
 * A bead of liquid metal on the pointer. It sloshes after you, stretches along your motion and sheds droplets when you
 * move fast, which roll back and merge into it. Over anything clickable it swells and trembles; a click bursts it into
 * droplets that find their way home.
 */
export function MercuryCursor({ className = "" }: { className?: string }) {
  const filter = `mercury${useId().replace(/[^\w-]/g, "")}`;
  const s = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    size: 1,
    t: 0,
    shed: 0,
    drops: Array.from({ length: DROPS }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0, free: false })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) {
      [st.x, st.y, st.vx, st.vy] = [p.x, p.y, 0, 0];
      for (const d of st.drops) d.free = false;
    }
    // The bead: a spring toward the pointer, a little underdamped, so the metal sloshes.
    if (p.reduced) [st.x, st.y] = [p.x, p.y];
    else {
      st.vx += ((p.x - st.x) * 320 - st.vx * 24) * p.dt;
      st.vy += ((p.y - st.y) * 320 - st.vy * 24) * p.dt;
      st.x += st.vx * p.dt;
      st.y += st.vy * p.dt;
    }
    const speed = Math.hypot(st.vx, st.vy);
    if (speed > 40) st.angle = Math.atan2(st.vy, st.vx);
    const stretch = p.reduced ? 1 : 1 + Math.min(speed / 2600, 0.55);
    const tremble = p.hover && !p.reduced ? Math.sin(st.t * 31) * 0.05 : 0;
    st.size += ((p.down ? 0.8 : p.hover ? 1.45 : 1) - st.size) * p.ease(12);

    const fling = (d: (typeof st.drops)[number], vx: number, vy: number, r: number) => Object.assign(d, { x: st.x, y: st.y, vx, vy, r, free: true });
    if (!p.reduced) {
      // Moving fast, it throws droplets off its tail.
      st.shed -= p.dt;
      const idle = st.drops.find((d) => !d.free);
      if (speed > 1100 && st.shed <= 0 && idle) {
        fling(idle, -st.vx * 0.2 + (Math.random() - 0.5) * 120, -st.vy * 0.2 + (Math.random() - 0.5) * 120, 3 + Math.random() * 2.5);
        st.shed = 0.07;
      }
      // A click bursts it.
      if (p.down && !st.wasDown)
        st.drops.forEach((d, i) => {
          const a = (i / DROPS) * Math.PI * 2 + Math.random() * 0.4;
          const v = 260 + Math.random() * 160;
          fling(d, Math.cos(a) * v, Math.sin(a) * v, 3.5 + Math.random() * 3);
        });
    }
    st.wasDown = p.down;

    const [pool, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const [bead, ...drops] = pool.children as HTMLCollectionOf<HTMLElement>;
    const [ox, oy] = [st.x - BOX / 2, st.y - BOX / 2];
    pool.style.transform = `translate(${ox}px, ${oy}px)`;
    bead.style.transform = `rotate(${st.angle}rad) scale(${(stretch + tremble) * st.size}, ${(st.size - tremble) / stretch})`;
    st.drops.forEach((d, i) => {
      if (d.free) {
        // Home again on a spring, and merged once it touches.
        d.vx += ((st.x - d.x) * 26 - d.vx * 3.2) * p.dt;
        d.vy += ((st.y - d.y) * 26 - d.vy * 3.2) * p.dt;
        d.x += d.vx * p.dt;
        d.y += d.vy * p.dt;
        // Never further than the pool reaches, or the filter would clip it.
        const [dx, dy] = [d.x - st.x, d.y - st.y];
        const far = Math.hypot(dx, dy);
        if (far > BOX / 2 - 12) [d.x, d.y] = [st.x + (dx / far) * (BOX / 2 - 12), st.y + (dy / far) * (BOX / 2 - 12)];
        if (far < 5 && Math.hypot(d.vx, d.vy) < 60) d.free = false;
      }
      drops[i].style.transform = `translate(${d.x - ox}px, ${d.y - oy}px) scale(${d.free ? d.r / 4 : 0})`;
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0" style={{ width: BOX, height: BOX, filter: `url(#${filter})` }}>
        <div className="absolute size-[22px] -translate-1/2 rounded-full" style={{ left: BOX / 2, top: BOX / 2, background: METAL }} />
        {Array.from({ length: DROPS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 size-2 -translate-1/2 rounded-full" style={{ background: METAL }} />
        ))}
      </div>
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
      <MercuryFilter id={filter} />
    </div>
  );
}
