"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Twelve Elder Futhark runes, each drawn in a 4×6 box round its centre. */
const RUNES = [
  "M-1.5-3v6M-1.5-1l3-2M-1.5 1l3-2",
  "M-1.5 3v-6l3 2v4",
  "M-1.5-3v6M-1.5-1.5 1 0l-2.5 1.5",
  "M-1.5 3v-6l2.8 1.6-2.8 1.6 2.8 3.4",
  "M1.5-3-1.5 0l3 3",
  "M-2-3l4 6M2-3l-4 6",
  "M0-3v6",
  "M0 3v-6M0-1l-2-2M0-1l2-2",
  "M0 3v-6M-2-1l2-2 2 2",
  "M-1.5-3v6l2.5-1.5-2.5-1.5 2.5-1.5Z",
  "M-2 3v-6l2 2.5 2-2.5v6",
  "M-2 3l4-4-2-2-2 2 4 4",
];

/** The plain gold ring, face on; exported so a page can draw it at rest. */
export function RuneArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <path d="M-11 0a11 11 0 1 0 22 0a11 11 0 1 0-22 0ZM-7.5 0a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0-15 0Z" fillRule="evenodd" fill="#e9b740" stroke="currentColor" strokeWidth="1" />
      <path d="M-8.4-4.2a9.4 9.4 0 0 1 7.4-5.1" fill="none" stroke="#fff3c4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.6 3.6a7.6 7.6 0 0 1-4.2 3.7" fill="none" stroke="#9c6a14" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** The runes in a circle, burning; exported so a page can draw them round the ring. */
export function RunesArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-30 -30 60 60" className={`overflow-visible drop-shadow-[0_0_3px_#ff7a1a] ${className}`} aria-hidden>
      <g fill="none" stroke="#ff6a1f" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round">
        {RUNES.map((d, i) => (
          <path key={i} d={d} transform={`rotate(${i * 30}) translate(0 -24)`} />
        ))}
      </g>
    </svg>
  );
}

const WISPS = 8;

/**
 * A gold ring at the pointer's side, slowly turning. Over anything clickable it heats and its runes kindle in a circle
 * round it; leave the pointer still and it creeps closer, runes stirring, asking to be worn. Hold to put it on: you
 * vanish, the page drains to grey, wraiths of smoke circle you, and the dark closes in the longer you wear it. Let go
 * and it drops back, turning.
 */
export function RuneCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, lx: 0, ly: 0, t: 0, burn: 0, worn: 0, wornFor: 0, still: 0, flip: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const moved = p.dt ? Math.hypot(p.x - st.lx, p.y - st.ly) : 1;
    [st.lx, st.ly] = [p.x, p.y];
    st.still = moved > 0.5 || p.hover || p.down ? 0 : st.still + p.dt;
    // Left alone, it calls to be worn: it creeps toward the pointer and its runes stir.
    const tempt = Math.min(Math.max(st.still - 1.2, 0) / 2, 1);
    const stir = p.reduced ? 0.35 : 0.2 + 0.25 * Math.abs(Math.sin(st.t * 5) * Math.sin(st.t * 1.7));
    st.burn += ((p.hover && !p.down ? 1 : tempt * stir) - st.burn) * p.ease(6);
    // Taken off after a while worn, it drops back into view turning over.
    if (!p.down && st.wornFor > 0.3 && !p.reduced) st.flip = 1;
    st.wornFor = p.down ? st.wornFor + p.dt : 0;
    st.flip = Math.max(st.flip - p.dt * 1.4, 0);
    st.worn += ((p.down ? 1 : 0) - st.worn) * p.ease(7);
    // Hangs off the pointer, closer over a control or when it tempts, and slips onto it when worn.
    const off = (p.hover ? 13 : 18) * (1 - tempt * 0.6) * (1 - st.worn);
    st.x += (p.x + off - st.x) * p.ease(9);
    st.y += (p.y + off - st.y) * p.ease(9);
    const bob = p.reduced ? 0 : Math.sin(st.t * 2.2) * 2;

    const [veil, wisps, ring, shimmer, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const [runes, band] = ring.children as HTMLCollectionOf<SVGSVGElement>;
    ring.style.transform = `translate(${st.x}px, ${st.y + bob}px) scale(${1 - st.worn * 0.6})`;
    ring.style.opacity = String(1 - st.worn);
    const turn = p.reduced ? 0 : Math.sin(st.t * 1.3) * 55 + (1 - (1 - st.flip) ** 3) * 540;
    band.style.transform = `rotateY(${turn}deg)`;
    // The gold heats as the runes burn.
    band.style.filter = st.burn > 0.02 ? `drop-shadow(0 0 ${st.burn * 5}px rgb(255 110 30 / ${st.burn}))` : "";
    runes.style.opacity = String(st.burn);
    runes.style.rotate = p.reduced ? "" : `${st.t * 12}deg`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    dot.style.opacity = String(1 - st.worn);

    // Worn: the page drains to grey, and its edges darken, closing in the longer the ring stays on.
    veil.style.display = wisps.style.display = st.worn > 0.005 ? "" : "none";
    if (st.worn > 0.005) {
      const a = el.parentElement!.getBoundingClientRect();
      const left = Math.max(a.left, 0);
      const top = Math.max(a.top, 0);
      const hold = Math.min(st.wornFor / 5, 1);
      const clear = 150 - hold * 100;
      Object.assign(veil.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${Math.min(a.right, innerWidth) - left}px`,
        height: `${Math.min(a.bottom, innerHeight) - top}px`,
        opacity: String(st.worn),
        background: `radial-gradient(circle at ${p.x - left}px ${p.y - top}px, transparent ${clear}px, rgb(16 16 22 / ${0.35 + hold * 0.35}) ${clear + 240}px)`,
      });
      // Wraiths of smoke circle the wearer, some one way, some the other.
      [...wisps.children].forEach((wisp, i) => {
        const angle = (p.reduced ? 0 : st.t * (0.5 + i * 0.08) * (i % 2 ? 1 : -1)) + i * 0.8;
        const r = 44 + 22 * Math.sin((p.reduced ? 0 : st.t * 0.7) + i);
        Object.assign((wisp as HTMLElement).style, {
          transform: `translate(${p.x + Math.cos(angle) * r}px, ${p.y + Math.sin(angle) * r * 0.8}px) scale(${1 + 0.3 * Math.sin(st.t + i)})`,
          opacity: String(st.worn * 0.6),
        });
      });
    }
    // All that is left of you is a waver in the air.
    const waver = p.reduced ? 1 : 1 + Math.sin(st.t * 9) * 0.12;
    shimmer.style.transform = `translate(${p.x}px, ${p.y}px) scale(${waver})`;
    shimmer.style.opacity = String(st.worn * 0.8);
  });

  // No blend mode or filter on the root: either would cut the veil off from the page it greys.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute backdrop-blur-[1px] backdrop-grayscale" style={{ display: "none" }} />
      <div style={{ display: "none" }}>
        {Array.from({ length: WISPS }, (_, i) => (
          <div key={i} className="absolute size-14 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(120_120_136/0.55),transparent_70%)]" />
        ))}
      </div>
      <div className="absolute top-0 left-0">
        <RunesArt className="absolute size-14 -translate-1/2 opacity-0" />
        <RuneArt className="absolute size-6 -translate-1/2" />
      </div>
      <div className="absolute size-4 -translate-1/2 rounded-full border border-current opacity-0 shadow-[0_0_8px_currentColor]" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
