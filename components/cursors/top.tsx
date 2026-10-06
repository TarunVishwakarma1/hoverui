"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const LEVELS = 4;

/** One of the four marks round the top's widest band, `spin` radians round: where it shows, and how wide (0 on the far side). */
function mark(i: number, spin: number) {
  const a = spin + (i * Math.PI) / 2;
  const width = 3 * Math.max(Math.cos(a), 0);
  return { x: 12 + 9.5 * Math.sin(a) - width / 2, width };
}

/** The spinning top, its tip on the bottom edge, the marks on its band in `data-mark`s; exported so a page can draw it at rest. */
export function TopArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 31" className={`overflow-visible ${className}`} aria-hidden>
      <rect x="10.8" y="0.5" width="2.4" height="7" rx="1" fill="#a86a32" stroke="currentColor" strokeWidth="1" />
      <path d="M12 6.5c6 0 11 2.5 11 6.5 0 1.2-.3 2.2-.8 3C20 20.5 15.5 25 12 28.5 8.5 25 4 20.5 1.8 16c-.5-.8-.8-1.8-.8-3 0-4 5-6.5 11-6.5Z" fill="#ff5a5f" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M1 13h22c0 1.2-.3 2.2-.8 3H1.8c-.5-.8-.8-1.8-.8-3Z" fill="#fff" stroke="currentColor" strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => {
        const { x, width } = mark(i, Math.PI / 4);
        return <rect key={i} data-mark x={x} y="13.5" width={width} height="2" fill={i % 2 ? "#3d7bff" : "#ffb800"} />;
      })}
      <path d="M10.8 27.4 12 31l1.2-3.6" fill="#f4f4f5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A spinning top whose tip is the pointer. Moving keeps it spinning true; stand still and it slows and wobbles wider,
 * teeters as if it will fall, and never quite does. Over anything clickable the control sinks into a dream within a
 * dream, frame inside frame; a click is the kick: the top hops into the air and lands on a fresh spin.
 */
export function TopCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, energy: 1, spin: Math.PI / 4, precess: 0, lean: 0, still: 0, hop: 0, vy: 0, dream: 0, box: [0, 0, 0, 0], wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const dx = p.dt ? p.x - st.x : 0;
    const moved = p.dt ? Math.hypot(dx, p.y - st.y) : 0;
    [st.x, st.y] = [p.x, p.y];

    // The kick: up it goes, under gravity, and lands spinning hard.
    if (p.down && !st.wasDown) {
      st.energy = 1;
      if (!p.reduced && st.hop === 0) st.vy = -230;
    }
    st.wasDown = p.down;
    if (st.vy) {
      st.vy += 1500 * p.dt;
      st.hop += st.vy * p.dt;
      if (st.hop >= 0) [st.hop, st.vy] = [0, 0];
    }

    // Motion and hovering wind it up; standing still runs it down, but only so far.
    st.energy = Math.min(1, Math.max(0.15, st.energy + moved * 0.002 + (p.hover ? p.dt * 2 : 0) - p.dt * 0.12));
    st.still = st.energy <= 0.16 ? st.still + p.dt : 0;
    st.lean += (Math.max(-12, Math.min(12, -dx * 0.8)) - st.lean) * p.ease(8);
    let wobble = 0;
    if (!p.reduced) {
      st.spin += p.dt * (6 + st.energy * 22);
      // As the spin runs down, the wobble widens and comes round faster; run all the way down, it teeters, swelling and recovering.
      st.precess += p.dt * (2 + (1 - st.energy) * 5);
      const teeter = Math.min(st.still / 4, 1) * 14 * (0.5 - 0.5 * Math.cos(st.still * 0.9));
      wobble = ((1 - st.energy) ** 1.5 * 24 + teeter) * Math.sin(st.precess) + st.lean;
    }

    const [levels, shadow, top] = [el.children[0] as HTMLElement, el.children[1] as HTMLElement, el.children[2] as SVGSVGElement];
    top.style.transform = `translate(${p.x}px, ${p.y + st.hop}px) rotate(${wobble}deg)`;
    top.querySelectorAll<SVGRectElement>("[data-mark]").forEach((m, i) => {
      const { x, width } = mark(i, st.spin);
      m.setAttribute("x", String(x));
      m.setAttribute("width", String(width));
    });
    // Its shadow on the floor spreads with the wobble and shrinks as it leaves the ground.
    const lift = 1 + st.hop / 90;
    shadow.style.transform = `translate(${p.x + wobble * 0.3}px, ${p.y}px) scale(${(1 + Math.abs(wobble) / 30) * lift}, ${lift})`;

    // Dream levels: the hovered control echoes outward, frame inside frame, each turning a little as it recedes.
    st.dream += ((p.hover ? 1 : 0) - st.dream) * p.ease(8);
    if (p.hover) {
      const r = p.hover.getBoundingClientRect();
      st.box = [r.left, r.top, r.width, r.height];
    }
    const [l, t, w, h] = st.box;
    [...levels.children].forEach((level, i) => {
      const phase = p.reduced ? (i + 1) / (LEVELS + 1) : (st.t * 0.5 + i / LEVELS) % 1;
      const grow = 4 + phase * 30;
      Object.assign((level as HTMLElement).style, {
        width: `${w + grow * 2}px`,
        height: `${h + grow * 2}px`,
        transform: `translate(${l - grow}px, ${t - grow}px) rotate(${p.reduced ? 0 : (i % 2 ? 1 : -1) * phase * 4}deg)`,
        opacity: String(st.dream * (1 - phase) * 0.7),
      });
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: LEVELS }, (_, i) => (
          <div key={i} className="absolute top-0 left-0 border border-current opacity-0" />
        ))}
      </div>
      <div className="absolute h-1 w-5 -translate-1/2 rounded-[50%] bg-current opacity-20" />
      <TopArt className="absolute h-9 w-[28px] origin-bottom -translate-x-1/2 -translate-y-full" />
    </div>
  );
}
