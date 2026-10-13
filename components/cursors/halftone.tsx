"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The screen: px between dot centres, the field's radius, and the canvas box round it with room for a pulse. */
const PITCH = 7;
const RADIUS = 46;
const BOX = 2 * (RADIUS + 44);

/** One halftone dot's size, 0 to 1, at `d` px from the centre of a field `radius` across. */
const halftone = (d: number, radius: number) => Math.max(0, 1 - d / radius) ** 0.85;
/** The clear eye at the centre, so the exact point stays visible inside the densest dots. */
const EYE = 7;

/**
 * A printer's halftone screen round the pointer: dots on a grid pinned to the page, big at the centre and shrinking to
 * nothing at the edge, so the field slides over the screen the way a loupe slides over a print. Over anything
 * clickable the screen turns from 45° to 15°, the next ink's angle, and grows finer; hold and the ink spreads into
 * the paper (dot gain); a click sends a pulse out through the dots.
 */
export function HalftoneCursor({ className = "" }: { className?: string }) {
  const s = useRef({ angle: 45, pitch: PITCH, radius: RADIUS, gain: 0, color: "", ratio: 1, pulses: [] as { x: number; y: number; age: number }[], wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const canvas = el.firstElementChild as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Sized and colored on arrival: the ink is whatever color the cursor is set in.
    if (!p.dt) {
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.height = BOX * st.ratio;
      st.color = getComputedStyle(el).color;
      st.pulses = [];
    }
    st.angle += ((p.hover ? 15 : 45) - st.angle) * p.ease(6);
    st.pitch += ((p.hover ? 6 : PITCH) - st.pitch) * p.ease(6);
    st.radius += ((p.hover ? RADIUS + 10 : RADIUS) - st.radius) * p.ease(8);
    st.gain += ((p.down ? 1 : 0) - st.gain) * p.ease(p.down ? 4 : 10);
    if (p.down && !st.wasDown && !p.reduced) st.pulses = [...st.pulses.slice(-2), { x: p.x, y: p.y, age: 0 }];
    st.wasDown = p.down;
    for (const pulse of st.pulses) pulse.age += p.dt;
    st.pulses = st.pulses.filter((pulse) => pulse.age < 0.8);

    const [left, top] = [p.x - BOX / 2, p.y - BOX / 2];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    // Draw in page coordinates: the canvas is a window onto a screen that never moves.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -left * st.ratio, -top * st.ratio);
    ctx.fillStyle = st.color;
    ctx.beginPath();
    const a = (st.angle * Math.PI) / 180;
    const [cos, sin] = [Math.cos(a), Math.sin(a)];
    // The pointer in the screen's own turned grid, and every grid point near enough to show.
    const [pu, pv] = [(p.x * cos + p.y * sin) / st.pitch, (-p.x * sin + p.y * cos) / st.pitch];
    const n = Math.ceil(BOX / 2 / st.pitch);
    for (let u = Math.floor(pu) - n; u <= Math.ceil(pu) + n; u++)
      for (let v = Math.floor(pv) - n; v <= Math.ceil(pv) + n; v++) {
        const [x, y] = [(u * cos - v * sin) * st.pitch, (u * sin + v * cos) * st.pitch];
        const d = Math.hypot(x - p.x, y - p.y);
        if (d < EYE) continue;
        let size = halftone(d, st.radius);
        // A pulse is a band of swollen dots running outward from the click.
        for (const pulse of st.pulses) {
          const band = (Math.hypot(x - pulse.x, y - pulse.y) - pulse.age * 150) / 14;
          size += Math.exp(-band * band) * 0.8 * (1 - pulse.age / 0.8);
        }
        // Dot gain: held down, the ink spreads until neighbours touch.
        const r = (st.pitch / 2) * Math.min(size * (1 + st.gain * 0.6), 1.3);
        if (r < 0.25) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    ctx.fill();
    // The hotspot: a hairline ring in the eye.
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = st.color;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" style={{ width: BOX, height: BOX }} />
    </div>
  );
}
