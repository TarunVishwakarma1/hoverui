import type { ReactNode } from "react";
import { AstronautArt } from "@/components/cursors/astronaut";
import { BalloonArt } from "@/components/cursors/balloon";
import { BatArt } from "@/components/cursors/bat";
import { CandleArt } from "@/components/cursors/candle";
import { ChompArt } from "@/components/cursors/chomp";
import { ClassicArt } from "@/components/cursors/classic";
import { ClockArt } from "@/components/cursors/clock";
import { CloudArt } from "@/components/cursors/cloud";
import { CompassArt } from "@/components/cursors/compass";
import { DiceArt } from "@/components/cursors/dice";
import { DoodleArt } from "@/components/cursors/doodle";
import { FishArt } from "@/components/cursors/fish";
import { FlyArt } from "@/components/cursors/fly";
import { GearArt } from "@/components/cursors/gear";
import { GhostArt } from "@/components/cursors/ghost";
import { JellyfishArt } from "@/components/cursors/jellyfish";
import { PlaneArt } from "@/components/cursors/plane";
import { PumpkinArt } from "@/components/cursors/pumpkin";
import { RocketArt } from "@/components/cursors/rocket";
import { SnowflakeArt } from "@/components/cursors/snow";
import { SparkleArt } from "@/components/cursors/sparkle";
import { SpiderArt } from "@/components/cursors/spider";
import { SplatArt } from "@/components/cursors/splat";
import { StampMark } from "@/components/cursors/stamp";
import { SunArt } from "@/components/cursors/sun";
import { UfoArt } from "@/components/cursors/ufo";
import { YoyoArt } from "@/components/cursors/yoyo";

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
  };
  if (!scene[name]) return null;
  return (
    <div data-resting aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
      {scene[name]}
    </div>
  );
}
