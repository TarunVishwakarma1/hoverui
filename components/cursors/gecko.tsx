"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The spine: points from snout to tail tip, each this far from the last, and how wide the body is at each. */
const SEGMENT = 4.4;
const WIDTH = [1.8, 4.2, 4.6, 3.2, 3.8, 5, 5.4, 5.4, 5, 4, 3.2, 2.6, 2.1, 1.6, 1.2, 0.8, 0.4];
/** How far the spine may bend at each joint, so the body curves instead of folding. */
const BEND = 0.32;
/** The legs: the spine point each hangs from, and which side. Diagonal pairs (front left with back right) step together. */
const LEGS = [
  { at: 3, side: -1, front: true },
  { at: 3, side: 1, front: true },
  { at: 8, side: -1, front: false },
  { at: 8, side: 1, front: false },
];
const PAIR = [0, 1, 1, 0];
const [UPPER, LOWER, STEP] = [6, 6.5, 8];
const BOX = 240;
const SKIN = "#62bd4a";
const SPOTS = "#3b8a2c";

type Point = { x: number; y: number };

/** The way the body faces at spine point `i`, from the point behind it to the point ahead. */
const facing = (spine: Point[], i: number) => {
  const j = Math.min(Math.max(i, 1), spine.length - 2);
  return Math.atan2(spine[j - 1].y - spine[j + 1].y, spine[j - 1].x - spine[j + 1].x);
};

/** Where a foot would like to be: out to its side of the hip, a little ahead, further ahead the faster it runs. */
function stance(spine: Point[], leg: (typeof LEGS)[number], speed: number): Point {
  const f = facing(spine, leg.at);
  const hip = spine[leg.at];
  const lead = (leg.front ? 5 : 3) + Math.min(speed * 0.02, 5);
  const out = f + (Math.PI / 2) * leg.side;
  return { x: hip.x + Math.cos(f) * lead + Math.cos(out) * 8, y: hip.y + Math.sin(f) * lead + Math.sin(out) * 8 };
}

/** The knee of a two-bone leg from `hip` to `foot`, bent toward `bend` (+1 or -1). */
function knee(hip: Point, foot: Point, bend: number): Point {
  const d = Math.min(Math.hypot(foot.x - hip.x, foot.y - hip.y), UPPER + LOWER - 0.01);
  const a = Math.atan2(foot.y - hip.y, foot.x - hip.x);
  const turn = Math.acos(Math.max(-1, Math.min(1, (UPPER * UPPER + d * d - LOWER * LOWER) / (2 * UPPER * d || 1))));
  return { x: hip.x + Math.cos(a + turn * bend) * UPPER, y: hip.y + Math.sin(a + turn * bend) * UPPER };
}

/** Everything the gecko is drawn from: its outline, each leg's hip, knee, foot and toes, its spots and its eyes. Shared by the live cursor and its art. */
function shape(spine: Point[], feet: Point[], breathe = 1) {
  const side = (sign: number) =>
    spine.map((pt, i) => {
      const a = facing(spine, i) + (Math.PI / 2) * sign;
      const w = WIDTH[i] * (i > 2 && i < 10 ? breathe : 1);
      return { x: pt.x + Math.cos(a) * w, y: pt.y + Math.sin(a) * w };
    });
  const legs = LEGS.map((leg, i) => {
    const hip = spine[leg.at];
    // A leg is never drawn longer than it is: a foot further off than that is drawn at full stretch toward it.
    const far = Math.hypot(feet[i].x - hip.x, feet[i].y - hip.y);
    const reach = Math.min(far, UPPER + LOWER) / (far || 1);
    const foot = { x: hip.x + (feet[i].x - hip.x) * reach, y: hip.y + (feet[i].y - hip.y) * reach };
    const bent = knee(hip, foot, leg.side * (leg.front ? 1 : -1));
    const a = Math.atan2(foot.y - bent.y, foot.x - bent.x);
    return { hip, knee: bent, foot, toes: [-0.7, 0, 0.7].map((spread) => ({ x: foot.x + Math.cos(a + spread) * 3.2, y: foot.y + Math.sin(a + spread) * 3.2 })) };
  });
  const f = facing(spine, 1);
  return {
    outline: [...side(1), ...side(-1).reverse()],
    legs,
    spots: [5, 7, 9, 11, 13].map((i) => ({ ...spine[i], r: Math.max(WIDTH[i] * 0.35, 0.5) })),
    eyes: [-1, 1].map((sign) => ({ x: spine[1].x + Math.cos(f + (Math.PI / 2) * sign) * 3.4, y: spine[1].y + Math.sin(f + (Math.PI / 2) * sign) * 3.4, angle: f })),
  };
}

/** The outline as one smooth closed path: quadratic curves through each point, ending on the midpoints between them. */
function smoothPath(points: Point[]) {
  const mid = (a: Point, b: Point) => `${((a.x + b.x) / 2).toFixed(2)} ${((a.y + b.y) / 2).toFixed(2)}`;
  return `M${mid(points.at(-1)!, points[0])}${points.map((pt, i) => `Q${pt.x.toFixed(2)} ${pt.y.toFixed(2)} ${mid(pt, points[(i + 1) % points.length])}`).join("")}Z`;
}

/** The gecko at rest, mid-stride on a gentle curve, from the same geometry the cursor draws with; exported so a page can draw it at rest. */
const REST = (() => {
  const spine = WIDTH.map((_, i) => ({ x: 70 - i * SEGMENT, y: 22 + Math.sin(i * 0.38) * 5 }));
  return shape(
    spine,
    LEGS.map((leg) => stance(spine, leg, 0)),
  );
})();
export function GeckoArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-2 2 82 40" className={`overflow-visible ${className}`} aria-hidden>
      {REST.legs.map((leg, i) => (
        <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={`${leg.hip.x},${leg.hip.y} ${leg.knee.x},${leg.knee.y} ${leg.foot.x},${leg.foot.y}`} stroke="currentColor" strokeWidth="4.2" />
          <polyline points={`${leg.hip.x},${leg.hip.y} ${leg.knee.x},${leg.knee.y} ${leg.foot.x},${leg.foot.y}`} stroke={SKIN} strokeWidth="2.6" />
          <path d={leg.toes.map((t) => `M${leg.foot.x} ${leg.foot.y}L${t.x} ${t.y}`).join("")} stroke="currentColor" strokeWidth="1" />
        </g>
      ))}
      <path d={smoothPath(REST.outline)} fill={SKIN} stroke="currentColor" strokeWidth="1.1" />
      {REST.spots.map((spot, i) => (
        <circle key={i} cx={spot.x} cy={spot.y} r={spot.r} fill={SPOTS} />
      ))}
      {REST.eyes.map((eye, i) => (
        <g key={i}>
          <circle cx={eye.x} cy={eye.y} r="2.2" fill="#fbf6d8" stroke="currentColor" strokeWidth="0.8" />
          <circle cx={eye.x + 0.8} cy={eye.y} r="1.1" fill="#16181a" />
        </g>
      ))}
    </svg>
  );
}

/**
 * A gecko that stalks the pointer like a bug. Its spine bends as it turns, and its four feet plant and step in
 * diagonal pairs, the trot of a real lizard, nothing keyframed. It stops short of the pointer and watches it with
 * both eyes; over anything clickable it flicks its tongue at it; a click and it lunges, tongue first.
 */
export function GeckoCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    spine: WIDTH.map(() => ({ x: 0, y: 0 })),
    heading: 0,
    speed: 0,
    t: 0,
    tongue: 0,
    flick: 0,
    lunge: 0,
    blink: 2,
    feet: LEGS.map(() => ({ x: 0, y: 0, from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, step: 1 })),
    stepped: 0,
    ratio: 1,
    ink: "",
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const canvas = el.firstElementChild as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { spine, feet } = st;
    if (!p.dt) {
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.height = BOX * st.ratio;
      st.ink = getComputedStyle(el).color;
      // It arrives to the pointer's left, facing it.
      spine.forEach((pt, i) => Object.assign(pt, { x: p.x - 30 - i * SEGMENT, y: p.y + 6 }));
      [st.heading, st.speed] = [0, 0];
    }
    st.t += p.dt;
    const head = spine[0];

    // The hunt: turn toward the pointer at a lizard's turning rate, run at it, and stop just short.
    const [dx, dy] = [p.x - head.x, p.y - head.y];
    const dist = Math.hypot(dx, dy);
    if (p.down && !st.wasDown && !p.reduced) [st.lunge, st.tongue] = [0.18, 1];
    st.wasDown = p.down;
    st.lunge = Math.max(st.lunge - p.dt, 0);
    if (p.reduced) {
      st.heading = Math.atan2(dy, dx);
      const close = Math.max(dist - 16, 0);
      [head.x, head.y] = [head.x + Math.cos(st.heading) * close, head.y + Math.sin(st.heading) * close];
    } else {
      const aim = Math.atan2(dy, dx);
      const turn = Math.atan2(Math.sin(aim - st.heading), Math.cos(aim - st.heading));
      if (dist > 14) st.heading += Math.max(-8 * p.dt, Math.min(8 * p.dt, turn));
      const want = dist < 14 ? 0 : st.lunge ? 460 : Math.min(Math.max(dist - 16, 0) * 6, 320) * Math.max(0, Math.cos(turn));
      st.speed += (want - st.speed) * p.ease(st.lunge ? 22 : 9);
      head.x += Math.cos(st.heading) * st.speed * p.dt;
      head.y += Math.sin(st.heading) * st.speed * p.dt;
    }
    // The rest of the spine follows the snout, each point held one segment from the last and bent no more than a lizard can.
    for (let i = 1; i < spine.length; i++) {
      const [a, b] = [spine[i - 1], spine[i]];
      let angle = Math.atan2(b.y - a.y, b.x - a.x);
      const prev = i > 1 ? Math.atan2(a.y - spine[i - 2].y, a.x - spine[i - 2].x) : st.heading + Math.PI;
      const off = Math.atan2(Math.sin(angle - prev), Math.cos(angle - prev));
      if (Math.abs(off) > BEND) angle = prev + Math.sign(off) * BEND;
      [b.x, b.y] = [a.x + Math.cos(angle) * SEGMENT, a.y + Math.sin(angle) * SEGMENT];
    }

    // The feet: each stays planted until the body has moved on past it, then steps to where it will be needed, landing
    // a little ahead when running. The diagonal pairs take turns: a pair that has just stepped waits while the other
    // pair needs to, so neither is ever starved and left behind.
    const ideals = LEGS.map((leg) => stance(spine, leg, st.speed));
    const needs = [0, 1].map((pair) => feet.some((f, j) => PAIR[j] === pair && Math.hypot(ideals[j].x - f.x, ideals[j].y - f.y) > STEP));
    LEGS.forEach((leg, i) => {
      const foot = feet[i];
      const ideal = ideals[i];
      if (!p.dt || p.reduced) {
        Object.assign(foot, { x: ideal.x, y: ideal.y, step: 1 });
        return;
      }
      const away = Math.hypot(ideal.x - foot.x, ideal.y - foot.y);
      const other = 1 - PAIR[i];
      const busy = feet.some((f, j) => PAIR[j] === other && f.step < 1);
      const turn = st.stepped !== PAIR[i] || !needs[other];
      // Out of reach altogether (a sharp turn, a lunge), it steps at once, turn or no turn.
      if (foot.step >= 1 && ((!busy && turn && away > STEP) || away > UPPER + LOWER + 8)) {
        st.stepped = PAIR[i];
        const ahead = st.speed * 0.06;
        Object.assign(foot, { from: { x: foot.x, y: foot.y }, to: { x: ideal.x + Math.cos(st.heading) * ahead, y: ideal.y + Math.sin(st.heading) * ahead }, step: 0 });
      }
      if (foot.step < 1) {
        foot.step = Math.min(foot.step + p.dt / (st.speed > 160 ? 0.075 : 0.11), 1);
        const e = 1 - (1 - foot.step) ** 2;
        [foot.x, foot.y] = [foot.from.x + (foot.to.x - foot.from.x) * e, foot.from.y + (foot.to.y - foot.from.y) * e];
      }
    });

    // Over a control it flicks its tongue every so often; a click shoots it out at once.
    st.flick -= p.dt;
    if (p.hover && st.flick <= 0 && !p.reduced && dist < 40) [st.tongue, st.flick] = [1, 1.1];
    st.tongue = Math.max(st.tongue - p.dt * 4, 0);
    st.blink -= p.dt;
    if (st.blink < -0.12) st.blink = 1.5 + Math.random() * 3;

    // Draw it, in page coordinates, in a canvas box that travels with the body.
    const mid = spine[6];
    const [left, top] = [mid.x - BOX / 2, mid.y - BOX / 2];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -left * st.ratio, -top * st.ratio);
    ctx.lineCap = ctx.lineJoin = "round";

    // The tongue, pink and forked, out toward the pointer and back.
    if (st.tongue > 0) {
      const out = Math.sin(st.tongue * Math.PI) * Math.min(dist + 2, 34);
      const a = Math.atan2(dy, dx);
      const tip = { x: head.x + Math.cos(a) * out, y: head.y + Math.sin(a) * out };
      ctx.strokeStyle = "#ff5d8f";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(head.x, head.y);
      ctx.lineTo(tip.x, tip.y);
      for (const fork of [0.6, -0.6]) {
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(tip.x + Math.cos(a + fork) * 3, tip.y + Math.sin(a + fork) * 3);
      }
      ctx.stroke();
    }

    const breathe = p.reduced ? 1 : 1 + Math.sin(st.t * 3) * 0.04 * Math.max(0, 1 - st.speed / 60);
    const body = shape(spine, feet, breathe);
    // Legs under the body: outline, then skin, then three splayed toes.
    for (const leg of body.legs) {
      for (const [color, width] of [[st.ink, 4.2], [SKIN, 2.6]] as const) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(leg.hip.x, leg.hip.y);
        ctx.lineTo(leg.knee.x, leg.knee.y);
        ctx.lineTo(leg.foot.x, leg.foot.y);
        ctx.stroke();
      }
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const toe of leg.toes) {
        ctx.moveTo(leg.foot.x, leg.foot.y);
        ctx.lineTo(toe.x, toe.y);
      }
      ctx.stroke();
    }
    const outline = new Path2D(smoothPath(body.outline));
    ctx.fillStyle = SKIN;
    ctx.fill(outline);
    ctx.strokeStyle = st.ink;
    ctx.lineWidth = 1.1;
    ctx.stroke(outline);
    ctx.fillStyle = SPOTS;
    for (const spot of body.spots) {
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Eyes on either side of the head, watching the pointer, and now and then a blink.
    const look = Math.atan2(dy, dx);
    for (const eye of body.eyes) {
      ctx.fillStyle = "#fbf6d8";
      ctx.strokeStyle = st.ink;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(eye.x, eye.y, 2.2, st.blink < 0 ? 0.4 : 2.2, eye.angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (st.blink >= 0) {
        ctx.fillStyle = "#16181a";
        ctx.beginPath();
        ctx.arc(eye.x + Math.cos(look) * 0.8, eye.y + Math.sin(look) * 0.8, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // The pointer itself, the bug it is after: its own element, so it is never left off the gecko's canvas.
    (el.lastElementChild as HTMLElement).style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" style={{ width: BOX, height: BOX }} />
      <div className="absolute size-[5px] -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
