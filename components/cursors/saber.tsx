"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The blade's color; change it here for another one. */
const BLADE = "#4da3ff";
const LENGTH = 50;
/** Where the blade leaves the hilt, above the pommel. */
const EMITTER = 19;
const GHOSTS = 3;
const SPARKS = 10;

/** The hilt, pommel on the bottom edge; exported so a page can draw the saber at rest, blade and all. */
export function SaberArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 30" className={className} aria-hidden>
      <rect x="1.5" y="0" width="5" height="3" rx="0.8" fill="#9aa3ad" stroke="currentColor" strokeWidth="0.8" />
      <rect x="2" y="3" width="4" height="25" rx="1" fill="#c8cfd6" stroke="currentColor" strokeWidth="0.8" />
      <path d="M2 8h4M2 10.5h4M2 13h4M2 15.5h4" stroke="#55606b" strokeWidth="0.9" />
      <rect x="3" y="19" width="2" height="3" fill="#e5484d" />
      <rect x="2.5" y="27" width="3" height="3" rx="0.6" fill="#55606b" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/** The blade's glow: a white core in a halo of the blade color, hotter over controls and on a clash. */
const glow = (heat: number) => `0 0 ${2 + heat * 3}px ${BLADE}, 0 0 ${7 + heat * 7}px ${BLADE}, 0 0 ${14 + heat * 10}px ${BLADE}`;

/**
 * An energy saber held at the pointer, its pommel on the hotspot. The blade ignites as the pointer arrives, swings
 * against your motion and leaves streaks behind a fast stroke. Over anything clickable it raises a guard and burns
 * brighter; a click clashes in a spray of sparks. Stand still and it powers down; move and it ignites again.
 */
export function SaberCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    vx: 0,
    angle: 20,
    spin: 0,
    length: 0,
    heat: 0,
    flash: 0,
    still: 0,
    history: [] as [number, number, number][],
    sparks: Array.from({ length: SPARKS }, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: Infinity })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    // It ignites each time the pointer arrives.
    if (!p.dt) [st.length, st.vx, st.angle, st.spin, st.still, st.history] = [p.reduced ? LENGTH : 0, 0, 20, 0, 0, []];
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    st.still = p.dt && Math.hypot(p.x - st.x, p.y - st.y) < 0.5 && !p.hover && !p.down ? st.still + p.dt : 0;
    [st.x, st.y] = [p.x, p.y];
    st.vx += (vx - st.vx) * p.ease(12);
    // Left still, the blade powers down; any movement lights it again.
    const lit = st.still < 2.5 || p.reduced;
    st.length += ((lit ? LENGTH : 0) - st.length) * p.ease(lit ? 9 : 4);
    st.heat += ((p.hover ? 1 : 0) - st.heat) * p.ease(8);
    // A swing: the blade trails against your motion on a loose spring, so it overshoots and settles. Over a control it
    // comes up to guard, nearly level.
    const target = p.hover ? 64 : 20 + Math.max(-70, Math.min(70, -st.vx * 0.06));
    if (p.reduced) st.angle = p.hover ? 64 : 20;
    else {
      st.spin += ((target - st.angle) * 160 - st.spin * 13) * p.dt;
      st.angle += st.spin * p.dt;
    }
    // The clash: sparks off the tip, and a white flash down the blade.
    const rad = (st.angle * Math.PI) / 180;
    const reach = st.length + EMITTER;
    if (p.down && !st.wasDown && !p.reduced) {
      st.flash = 1;
      for (const sp of st.sparks) Object.assign(sp, { x: p.x + Math.sin(rad) * reach, y: p.y - Math.cos(rad) * reach, vx: (Math.random() - 0.5) * 320, vy: -Math.random() * 240, age: 0 });
    }
    st.wasDown = p.down;
    st.flash = Math.max(st.flash - p.dt * 4, 0);

    const [ghosts, saber, sparks] = el.children as HTMLCollectionOf<HTMLElement>;
    const blade = saber.firstElementChild as HTMLElement;
    saber.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${st.angle}deg)`;
    blade.style.height = `${st.length}px`;
    blade.style.scale = `${p.reduced ? 1 : 1 + st.heat * (Math.random() - 0.5) * 0.25} 1`;
    blade.style.boxShadow = glow(st.heat + st.flash);
    // The streak: the blade where it was a few frames ago, fading.
    st.history.unshift([p.x, p.y, st.angle]);
    st.history.length = Math.min(st.history.length, GHOSTS * 3 + 1);
    [...ghosts.children].forEach((ghost, i) => {
      const past = st.history[(i + 1) * 3];
      const g = ghost as HTMLElement;
      g.style.opacity = past && !p.reduced ? String(0.3 - i * 0.09) : "0";
      if (past) g.style.transform = `translate(${past[0]}px, ${past[1]}px) rotate(${past[2]}deg)`;
      (g.firstElementChild as HTMLElement).style.height = `${st.length}px`;
    });
    st.sparks.forEach((sp, i) => {
      sp.age += p.dt;
      sp.vy += 900 * p.dt;
      sp.x += sp.vx * p.dt;
      sp.y += sp.vy * p.dt;
      const spark = sparks.children[i] as HTMLElement;
      spark.style.transform = `translate(${sp.x}px, ${sp.y}px)`;
      spark.style.opacity = String(Math.max(0, 1 - sp.age / 0.4));
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: GHOSTS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 opacity-0">
            <div className="absolute left-[-2px] w-1 rounded-full" style={{ bottom: EMITTER, background: BLADE, filter: "blur(2px)" }} />
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0">
        <div className="absolute left-[-1.5px] w-[3px] rounded-full bg-white" style={{ bottom: EMITTER }} />
        <SaberArt className="absolute bottom-0 left-[-3px] h-[22px] w-1.5" />
      </div>
      <div>
        {Array.from({ length: SPARKS }, (_, i) => (
          <div key={i} className="absolute size-[3px] -translate-1/2 rounded-full bg-white opacity-0" style={{ boxShadow: `0 0 4px ${BLADE}, 0 0 2px #fff` }} />
        ))}
      </div>
    </div>
  );
}
