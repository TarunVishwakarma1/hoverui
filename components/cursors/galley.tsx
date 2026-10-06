"use client";

import { type ReactNode, useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const OARLOCKS = [12, 17, 22, 27, 32];

/** A Greek galley facing right: black hull, an eye on the bow, a square sail (`data-sail`) and a bank of oars (`data-oar`, hanging straight down); exported so a page can draw it at rest. */
export function GalleyArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 30" className={`overflow-visible ${className}`} aria-hidden>
      {OARLOCKS.map((x) => (
        <path key={x} data-oar d={`M${x} 19v9`} stroke="#a86a32" strokeWidth="1.2" strokeLinecap="round" style={{ transformOrigin: `${x}px 19px`, rotate: "-12deg" }} />
      ))}
      <path d="M22 18V3M13 4h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <g data-sail style={{ transformOrigin: "22px 4px" }}>
        <path d="M13.5 4.5h17c.8 4 .8 8 0 11.5h-17c-.8-3.5-.8-7.5 0-11.5Z" fill="#f4ead6" stroke="currentColor" strokeWidth="1" />
        <path d="M13.4 8.8h17.2v2.4H13.4Z" fill="#c8442e" />
      </g>
      <path d="M5.8 18.2C3 16.4 1.6 13 2.8 10c.7-1.8 2.8-2 3.3-.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 17.5h35.5l2.5-1.5-.4 3.4 4.4 1.6-4.6 1.2c-1 .8-2.1 1.3-3.6 1.3H11c-3.5 0-6-2.3-6-6Z" fill="#2b2b30" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M7.5 19.6h28" stroke="#d99a3e" strokeWidth="1.2" />
      <circle cx="39.3" cy="19.4" r="1.4" fill="#fff" />
      <circle cx="39.7" cy="19.4" r="0.7" fill="#111" />
    </svg>
  );
}

/** The monsters of the voyage, each drawn rising out of the water, its waterline on the bottom edge. */
export const CREATURES = ["tentacle", "serpent", "cyclops", "gorgon", "whirlpool"] as const;
type Creature = (typeof CREATURES)[number];

/** One of the voyage's monsters: Scylla's tentacle, a sea serpent, the Cyclops (eye in `data-eye`), the Gorgon or Charybdis's whirlpool, seen from above; exported so a page can draw one at rest. */
export function CreatureArt({ kind, className = "" }: { kind: Creature; className?: string }) {
  const tube = (d: string, color: string) => (
    <>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="4.2" strokeLinecap="round" />
    </>
  );
  const art: Record<Creature, ReactNode> = {
    tentacle: (
      <>
        {tube("M11 30C9.5 22 9 15.5 12 10.5c2.6-4.4 8-4.6 9.2-1.2.9 2.6-1.4 4.6-3.6 3.6", "#9b5cff")}
        {[[10.4, 24], [10.2, 19], [11.5, 14.4], [15, 9.6]].map(([cx, cy]) => (
          <circle key={cy} cx={cx} cy={cy} r="0.9" fill="#ead9ff" />
        ))}
      </>
    ),
    serpent: (
      <>
        <path d="M6.6 22.5 4 21.6l2.4-1.4M7.6 17.4 5.2 16l2.8-1" fill="#ffb800" stroke="currentColor" strokeWidth="0.7" strokeLinejoin="round" />
        {tube("M8 30c0-8 1.5-13 6-15.5 3.6-2 7.5-.6 8.6 2.4", "#21b07a")}
        <ellipse cx="22" cy="16.4" rx="4.2" ry="2.8" transform="rotate(18 22 16.4)" fill="#21b07a" stroke="currentColor" strokeWidth="1" />
        <circle cx="22.6" cy="15.3" r="0.8" fill="#111" />
        <path d="M25.8 18.2l2 .5-1.7.5 1.3 1" fill="none" stroke="#ff3b30" strokeWidth="0.7" strokeLinecap="round" />
      </>
    ),
    cyclops: (
      <>
        <path d="M3.5 29c0-11 4.5-18 10.5-18s10.5 7 10.5 18Z" fill="#d9a07a" stroke="currentColor" strokeWidth="1" />
        <path d="M8.6 13.4c1.2-2.6 3.2-3.8 5.4-3.8s4.2 1.2 5.4 3.8c-1.8-1-3.6-1.4-5.4-1.4s-3.6.4-5.4 1.4Z" fill="#5a3a22" />
        <g data-eye style={{ transformOrigin: "14px 18.5px" }}>
          <ellipse cx="14" cy="18.5" rx="4.6" ry="3.8" fill="#fff" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="14.6" cy="18.7" r="2.1" fill="#3d7bff" />
          <circle cx="14.6" cy="18.7" r="1" fill="#111" />
        </g>
        <path d="M9 14.4l5 1.6 5-1.6M11 25.6q3 1.4 6 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </>
    ),
    gorgon: (
      <>
        <g fill="none" stroke="#2f7d3a" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8 15c-2.2-1-3.4-3-2.4-5.4M10.6 12.6c-1.2-2.4-.6-4.8 1.4-6M14 12c0-2.6 1-4.6 3-5.4M17.4 12.6c1.4-2 3.4-2.8 5.2-2.2M20 15c2-.6 3.6 0 4.6 1.6" />
        </g>
        {[[5.6, 9.4], [12, 6.4], [17.1, 6.5], [22.7, 10.3], [24.7, 16.8]].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="1.3" fill="#2f7d3a" />
        ))}
        <path d="M5 29c0-10 4-16 9-16s9 6 9 16Z" fill="#8fcf86" stroke="currentColor" strokeWidth="1" />
        <g>
          <ellipse cx="11" cy="19.6" rx="1.7" ry="1.2" fill="#ffe14d" />
          <ellipse cx="17" cy="19.6" rx="1.7" ry="1.2" fill="#ffe14d" />
        </g>
        <path d="M11 18.8v1.6M17 18.8v1.6M11.6 24.6q2.4 1.4 4.8 0" fill="none" stroke="#111" strokeWidth="0.7" strokeLinecap="round" />
      </>
    ),
    whirlpool: (
      <g transform="translate(14 14)" fill="none" strokeLinecap="round">
        <path d="M0 0c1.6-.4 2.4 1.4 1.2 2.6-1.8 1.8-5 .6-5.2-2.2-.3-3.6 3.4-6 6.8-4.8 4.4 1.6 5.4 7.2 2.2 10.4-3.8 3.8-10.4 2.8-12.6-2" stroke="#2f6bff" strokeWidth="1.8" />
        <path d="M0 0c-1.6.4-2.4-1.4-1.2-2.6 1.8-1.8 5-.6 5.2 2.2.3 3.6-3.4 6-6.8 4.8-4.4-1.6-5.4-7.2-2.2-10.4 3.8-3.8 10.4-2.8 12.6 2" stroke="#8fd3ff" strokeWidth="1.4" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 28 28" className={`overflow-visible ${className}`} aria-hidden>
      {art[kind]}
    </svg>
  );
}

const WAKE = 10;
const NOTES = 6;

/**
 * A Greek galley rowing after the pointer, bobbing on the swell, leaving a wake and turning about when you change
 * course. Monsters rise round it now and then: Scylla's tentacle, a sea serpent, the Cyclops, the Gorgon, whose gaze
 * turns the ship to stone, and Charybdis's whirlpool. Over anything clickable the sirens sing from it: the oars lift
 * and the sail fills. Hold to row hard; a click calls up a monster where you click.
 */
export function GalleyCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    x: 0,
    y: 0,
    face: 1,
    t: 0,
    row: 0,
    sail: 0,
    stone: 0,
    travel: 0,
    timer: 2,
    wake: Array.from({ length: WAKE }, () => ({ x: 0, y: 0, age: Infinity })),
    nextWake: 0,
    notes: Array.from({ length: NOTES }, () => ({ x: 0, y: 0, age: Infinity })),
    nextNote: 0,
    sing: 0,
    monsters: CREATURES.map(() => ({ x: 0, y: 0, age: Infinity })),
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    if (!p.dt) for (const m of [...st.wake, ...st.notes, ...st.monsters]) m.age = Infinity;
    // It keeps astern of the pointer, and comes about when the pointer crosses over its bow.
    if ((p.x - st.x) * st.face < -24) st.face = -st.face;
    const [x0, y0] = [st.x, st.y];
    st.x += (p.x - 24 * st.face - st.x) * p.ease(p.down ? 6 : 3);
    st.y += (p.y + 14 - st.y) * p.ease(p.down ? 6 : 3);
    const moved = Math.hypot(st.x - x0, st.y - y0);
    const speed = p.dt ? moved / p.dt : 0;
    st.sail += ((p.hover && !p.down ? 1 : 0) - st.sail) * p.ease(6);

    // Monsters: now and then one surfaces near the bow; a click calls one up on the spot.
    const surface = (x: number, y: number) => {
      const free = CREATURES.flatMap((_, i) => (st.monsters[i].age > 2.4 ? [i] : []));
      if (!free.length) return;
      Object.assign(st.monsters[free[Math.floor(Math.random() * free.length)]], { x, y, age: 0 });
    };
    if (!p.reduced) {
      st.timer -= p.dt;
      if (st.timer <= 0) {
        surface(st.x + st.face * (45 + Math.random() * 40), st.y + 4 + (Math.random() - 0.5) * 30);
        st.timer = 2.5 + Math.random() * 3;
      }
      if (p.down && !st.wasDown) surface(p.x, p.y + 10);
    }
    st.wasDown = p.down;

    // The wake: ripples left at the stern every so far, spreading as they fade.
    st.travel += moved;
    if (!p.reduced)
      for (; st.travel > 14; st.travel -= 14) {
        Object.assign(st.wake[st.nextWake], { x: st.x - st.face * 22, y: st.y + 9, age: 0 });
        st.nextWake = (st.nextWake + 1) % WAKE;
      }
    // The sirens' song: notes rise off the hovered control.
    st.sing -= p.dt;
    if (p.hover && !p.reduced && st.sing <= 0) {
      const r = p.hover.getBoundingClientRect();
      Object.assign(st.notes[st.nextNote], { x: r.left + Math.random() * r.width, y: r.top + 4, age: 0 });
      st.nextNote = (st.nextNote + 1) % NOTES;
      st.sing = 0.22;
    }

    const [wake, monsters, notes, ship, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    st.wake.forEach((w, i) => {
      w.age += p.dt;
      const k = Math.min(w.age / 1.1, 1);
      const ripple = wake.children[i] as HTMLElement;
      ripple.style.transform = `translate(${w.x}px, ${w.y + k * 3}px) scale(${1 + k * 1.4}, ${1 + k * 0.4})`;
      ripple.style.opacity = String(0.55 * (1 - k));
    });
    st.notes.forEach((n, i) => {
      n.age += p.dt;
      const k = Math.min(n.age / 1.2, 1);
      const note = notes.children[i] as HTMLElement;
      note.style.transform = `translate(${n.x + Math.sin(n.age * 6 + i) * 4}px, ${n.y - k * 30}px)`;
      note.style.opacity = String(k < 1 ? Math.min(1, (1 - k) * 2) : 0);
    });
    let gaze = 0;
    st.monsters.forEach((m, i) => {
      m.age += p.dt;
      // Up in 0.4s, a stay of 1.6s, down in 0.4s.
      const rise = m.age < 0.4 ? 1 - (1 - m.age / 0.4) ** 3 : m.age < 2 ? 1 : Math.max(0, 1 - (m.age - 2) / 0.4);
      const monster = monsters.children[i] as HTMLElement;
      const [well, waves] = monster.children as HTMLCollectionOf<HTMLElement>;
      const art = well.firstElementChild as SVGSVGElement;
      monster.style.transform = `translate(${m.x}px, ${m.y}px)`;
      monster.style.opacity = rise > 0 ? "1" : "0";
      waves.style.opacity = String(rise * 0.5);
      if (CREATURES[i] === "whirlpool") {
        art.style.transform = `scale(${rise}, ${rise * 0.4}) rotate(${-m.age * 400}deg)`;
        return;
      }
      art.style.translate = `0 ${(1 - rise) * 100}%`;
      art.style.rotate = `${Math.sin(m.age * 3) * 6}deg`;
      const eye = art.querySelector<SVGElement>("[data-eye]");
      if (eye) eye.style.scale = `1 ${m.age > 1.1 && m.age < 1.25 ? 0.1 : 1}`;
      if (CREATURES[i] === "gorgon" && rise > 0.5 && Math.hypot(m.x - st.x, m.y - st.y) < 120) gaze = 1;
    });
    // The Gorgon's gaze turns the ship to stone while she is up; it warms back to wood after.
    st.stone += (gaze - st.stone) * p.ease(gaze ? 6 : 1.5);

    if (!p.reduced) st.row += p.dt * (2.5 + Math.min(speed * 0.03, 6) + (p.down ? 8 : 0)) * (1 - st.stone);
    const roll = p.reduced ? 0 : Math.sin(st.t * 1.7) * (4 + Math.min(speed * 0.01, 4));
    const bob = p.reduced ? 0 : Math.sin(st.t * 1.7 + 1) * 1.5;
    ship.style.transform = `translate(${st.x}px, ${st.y + bob}px) rotate(${roll * (1 - st.stone)}deg) scaleX(${st.face})`;
    ship.style.filter = st.stone > 0.01 ? `grayscale(${st.stone}) brightness(${1 + st.stone * 0.15})` : "";
    (ship.querySelector("[data-sail]") as SVGElement).style.scale = `${1 + st.sail * 0.12} ${1 + st.sail * 0.06}`;
    // The stroke sweeps the blades aft through the water; entranced by the song, the oars lift clear and rest.
    const stroke = p.reduced ? 0 : Math.sin(st.row) * 24;
    ship.querySelectorAll<SVGElement>("[data-oar]").forEach((oar) => (oar.style.rotate = `${stroke * (1 - st.sail) + 70 * st.sail}deg`));
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div>
        {Array.from({ length: WAKE }, (_, i) => (
          <div key={i} className="absolute h-1.5 w-4 -translate-1/2 rounded-[50%] border-b-[1.5px] border-current opacity-0" />
        ))}
      </div>
      <div>
        {CREATURES.map((kind) => (
          <div key={kind} className="absolute top-0 left-0 opacity-0">
            {/* The well clips the monster at the waterline, so it rises out of the sea. */}
            <div className={`absolute bottom-0 left-0 size-9 -translate-x-1/2 ${kind === "whirlpool" ? "translate-y-1/2" : "overflow-hidden"}`}>
              <CreatureArt kind={kind} className={`size-9 ${kind === "whirlpool" ? "" : "origin-bottom"}`} />
            </div>
            <svg viewBox="0 0 44 4" className="absolute top-0 left-0 h-1 w-11 -translate-x-1/2 -translate-y-1/2 overflow-visible">
              <path d="M0 2c3.7-2 7.3 2 11 0s7.3 2 11 0 7.3 2 11 0 7.3 2 11 0" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        ))}
      </div>
      <div>
        {Array.from({ length: NOTES }, (_, i) => (
          <span key={i} className="absolute -translate-1/2 text-base leading-none opacity-0" style={{ color: i % 2 ? "#ff5fa2" : "#9b5cff" }}>
            {i % 3 ? "♪" : "♫"}
          </span>
        ))}
      </div>
      <GalleyArt className="absolute h-8 w-[51px] -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
