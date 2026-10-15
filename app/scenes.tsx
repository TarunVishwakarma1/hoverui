import type { ReactNode } from "react";
import {
  AstronautArt,
  BalloonArt,
  BatArt,
  BlackHoleArt,
  BlockArt,
  CandleArt,
  CatArt,
  ChompArt,
  ClassicArt,
  ClockArt,
  CloudArt,
  CoinArt,
  CompassArt,
  CreatureArt,
  DiceArt,
  DoodleArt,
  DragonArt,
  DropletArt,
  ElementArt,
  FishArt,
  FlyArt,
  GeckoArt,
  GalleyArt,
  GearArt,
  GhostArt,
  JellyfishArt,
  LanternArt,
  LeafArt,
  MagnifierArt,
  MercuryFilter,
  PlaneArt,
  PumpkinArt,
  RocketArt,
  RuneArt,
  RunesArt,
  SaberArt,
  SnowflakeArt,
  SparkleArt,
  SpiderArt,
  SplatArt,
  StampMark,
  SunArt,
  TopArt,
  UfoArt,
  WandArt,
  YoyoArt,
} from "./live";

/** Halftone's resting field: a 45° screen of dots, largest at the centre, round a clear eye. */
const HALFTONE = (() => {
  const dots: [number, number, number][] = [];
  const [c, sn] = [Math.SQRT1_2, Math.SQRT1_2];
  for (let u = -12; u <= 12; u++)
    for (let v = -12; v <= 12; v++) {
      const [x, y] = [(u * c - v * sn) * 7, (u * sn + v * c) * 7];
      const d = Math.hypot(x, y);
      const r = 3.5 * Math.max(0, 1 - d / 58) ** 0.85;
      if (d > 7 && r > 0.25) dots.push([x, y, r]);
    }
  return dots;
})();
/** A firefly's light, as the cursor draws it. */
const FIREFLY = { background: "#efff7a", boxShadow: "0 0 0 1px rgb(64 72 8 / 0.5), 0 0 8px 3px rgb(186 232 30 / 0.9)" };
const METAL = "radial-gradient(circle at 38% 32%, #ffffff, #d4d8de 30%, #8a919c 66%, #3b4049)";
const PUFF = "radial-gradient(circle, color-mix(in srgb, currentColor 24%, transparent), color-mix(in srgb, currentColor 9%, transparent) 45%, transparent 70%)";

/** Galaxy's resting spiral: two arms of stars about a warm core, laid out once from a fixed seed so every render matches. */
const GALAXY = (() => {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const tones = ["#e2a13a", "#e89a52", "#5b8def", "#9a6cf0", "#e0609f"];
  return Array.from({ length: 170 }, (_, i) => {
    const r = 58 * rand() ** 1.7;
    const a = (i % 2) * Math.PI + Math.log(1 + r / 8) * 2.3 + (rand() - 0.5) * (0.9 - (r / 58) * 0.55) + 0.6;
    const [ox, oy] = [Math.cos(a) * r, Math.sin(a) * r * 0.62];
    return {
      x: ox * Math.cos(-0.35) - oy * Math.sin(-0.35),
      y: ox * Math.sin(-0.35) + oy * Math.cos(-0.35),
      size: 1 + rand() * (r < 10 ? 1.6 : 1.1),
      tone: tones[r < 7 ? 0 : r < 16 ? 1 : 2 + Math.floor(rand() * 3)],
    };
  });
})();

/** Sand's resting pile on a button: 3px grains in sand-art bands, settled at the slope the cursor's sand settles at. */
const DUNE = ["#f26b5b", "#f6b24a", "#3fae9f", "#5b8def", "#9f7ae0"].flatMap((fill, band) =>
  Array.from({ length: 27 }, (_, i) => {
    const [x, height] = [(i - 13) * 3, 14 - Math.abs(i - 13)];
    const [lo, hi] = [band * 3, Math.min(height, band * 3 + 3)];
    return hi > lo ? [{ x, y: -hi * 3, h: (hi - lo) * 3, fill }] : [];
  }).flat(),
);
/** Fluid's resting swirl: a stroke of dye curling into an eddy, older dye wider and fainter, its color turning through the rainbow. */
const SWIRL = Array.from({ length: 28 }, (_, i) => {
  const t = i / 27;
  const [a, r] = [t * Math.PI * 3.2 + 2.4, 70 * (1 - t) ** 1.1 + 5];
  return { x: 18 + Math.cos(a) * r, y: -4 + Math.sin(a) * r * 0.75, size: 16 + t * 14, color: `hsl(${200 + t * 150} 90% 58%)`, opacity: 0.9 - t * 0.45 };
});

const KANA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789";

/**
 * A gallery tile's resting scene: the cursor drawn engaged with a small target, centred, about 200px across.
 * No transforms on the wrapper: a transform would isolate Blend's difference disc from the field it inverts.
 */
export function Scene({ name }: { name: string }) {
  const word = "absolute -translate-1/2 text-2xl leading-8 tracking-[-0.02em] whitespace-nowrap";
  const scene: Record<string, ReactNode> = {
    ring: (
      <>
        <span className={`${word} underline decoration-1 underline-offset-4`}>Case study</span>
        <span className="absolute top-[6px] left-[30px] size-[58px] -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[2px] left-[40px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    trail: Array.from({ length: 14 }, (_, i) => {
      const t = i / 13;
      return (
        <span
          key={i}
          className="absolute size-3.5 -translate-1/2 rounded-full bg-ink"
          style={{ left: `${108 - t * 216}px`, top: `${-16 + Math.sin(t * Math.PI * 1.4) * 44}px`, scale: String(1 - i / 14) }}
        />
      );
    }),
    blend: (
      <>
        <span className="absolute top-[-24px] left-[-96px] h-12 w-36 bg-ink" />
        <span className="absolute top-[-40px] left-[8px] size-20 rounded-full bg-white mix-blend-difference" />
      </>
    ),
    label: (
      <>
        <span className={`${word} top-[14px] underline decoration-hairline decoration-1 underline-offset-4`}>Case study</span>
        <span className="absolute top-[-14px] left-[18px] -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper">View</span>
      </>
    ),
    register: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <span className="absolute top-[2px] left-[34px] size-[29px] -translate-1/2 rounded-full border border-ink bg-ink/10" />
        <svg viewBox="0 0 24 24" className="absolute top-0 left-[40px] size-6 -translate-1/2 overflow-visible">
          <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
        </svg>
      </>
    ),
    offset: (
      <>
        {["#00a3e0", "#e5007e", "#ffd400"].map((c, i) => (
          <span key={c} className="absolute size-14 -translate-1/2 rounded-full border-[3px]" style={{ borderColor: c, left: `${(1 - i) * 9}px`, top: `${(1 - i) * 6}px` }} />
        ))}
        <span className="absolute size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    ribbon: (
      <svg className="absolute size-px overflow-visible">
        {Array.from({ length: 23 }, (_, i) => {
          const at = (j: number) => [100 - (j / 23) * 210, -14 + Math.sin((j / 23) * Math.PI * 1.6) * 32];
          const [[x1, y1], [x2, y2]] = [at(i), at(i + 1)];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" strokeWidth={12 * (1 - i / 24) + 1.5} stroke={`hsl(${(330 + i * 14) % 360} 90% 58%)`} />;
        })}
      </svg>
    ),
    confetti: (
      <>
        {Array.from({ length: 18 }, (_, i) => {
          const [a, d] = [i * 2.4, 22 + (i % 6) * 13];
          return (
            <span
              key={i}
              className="absolute h-2 w-3.5 -translate-1/2"
              style={{ background: ["#ff5a5f", "#ffb400", "#00c2a8", "#3d7bff", "#b45cff"][i % 5], left: `${Math.cos(a) * d}px`, top: `${Math.sin(a) * d * 0.8 + d * 0.35}px`, rotate: `${i * 47}deg` }}
            />
          );
        })}
        <span className="absolute size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    comet: (
      <>
        {[[-80, -40], [-30, 46], [70, 40], [96, -50], [-104, 20]].map(([x, y]) => (
          <span key={x} className="absolute size-[3px] -translate-1/2 rounded-full bg-ink opacity-40" style={{ left: `${x}px`, top: `${y}px` }} />
        ))}
        <span className="absolute top-[-27px] left-[56px] h-2.5 w-[170px] origin-left rotate-155 rounded-full bg-linear-to-r from-ink to-transparent" />
        <span className="absolute top-[-22px] left-[56px] size-4 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    orbit: (
      <>
        <span className="absolute size-24 -translate-1/2 rounded-full border border-ink opacity-30" />
        <span className="absolute size-3 -translate-1/2 rounded-full bg-ink" />
        <span className="absolute top-[-34px] left-[34px] size-2.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    rocket: (
      <>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="absolute size-1.5 -translate-1/2 rounded-full bg-ink" style={{ left: `${-29 - i * 14}px`, top: `${35 + i * 17}px`, opacity: 0.5 - i * 0.1 }} />
        ))}
        <RocketArt className="absolute h-[72px] w-12 -translate-1/2 rotate-40" />
      </>
    ),
    astronaut: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-72 -34Q-20 36 26 8" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="absolute top-[-34px] left-[-72px] size-2 -translate-1/2 rounded-full bg-ink" />
        <AstronautArt className="absolute top-[14px] left-[40px] h-20 w-16 -translate-1/2 rotate-12" />
      </>
    ),
    ghost: (
      <>
        <GhostArt className="absolute top-[-22px] left-[-26px] h-20 w-[70px] -translate-1/2 -rotate-8" />
        <span className="absolute top-[34px] left-[30px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    spider: (
      <>
        <span className="absolute top-[-120px] h-[106px] w-px bg-linear-to-b from-transparent to-ink" />
        <SpiderArt className="absolute top-[4px] h-[60px] w-16 -translate-1/2" />
      </>
    ),
    flashlight: (
      <>
        <span className={word}>Who’s there?</span>
        <span
          className="absolute h-44 w-80 -translate-1/2"
          style={{ background: "radial-gradient(circle 130px at 50% 50%, rgb(255 236 200 / 0.14), transparent 55%, rgb(8 8 12 / 0.9) 100%)" }}
        />
      </>
    ),
    gear: (
      <>
        <GearArt className="absolute size-24 -translate-1/2 rotate-6" />
        <GearArt className="absolute top-[-37px] left-[50px] size-14 -translate-1/2 -rotate-12" />
      </>
    ),
    readout: (
      <>
        <svg viewBox="0 0 40 40" className="absolute size-14 -translate-1/2 overflow-visible">
          <path d="M20 0v14M20 26v14M0 20h14M26 20h14" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute top-[20px] left-[20px] font-mono text-[13px] leading-4 tracking-[0.06em] whitespace-pre">x 412  y 218</span>
      </>
    ),
    googly: (
      <>
        <span className="absolute top-[-26px] left-[20px] flex -translate-1/2 gap-1">
          {[[-6, 9], [-2, 11]].map(([x, y]) => (
            <span key={x} className="relative size-12 rounded-full border-[1.5px] border-ink bg-white">
              <span className="absolute size-6 -translate-1/2 rounded-full bg-[#111]" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }} />
            </span>
          ))}
        </span>
        <span className="absolute top-[28px] left-[-36px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    jelly: <span className="absolute size-14 -translate-1/2 -rotate-20 rounded-full bg-ink" style={{ scale: "1.5 0.67" }} />,
    frame: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-hairline text-[15px]">Button</span>
        {["-top-7 -left-[78px] border-t border-l", "-top-7 left-[78px] -translate-x-full border-t border-r", "top-7 -left-[78px] -translate-y-full border-b border-l", "top-7 left-[78px] -translate-full border-r border-b"].map((c) => (
          <span key={c} className={`absolute size-3 border-ink ${c}`} />
        ))}
        <span className="absolute top-[6px] left-[30px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    magnet: (
      <>
        <span className="absolute h-11 w-36 -translate-1/2 border border-dashed border-hairline" />
        <span className="absolute top-[-3px] left-[8px] flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <span className="absolute top-[-2px] left-[34px] size-[26px] -translate-1/2 rounded-full bg-white mix-blend-difference" />
      </>
    ),
    glass: (
      <>
        <span className={word}>Frosted</span>
        <span className="absolute top-[-2px] left-[30px] size-20 -translate-1/2 rounded-full border border-ink/25 bg-white/10 shadow-[inset_0_1px_1px_rgb(255_255_255/0.5)] backdrop-blur-[5px] backdrop-saturate-150" />
        <span className="absolute top-[-2px] left-[30px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    glow: (
      <>
        <span
          className="absolute size-52 -translate-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgb(255 80 150 / 0.55), rgb(120 90 255 / 0.3) 40%, transparent 70%)" }}
        />
        <span className="absolute size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    neon: (
      <>
        <span className="absolute size-16 -translate-1/2 rounded-full border-2 border-current shadow-[0_0_14px_currentColor,inset_0_0_8px_currentColor]" style={{ color: "#ff2bd6" }} />
        <span className="absolute top-[6px] left-[12px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    sparkle: (
      <>
        {(
          [
            [-96, 34, 8, "#ffb800"],
            [-70, 10, 12, "#ff5fa2"],
            [-40, 28, 7, "#22b8e6"],
            [-18, -6, 16, "#9b5cff"],
            [10, 16, 9, "#ffb800"],
            [34, -18, 13, "#ff5fa2"],
            [62, -2, 7, "#22b8e6"],
          ] as const
        ).map(([x, y, size, color]) => (
          <SparkleArt key={x} className="absolute -translate-1/2" style={{ left: x, top: y, width: size, height: size, color }} />
        ))}
        <SparkleArt className="absolute top-[-30px] left-[86px] size-5 -translate-1/2" />
      </>
    ),
    splat: (
      <>
        {(
          [
            [-46, 10, 1.3, 20, "#ff5a5f"],
            [18, -18, 1, 140, "#3d7bff"],
            [48, 26, 0.8, 260, "#ffb400"],
          ] as const
        ).map(([x, y, scale, turn, color]) => (
          <SplatArt key={color} className="absolute size-14 -translate-1/2" style={{ left: x, top: y, rotate: `${turn}deg`, scale, color }} />
        ))}
        <span className="absolute top-[-36px] left-[70px] size-5 -translate-1/2 rounded-full bg-[#00c2a8]" />
      </>
    ),
    ufo: (
      <>
        <span
          className="absolute top-[-20px] h-16 w-20 -translate-x-1/2 bg-linear-to-b from-[rgb(255_214_70/0.85)] to-[rgb(255_214_70/0.15)]"
          style={{ clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)" }}
        />
        <UfoArt className="absolute top-[-34px] h-12 w-20 -translate-1/2 -rotate-6" />
        <span className="absolute top-[42px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    constellation: (
      <svg className="absolute size-px overflow-visible" fill="currentColor">
        <path d="M-100 30L-62 4L-24 14L8-12L52-4L70-38L104-20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        {[[-100, 30], [-62, 4], [-24, 14], [8, -12], [52, -4], [70, -38]].map(([x, y], i) => (
          <circle key={x} cx={x} cy={y} r={i === 3 ? 3 : 2} opacity={0.5 + i * 0.1} />
        ))}
        <path d="M104-30c.8 6.7 3.3 9.2 10 10-6.7.8-9.2 3.3-10 10-.8-6.7-3.3-9.2-10-10 6.7-.8 9.2-3.3 10-10Z" />
      </svg>
    ),
    bat: (
      <>
        <BatArt className="absolute top-[-22px] left-[22px] h-10 w-20 -translate-1/2 -rotate-12" />
        <span className="absolute top-[22px] left-[-30px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    pumpkin: (
      <>
        <PumpkinArt lit className="absolute top-[14px] left-[22px] h-[60px] w-16 -translate-1/2 rotate-6" />
        <span className="absolute top-[-30px] left-[-26px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    candle: (
      <>
        <span className="absolute top-[-24px] size-36 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_180_60/0.35),transparent_65%)]" />
        <CandleArt className="absolute top-[4px] h-[100px] w-10 -translate-1/2" />
      </>
    ),
    compass: <CompassArt className="absolute size-20 -translate-1/2" />,
    clock: <ClockArt className="absolute size-20 -translate-1/2" />,
    radar: (
      <span className="absolute size-28 -translate-1/2 rounded-full border border-current/70 text-[rgb(34_197_94)]">
        <span className="absolute inset-[30%] rounded-full border border-current/40" />
        <span className="absolute top-1/2 left-0 h-px w-full bg-current/30" />
        <span className="absolute top-0 left-1/2 h-full w-px bg-current/30" />
        <span className="absolute inset-0 rotate-50 rounded-full bg-[conic-gradient(from_270deg,transparent,rgb(34_197_94/0.55)_90deg,transparent_90deg)]" />
        <span className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full bg-current" />
        <span className="absolute top-[26%] left-[68%] size-5 -translate-1/2 rounded-full border-2 border-current" />
      </span>
    ),
    doodle: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-hairline text-[15px]">Button</span>
        <DoodleArt rx={95} ry={36} className="absolute -translate-1/2" />
        <span className="absolute top-[6px] left-[30px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    fly: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-90 34C-60-16-36 52-6 12S28-30 16-14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
        </svg>
        <FlyArt className="absolute top-[-16px] left-[22px] size-10 -translate-1/2 rotate-30" />
        <span className="absolute top-[20px] left-[40px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    classic: (
      <>
        <ClassicArt className="absolute top-[-18px] left-[-84px]" />
        <ClassicArt state="hand" className="absolute top-[-18px]" />
        <ClassicArt state="wait" className="absolute top-[-4px] left-[84px]" />
      </>
    ),
    chomp: (
      <>
        <ChompArt className="absolute left-[-40px] size-14 -translate-1/2" />
        {[10, 40, 70, 100].map((x) => (
          <span key={x} className="absolute size-2 -translate-1/2 rounded-full bg-ink" style={{ left: x }} />
        ))}
      </>
    ),
    matrix: [-54, -18, 18, 54].map((x, c) =>
      Array.from({ length: 7 }, (_, r) => (
        <span
          key={`${c}-${r}`}
          className={`absolute -translate-1/2 font-mono text-[15px] ${r === 6 ? "font-bold text-ink" : "text-[#12b85a] [text-shadow:0_0_6px_rgb(18_184_90/0.6)]"}`}
          style={{ left: x, top: (r - 3.5) * 18 + (c % 2) * 9, opacity: r === 6 ? 1 : (r + 1) / 7 }}
        >
          {KANA[(c * 7 + r * 5) % KANA.length]}
        </span>
      )),
    ),
    cloud: (
      <>
        <CloudArt className="absolute top-[-26px] h-12 w-20 -translate-1/2" />
        {[[-22, 14], [-8, 28], [6, 10], [20, 32], [-14, 46], [12, 52]].map(([x, y]) => (
          <span key={`${x}${y}`} className="absolute h-3 w-px -translate-1/2 bg-ink" style={{ left: x, top: y }} />
        ))}
      </>
    ),
    zap: (
      <>
        <svg className="absolute size-px overflow-visible" fill="none" stroke="#3d7bff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path className="drop-shadow-[0_0_4px_rgb(61_123_255/0.8)]" d="M-30-110l12 24-16 24 20 22-10 24 18 20-6 18 12 8M-14-40l14 16-4 16" />
        </svg>
        <span className="absolute top-[30px] size-2.5 -translate-1/2 rounded-full bg-[#3d7bff] shadow-[0_0_8px_2px_rgb(61_123_255/0.6)]" />
      </>
    ),
    snow: (
      [
        [-90, -30, 10],
        [-56, 10, 14],
        [-20, -40, 8],
        [12, 24, 12],
        [44, -14, 16],
        [80, 30, 9],
        [96, -36, 11],
        [-60, 44, 8],
      ] as const
    ).map(([x, y, size]) => <SnowflakeArt key={x} className="absolute -translate-1/2" style={{ left: x, top: y, width: size, height: size }} />),
    balloon: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-6 54Q4 20 5-8" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <BalloonArt className="absolute top-[-42px] left-[8px] h-[70px] w-[60px] -translate-1/2 rotate-6" />
        <span className="absolute top-[54px] left-[-6px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    yoyo: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-8-60L6 34" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="absolute top-[-60px] left-[-8px] size-2 -translate-1/2 rounded-full bg-ink" />
        <YoyoArt className="absolute top-[34px] left-[6px] size-12 -translate-1/2" />
      </>
    ),
    bubbles: (
      [
        [-10, 50, 8],
        [6, 26, 12],
        [-14, 2, 16],
        [10, -26, 20],
        [-6, -58, 26],
      ] as const
    ).map(([x, y, size]) => (
      <span key={y} className="absolute -translate-1/2 rounded-full border border-ink" style={{ left: x, top: y, width: size, height: size }}>
        <span className="absolute top-[18%] left-[18%] size-[25%] rounded-full bg-ink opacity-60" />
      </span>
    )),
    fish: (
      <>
        <FishArt className="absolute top-[4px] left-[-30px] h-10 w-20 -translate-1/2" />
        <span className="absolute top-[-12px] left-[30px] size-2 -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[-28px] left-[38px] size-3 -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[6px] left-[44px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    jellyfish: (
      <>
        <svg className="absolute size-px overflow-visible" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
          {[-14, -5, 5, 14].map((x, i) => (
            <path key={x} d={`M${x}-14q${i % 2 ? 8 : -8} 14 0 28t0 28`} />
          ))}
        </svg>
        <JellyfishArt className="absolute top-[-30px] h-9 w-16 -translate-1/2" />
      </>
    ),
    ripple: (
      <>
        {[40, 84, 128].map((size, i) => (
          <span key={size} className="absolute -translate-1/2 rounded-full border border-ink" style={{ width: size, height: size, opacity: 0.8 - i * 0.25 }} />
        ))}
        <span className="absolute size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    stamp: (
      <>
        <StampMark className="absolute top-[10px] left-[-34px] size-24 -translate-1/2 -rotate-12 opacity-85" />
        <StampMark className="absolute top-[-22px] left-[52px] size-20 -translate-1/2 rotate-20 opacity-30" />
      </>
    ),
    caret: (
      <span className={word}>
        Car
        <span className="inline-block h-[1.15em] w-0.5 translate-y-[0.18em] bg-ink" />
        et
      </span>
    ),
    tooltip: (
      <>
        <span className="absolute top-[22px] flex h-11 w-28 -translate-1/2 items-center justify-center border border-ink text-[15px]">Save</span>
        <span className="absolute top-[-24px] left-[14px] flex -translate-1/2 flex-col items-center">
          <span className="rounded bg-ink px-2.5 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper">Save changes</span>
          <span className="-mt-1 size-2 rotate-45 bg-ink" />
        </span>
        <span className="absolute top-[12px] left-[14px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    peek: (
      <>
        <span className={`${word} top-[-8px] left-[-24px] underline decoration-1 underline-offset-4`}>Read the docs</span>
        <span className="absolute top-[-6px] left-[16px] size-[26px] -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[-6px] left-[16px] size-1 -translate-1/2 rounded-full bg-ink" />
        <span className="absolute top-[12px] left-[32px] font-mono text-[11px] leading-4 tracking-[0.04em] whitespace-nowrap">→ /docs/install</span>
      </>
    ),
    focus: (
      <>
        <span className={word}>Depth of field</span>
        <span
          className="absolute h-24 w-80 -translate-1/2 backdrop-blur-[3px]"
          style={{ maskImage: "radial-gradient(circle 44px at 58% 50%, transparent 60%, black 100%)" }}
        />
        <span className="absolute left-[25px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    goggles: (
      <>
        <span className={word}>Night shift</span>
        <span className="absolute flex -translate-1/2 items-center">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="relative size-[60px] overflow-hidden rounded-full border-2 border-ink"
              style={{ backdropFilter: "grayscale(1) sepia(1) hue-rotate(70deg) saturate(6) brightness(1.05)" }}
            >
              <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.18)_0_1px,transparent_1px_3px)]" />
            </span>
          ))}
        </span>
      </>
    ),
    dice: (
      <>
        <DiceArt face={5} className="absolute top-[6px] left-[-26px] size-14 -translate-1/2 -rotate-12" />
        <DiceArt face={3} className="absolute top-[-14px] left-[34px] size-12 -translate-1/2 rotate-18" />
      </>
    ),
    plane: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-110 40C-70 50-40 0-10 10S30 0 34-14" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.45" />
        </svg>
        <PlaneArt className="absolute top-[-24px] left-[44px] size-12 -translate-1/2 -rotate-10" />
      </>
    ),
    snake: (
      <>
        {[[3, 0], [2, 0], [1, 0], [0, 0], [-1, 0], [-2, 0], [-2, 1], [-2, 2], [-3, 2], [-4, 2], [-5, 2]].map(([x, y]) => (
          <span key={`${x}${y}`} className="absolute size-2.5 bg-ink" style={{ left: x * 12 - 5, top: y * 12 - 17 }} />
        ))}
        <span className="absolute top-[-14px] left-[70px] size-1.5 bg-ink" />
      </>
    ),
    pixel: (
      <>
        {[[-6, 3, 0.2], [-5, 3, 0.2], [-4, 2, 0.45], [-3, 2, 0.45], [-2, 1, 0.7], [-1, 1, 0.7], [0, 0, 1]].map(([x, y, opacity]) => (
          <span key={`${x}${y}`} className="absolute size-3 bg-ink" style={{ left: x * 12, top: y * 12 - 6, opacity }} />
        ))}
        <span className="absolute top-[-18px] left-[-12px] size-9 border-2 border-ink" />
      </>
    ),
    sun: <SunArt className="absolute size-20 -translate-1/2" />,
    tornado: (
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className="absolute h-3 -translate-1/2 rounded-[50%] border border-ink"
            style={{ width: 24 + i * 12, left: Math.sin(i * 0.8) * i * 2.4 - i * 3, top: 34 - i * 13 }}
          />
        ))}
        <span className="absolute top-[44px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    "black-hole": (
      <>
        <span className="absolute size-40 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_150_60/0.45),transparent_65%)]" />
        <BlackHoleArt className="absolute h-[60px] w-24 -translate-1/2 -rotate-8" />
        {[[-40, 8], [30, 10], [52, -2]].map(([x, y]) => (
          <span key={x} className="absolute size-1 -translate-1/2 rounded-full bg-[#ffd08a] shadow-[0_0_4px_#ff9a3c]" style={{ left: x, top: y }} />
        ))}
        <span className="absolute top-[34px] left-[70px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    top: (
      <>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute -translate-1/2 border border-ink"
            style={{ width: 96 + i * 36, height: 56 + i * 30, top: 4, opacity: 0.5 - i * 0.15, rotate: `${(i % 2 ? 1 : -1) * (1 + i * 2)}deg` }}
          />
        ))}
        <span className="absolute top-[42px] h-2 w-16 -translate-1/2 rounded-[50%] bg-ink/15" />
        <TopArt className="absolute top-[42px] h-24 w-[74px] origin-bottom -translate-x-1/2 -translate-y-full rotate-9" />
      </>
    ),
    rune: (
      <>
        <RunesArt className="absolute size-32 -translate-1/2" />
        <RuneArt className="absolute size-12 -translate-1/2" />
        <span className="absolute top-[-34px] left-[-34px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    galley: (
      <>
        <svg className="absolute size-px overflow-visible">
          <path d="M-96 30c12-5 20 5 32 0s20 5 32 0 20 5 32 0 20 5 32 0 20 5 32 0 20 5 32 0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
        </svg>
        <GalleyArt className="absolute left-[-20px] h-[76px] w-[120px] -translate-1/2 -rotate-3" />
        <CreatureArt kind="gorgon" className="absolute top-[30px] left-[78px] size-14 -translate-x-1/2 -translate-y-full" />
        <span className="absolute top-[-34px] left-[30px] size-2 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    element: (
      <>
        <span className="absolute flex -translate-1/2 items-center gap-1 rounded-md bg-ink p-1 pr-2 text-paper">
          <span className="relative">
            <ElementArt number={49} symbol="In" name="Indium" />
            <span className="absolute top-1/2 left-1/2 h-[15px] w-11 -translate-1/2 -rotate-[26deg] rounded-[50%] border border-[#7dffb0]/60" />
            <span className="absolute top-[22px] left-[-6px] size-1.5 rounded-full bg-[#7dffb0] shadow-[0_0_4px_#7dffb0]" />
          </span>
          <span className="text-sm leading-none font-medium">stall</span>
        </span>
        <span className="absolute top-[-40px] left-[-52px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    saber: (
      <span className="absolute top-[52px] left-[-16px]" style={{ rotate: "24deg" }}>
        <span className="absolute bottom-[26px] left-[-2px] h-[86px] w-1 rounded-full bg-white" style={{ boxShadow: "0 0 4px #4da3ff, 0 0 12px #4da3ff, 0 0 22px #4da3ff" }} />
        <SaberArt className="absolute bottom-0 left-[-4px] h-[30px] w-2" />
      </span>
    ),
    magnifier: (
      <>
        <span className="absolute -translate-1/2 text-[13px] whitespace-nowrap text-ink-soft">the fine print, read close</span>
        <span className="absolute top-[-4px] left-[-6px] flex size-[88px] -translate-1/2 items-center justify-center overflow-hidden rounded-full bg-preview">
          <span className="text-[26px] whitespace-nowrap text-ink-soft">fine print</span>
        </span>
        <MagnifierArt className="absolute top-[-4px] left-[-6px] size-24 -translate-1/2" />
      </>
    ),
    wand: (
      <>
        <span className="absolute top-[-6px] left-[-30px] size-24 -translate-1/2 rounded-full border-2 border-[#b07cff] opacity-50 shadow-[0_0_10px_#b07cff]" />
        {[[-58, -30, "#ffd23f"], [-40, 18, "#ff7ad9"], [-12, -50, "#b07cff"], [-70, 6, "#ffd23f"], [-26, -20, "#ff7ad9"]].map(([x, y, c]) => (
          <span
            key={`${x}${y}`}
            className="absolute size-2.5 -translate-1/2"
            style={{ left: x, top: y, background: c as string, clipPath: "polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)" }}
          />
        ))}
        <WandArt className="absolute top-[-6px] left-[-6px] size-16" />
      </>
    ),
    laser: (
      <>
        <CatArt className="absolute top-[34px] left-[-28px] h-12 w-[72px] -translate-x-1/2 -translate-y-full" />
        <span className="absolute top-[24px] left-[44px] size-2.5 -translate-1/2 rounded-full bg-[#ff2d2d] shadow-[0_0_6px_#ff2d2d,0_0_14px_#ff2d2d]" />
      </>
    ),
    fireworks: (
      <>
        <span className="absolute top-[60px] h-12 w-0.5 -translate-x-1/2 rounded-full bg-linear-to-b from-transparent to-[#ffe7a8]" />
        {Array.from({ length: 26 }, (_, i) => {
          const a = (i / 26) * Math.PI * 2;
          const r = 34 + (i % 3) * 12;
          const c = ["#ff4d6d", "#ffd23f", "#3dd6ff", "#9b5cff"][i % 4];
          return <span key={i} className="absolute size-[4px] -translate-1/2 rounded-full" style={{ left: Math.cos(a) * r, top: Math.sin(a) * r - 14, background: c, boxShadow: `0 0 6px ${c}` }} />;
        })}
      </>
    ),
    droplet: (
      <>
        <span className={word}>Ripple</span>
        {[84, 136].map((d, i) => (
          <span key={d} className="absolute -translate-1/2 rounded-full border border-ink" style={{ width: d, height: d, left: 26, top: 4, opacity: 0.4 - i * 0.2 }} />
        ))}
        <DropletArt className="absolute top-[4px] left-[26px] size-12 -translate-1/2" />
      </>
    ),
    mercury: (
      <>
        <MercuryFilter id="mercury-scene" size={140} />
        <span className="absolute top-[-70px] left-[-70px] size-[140px]" style={{ filter: "url(#mercury-scene)" }}>
          {[
            [60, 70, 34],
            [84, 60, 15],
            [104, 84, 9],
            [28, 92, 7],
          ].map(([x, y, d]) => (
            <span key={x} className="absolute -translate-1/2 rounded-full" style={{ left: x, top: y, width: d, height: d, background: METAL }} />
          ))}
        </span>
      </>
    ),
    halftone: (
      <svg aria-hidden className="absolute size-px overflow-visible">
        {HALFTONE.map(([x, y, r]) => (
          <circle key={`${x},${y}`} cx={x} cy={y} r={r} fill="currentColor" />
        ))}
        <circle r="3.5" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
    fireflies: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        {[
          [-72, -25, 1],
          [-30, -25, 0.35],
          [14, -25, 1],
          [58, -25, 0.6],
          [75, 4, 1],
          [40, 25, 0.35],
          [-6, 25, 1],
          [-52, 25, 0.6],
          [-75, -2, 1],
          [96, -46, 0.4],
          [-104, 38, 0.5],
        ].map(([x, y, o]) => (
          <span key={`${x},${y}`} className="absolute size-1.5 -translate-1/2 rounded-full" style={{ ...FIREFLY, left: x, top: y, opacity: 0.4 + (o as number) * 0.6 }} />
        ))}
      </>
    ),
    leaves: (
      <>
        <span className="absolute top-[30px] flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        {[
          [-40, -50, 30, 0, "#d9482b"],
          [12, -74, -50, 0, "#f2a93b"],
          [52, -36, 70, 0, "#ec7a22"],
          [-28, 7, -20, 74, "#e3c04a"],
          [6, 7, 25, 74, "#d9482b"],
          [40, 7, -10, 74, "#b5462a"],
        ].map(([x, y, turn, lie, color]) => (
          <span key={`${x},${y}`} className="absolute" style={{ left: x, top: y, color: color as string, transform: `perspective(240px) rotateX(${lie}deg) rotateZ(${turn}deg)` }}>
            <LeafArt className="absolute h-[22px] w-[13px] -translate-1/2" />
          </span>
        ))}
      </>
    ),
    smoke: (
      <>
        {[
          [0, 24, 0.5],
          [4, 6, 0.9],
          [-4, -14, 1.3],
          [6, -36, 1.7],
          [-2, -58, 2.1],
        ].map(([x, y, scale]) => (
          <span key={y} className="absolute size-6 -translate-1/2 rounded-full" style={{ left: x, top: y, scale: String(scale), background: PUFF }} />
        ))}
        <span className="absolute top-[-84px] left-[22px] h-3.5 w-14 -translate-1/2 rounded-[50%] border-[3px] border-ink/30 blur-[1.5px]" />
        <span className="absolute top-[38px] size-2 -translate-1/2 rounded-full bg-[#ff7a2e] shadow-[0_0_6px_2px_rgb(255_120_40/0.65)]" />
      </>
    ),
    galaxy: (
      <>
        <span className="absolute size-12 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(226_161_58/0.55),transparent_70%)]" />
        <svg aria-hidden className="absolute size-px overflow-visible">
          {GALAXY.map((star, i) => (
            <rect key={i} x={star.x - star.size / 2} y={star.y - star.size / 2} width={star.size} height={star.size} fill={star.tone} />
          ))}
        </svg>
      </>
    ),
    liquid: (
      <>
        <span className="absolute flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <span
          className="absolute h-14 w-[156px] -translate-1/2 rounded-full backdrop-blur-[1.5px] backdrop-saturate-150"
          style={{
            background: "linear-gradient(180deg, rgb(255 255 255 / 0.14), rgb(255 255 255 / 0) 38%, rgb(255 255 255 / 0) 72%, rgb(255 255 255 / 0.08))",
            boxShadow: "inset 0 1px 0.5px rgb(255 255 255 / 0.8), inset 0 -1px 1px rgb(255 255 255 / 0.3), inset 0 0 0 1px rgb(0 0 0 / 0.07), 0 4px 14px -6px rgb(0 0 0 / 0.22)",
          }}
        />
        <span className="absolute top-[4px] left-[30px] size-1 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    gecko: (
      <>
        <GeckoArt className="absolute h-[60px] w-[123px] -translate-1/2" />
        <span className="absolute top-[0px] left-[64px] size-[5px] -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    coin: (
      <>
        <span className="absolute top-[34px] flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <BlockArt className="absolute top-[-6px] size-6 -translate-1/2" />
        <CoinArt className="absolute top-[-44px] size-6 -translate-1/2 scale-x-40" />
        <span className="absolute top-[-70px] -translate-1/2 font-mono text-[13px] font-bold">+1</span>
        <CoinArt className="absolute top-[26px] left-[40px] size-5 -translate-1/2" />
        <span className="absolute top-[34px] left-[52px] font-mono text-[13px] font-bold">×7</span>
      </>
    ),
    lantern: (
      <>
        {[
          [-64, -50, 0.6, "#ff5f6d"],
          [40, -74, 0.5, "#ffb347"],
          [-20, -86, 0.42, "#ff8a3d"],
          [72, -22, 0.75, "#f7598f"],
          [-50, 8, 0.85, "#ffb347"],
        ].map(([x, y, k, color]) => (
          <span key={x} className="absolute" style={{ left: x, top: y, scale: String(k), filter: "drop-shadow(0 0 6px rgb(255 150 50 / 0.75))" }}>
            <LanternArt color={color as string} className="absolute h-10 w-8 -translate-1/2" />
          </span>
        ))}
        <span className="absolute top-[10px] left-[18px]" style={{ filter: "drop-shadow(0 0 8px rgb(255 150 50 / 0.85))" }}>
          <LanternArt className="absolute h-10 w-8 -translate-1/2" />
        </span>
        <span className="absolute top-[46px] left-[18px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    dragon: (
      <>
        <span className="absolute top-[40px] left-[46px] size-12 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(50_30_20/0.5),rgb(50_30_20/0.22)_40%,transparent_70%)]" />
        {[0.14, 0.28, 0.42, 0.56, 0.7, 0.84].map((t) => (
          <span
            key={t}
            className="absolute -translate-1/2 rounded-full bg-[radial-gradient(circle,#fff6c8,#ffb02e_40%,rgb(255_80_20/0)_72%)]"
            style={{ left: -6.6 + t * 52.6, top: -28 + t * 68 - Math.sin(t * Math.PI) * 12, width: 8 + t * 18, height: 8 + t * 18 }}
          />
        ))}
        <DragonArt className="absolute top-[-22px] left-[-40px] h-12 w-[72px] -translate-1/2" />
        <span className="absolute top-[40px] left-[46px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    sand: (
      <>
        <span className="absolute top-[34px] flex h-11 w-36 -translate-1/2 items-center justify-center border border-ink text-[15px]">Button</span>
        <svg aria-hidden className="absolute top-[12px] size-px overflow-visible" shapeRendering="crispEdges">
          {DUNE.map((cell) => (
            <rect key={`${cell.x},${cell.y}`} x={cell.x - 1.5} y={cell.y} width="3" height={cell.h} fill={cell.fill} />
          ))}
          {[
            [0, -80],
            [-3, -72],
            [0, -66],
            [3, -59],
            [0, -53],
            [-3, -48],
          ].map(([x, y]) => (
            <rect key={y} x={x - 1.5} y={y} width="3" height="3" fill="#9f7ae0" />
          ))}
        </svg>
        <span className="absolute top-[-76px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    fluid: (
      <>
        {SWIRL.map((blob, i) => (
          <span
            key={i}
            className="absolute -translate-1/2 rounded-full blur-[6px]"
            style={{ left: blob.x, top: blob.y, width: blob.size, height: blob.size, background: blob.color, opacity: blob.opacity }}
          />
        ))}
        <span className="absolute size-1.5 -translate-1/2 rounded-full bg-ink" style={{ left: SWIRL[0].x, top: SWIRL[0].y }} />
      </>
    ),
  };
  if (!scene[name]) return null;
  return (
    <div data-resting aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
      {scene[name]}
    </div>
  );
}
