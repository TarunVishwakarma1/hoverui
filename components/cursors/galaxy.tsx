"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const STARS = 420;
/** The galaxy's radius at rest, and the canvas box round the pointer it is drawn in. */
const RADIUS = 44;
const BOX = 440;

type Star = { r: number; angle: number; size: number; tone: number; twinkle: number; x: number; y: number; vx: number; vy: number; cx: number; cy: number; lag: number; along: number };

/** Star colors by where a star sits: a warm core, then the arms in blue, violet and pink. Bright on dark pages, deep on light ones. */
const TONES = {
  dark: ["#fff4dc", "#ffd9a6", "#9ec8ff", "#c6a6ff", "#ff9fd8"],
  light: ["#c27a12", "#d9822b", "#2f6fe0", "#7a4fe0", "#d63e95"],
};

/** A point `along` (0 to 1) the outline of a box, clockwise from its top-left corner. */
function outline(box: DOMRect, along: number, out: number) {
  const perimeter = 2 * (box.width + box.height);
  let d = (((along % 1) + 1) % 1) * perimeter;
  if (d < box.width) return [box.left + d, box.top - out];
  if ((d -= box.width) < box.height) return [box.right + out, box.top + d];
  if ((d -= box.height) < box.width) return [box.right - d, box.bottom + out];
  return [box.left - out, box.bottom - (d - box.width)];
}

/**
 * A spiral galaxy turning round the pointer: two arms of stars about a warm core, the core on the exact point. Move
 * and its outer stars trail behind, as if the galaxy had mass. Over anything clickable the stars stream out of the
 * arms and circle the control, tracing its outline; press and it goes supernova, every star flung out from a flash,
 * then gathered back in.
 */
export function GalaxyCursor({ className = "" }: { className?: string }) {
  const s = useRef({ t: 0, flash: 0, ratio: 1, dark: false, stars: [] as Star[], wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const canvas = el.firstElementChild as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!p.dt) {
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = canvas.height = BOX * st.ratio;
      // A light cursor color means a dark page: the stars glow and add up there, and stay deep and clear on paper.
      const [r, g, b] = (getComputedStyle(el).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
      st.dark = 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
      // Two arms on a logarithmic spiral, thick with stars near the core and thinning outward.
      st.stars = Array.from({ length: STARS }, (_, i) => {
        const r = RADIUS * Math.random() ** 1.7;
        const spread = (Math.random() - 0.5) * (0.9 - (r / RADIUS) * 0.55);
        return {
          r,
          angle: (i % 2) * Math.PI + Math.log(1 + r / 6) * 2.3 + spread,
          size: 0.7 + Math.random() * (r < 8 ? 1.4 : 1),
          tone: r < 6 ? 0 : r < 14 ? 1 : 2 + Math.floor(Math.random() * 3),
          twinkle: Math.random() * 6,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          cx: p.x,
          cy: p.y,
          lag: 40 - (r / RADIUS) * 22,
          along: Math.random(),
        };
      });
    }
    st.t += p.dt;
    if (p.down && !st.wasDown && !p.reduced) {
      st.flash = 1;
      for (const star of st.stars) {
        const a = Math.atan2(star.y - p.y, star.x - p.x) || Math.random() * 7;
        const v = 220 + Math.random() * 380;
        [star.vx, star.vy] = [star.vx + Math.cos(a) * v, star.vy + Math.sin(a) * v];
      }
    }
    st.wasDown = p.down;
    st.flash = Math.max(st.flash - p.dt * 2.2, 0);

    const box = p.hover?.getBoundingClientRect();
    const spin = p.reduced ? 0 : st.t * 0.9;
    const [tilt, turn] = [0.62, -0.35];
    const [left, top] = [p.x - BOX / 2, p.y - BOX / 2];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -left * st.ratio, -top * st.ratio);
    ctx.globalCompositeOperation = st.dark ? "lighter" : "source-over";

    // The core: a soft warm glow on the exact point, flaring white in a supernova.
    const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16 + st.flash * 60);
    core.addColorStop(0, st.dark ? "rgb(255 240 210 / 0.9)" : "rgb(214 138 40 / 0.55)");
    core.addColorStop(1, "rgb(255 220 170 / 0)");
    ctx.fillStyle = core;
    ctx.fillRect(p.x - 80, p.y - 80, 160, 160);

    const tones = st.dark ? TONES.dark : TONES.light;
    for (const star of st.stars) {
      // Each star's own centre lags the pointer, the outer ones most, so a moving galaxy draws its arms out behind it.
      const k = p.reduced ? 1 : 1 - Math.exp(-star.lag * p.dt);
      star.cx += (p.x - star.cx) * (p.dt ? k : 1);
      star.cy += (p.y - star.cy) * (p.dt ? k : 1);
      let [tx, ty] = [0, 0];
      if (box) {
        // Over a control, the stars stream round its outline, drifting clockwise.
        star.along += p.reduced ? 0 : p.dt * 0.05;
        [tx, ty] = outline(box, star.along, 2 + (star.r / RADIUS) * 9);
      } else {
        const a = star.angle + spin;
        const [ox, oy] = [Math.cos(a) * star.r, Math.sin(a) * star.r * tilt];
        [tx, ty] = [star.cx + ox * Math.cos(turn) - oy * Math.sin(turn), star.cy + ox * Math.sin(turn) + oy * Math.cos(turn)];
      }
      if (p.reduced || !p.dt) [star.x, star.y, star.vx, star.vy] = [tx, ty, 0, 0];
      else {
        // A spring home, plus whatever a supernova threw it.
        star.vx += ((tx - star.x) * 90 - star.vx * 14) * p.dt;
        star.vy += ((ty - star.y) * 90 - star.vy * 14) * p.dt;
        star.x += star.vx * p.dt;
        star.y += star.vy * p.dt;
      }
      const glint = p.reduced ? 0.8 : 0.55 + 0.45 * Math.sin(st.t * 3 + star.twinkle);
      ctx.globalAlpha = Math.min(1, glint + st.flash * 0.5);
      ctx.fillStyle = tones[star.tone];
      ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
    }
    ctx.globalAlpha = 1;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" style={{ width: BOX, height: BOX }} />
    </div>
  );
}
