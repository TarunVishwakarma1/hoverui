import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { AstronautCursor } from "@/components/cursors/astronaut";
import { BalloonCursor } from "@/components/cursors/balloon";
import { BatCursor } from "@/components/cursors/bat";
import { BlendCursor } from "@/components/cursors/blend";
import { BubblesCursor } from "@/components/cursors/bubbles";
import { CandleCursor } from "@/components/cursors/candle";
import { CaretCursor } from "@/components/cursors/caret";
import { ChompCursor } from "@/components/cursors/chomp";
import { ClassicCursor } from "@/components/cursors/classic";
import { ClockCursor } from "@/components/cursors/clock";
import { CloudCursor } from "@/components/cursors/cloud";
import { CometCursor } from "@/components/cursors/comet";
import { CompassCursor } from "@/components/cursors/compass";
import { ConfettiCursor } from "@/components/cursors/confetti";
import { ConstellationCursor } from "@/components/cursors/constellation";
import { DiceCursor } from "@/components/cursors/dice";
import { DoodleCursor } from "@/components/cursors/doodle";
import { FishCursor } from "@/components/cursors/fish";
import { FlashlightCursor } from "@/components/cursors/flashlight";
import { FlyCursor } from "@/components/cursors/fly";
import { FocusCursor } from "@/components/cursors/focus";
import { FrameCursor } from "@/components/cursors/frame";
import { GearCursor } from "@/components/cursors/gear";
import { GhostCursor } from "@/components/cursors/ghost";
import { GlassCursor } from "@/components/cursors/glass";
import { GlowCursor } from "@/components/cursors/glow";
import { GogglesCursor } from "@/components/cursors/goggles";
import { GooglyCursor } from "@/components/cursors/googly";
import { JellyCursor } from "@/components/cursors/jelly";
import { JellyfishCursor } from "@/components/cursors/jellyfish";
import { LabelCursor } from "@/components/cursors/label";
import { MagnetCursor } from "@/components/cursors/magnet";
import { MatrixCursor } from "@/components/cursors/matrix";
import { NeonCursor } from "@/components/cursors/neon";
import { OffsetCursor } from "@/components/cursors/offset";
import { OrbitCursor } from "@/components/cursors/orbit";
import { PeekCursor } from "@/components/cursors/peek";
import { PixelCursor } from "@/components/cursors/pixel";
import { PlaneCursor } from "@/components/cursors/plane";
import { PumpkinCursor } from "@/components/cursors/pumpkin";
import { RadarCursor } from "@/components/cursors/radar";
import { ReadoutCursor } from "@/components/cursors/readout";
import { RegisterCursor } from "@/components/cursors/register";
import { RibbonCursor } from "@/components/cursors/ribbon";
import { RingCursor } from "@/components/cursors/ring";
import { RippleCursor } from "@/components/cursors/ripple";
import { RocketCursor } from "@/components/cursors/rocket";
import { SnakeCursor } from "@/components/cursors/snake";
import { SnowCursor } from "@/components/cursors/snow";
import { SparkleCursor } from "@/components/cursors/sparkle";
import { SpiderCursor } from "@/components/cursors/spider";
import { SplatCursor } from "@/components/cursors/splat";
import { StampCursor } from "@/components/cursors/stamp";
import { SunCursor } from "@/components/cursors/sun";
import { TooltipCursor } from "@/components/cursors/tooltip";
import { TornadoCursor } from "@/components/cursors/tornado";
import { TrailCursor } from "@/components/cursors/trail";
import { UfoCursor } from "@/components/cursors/ufo";
import { YoyoCursor } from "@/components/cursors/yoyo";
import { ZapCursor } from "@/components/cursors/zap";
import registry from "@/registry.json";
import { Scene } from "./scenes";

const components: Record<string, ComponentType<{ className?: string }>> = {
  ring: RingCursor,
  trail: TrailCursor,
  blend: BlendCursor,
  label: LabelCursor,
  register: RegisterCursor,
  offset: OffsetCursor,
  ribbon: RibbonCursor,
  confetti: ConfettiCursor,
  comet: CometCursor,
  orbit: OrbitCursor,
  rocket: RocketCursor,
  astronaut: AstronautCursor,
  ghost: GhostCursor,
  spider: SpiderCursor,
  flashlight: FlashlightCursor,
  gear: GearCursor,
  readout: ReadoutCursor,
  googly: GooglyCursor,
  jelly: JellyCursor,
  frame: FrameCursor,
  magnet: MagnetCursor,
  glass: GlassCursor,
  glow: GlowCursor,
  neon: NeonCursor,
  sparkle: SparkleCursor,
  splat: SplatCursor,
  ufo: UfoCursor,
  constellation: ConstellationCursor,
  bat: BatCursor,
  pumpkin: PumpkinCursor,
  candle: CandleCursor,
  compass: CompassCursor,
  clock: ClockCursor,
  radar: RadarCursor,
  doodle: DoodleCursor,
  fly: FlyCursor,
  classic: ClassicCursor,
  chomp: ChompCursor,
  matrix: MatrixCursor,
  cloud: CloudCursor,
  zap: ZapCursor,
  snow: SnowCursor,
  balloon: BalloonCursor,
  yoyo: YoyoCursor,
  bubbles: BubblesCursor,
  fish: FishCursor,
  jellyfish: JellyfishCursor,
  ripple: RippleCursor,
  stamp: StampCursor,
  caret: CaretCursor,
  tooltip: TooltipCursor,
  peek: PeekCursor,
  focus: FocusCursor,
  goggles: GogglesCursor,
  dice: DiceCursor,
  plane: PlaneCursor,
  snake: SnakeCursor,
  pixel: PixelCursor,
  sun: SunCursor,
  tornado: TornadoCursor,
};

/**
 * Cursors on this site invert what is beneath them: ink over paper, paper over ink-filled hovers.
 * The exceptions keep their own colors: Label's pill and Tooltip's tip carry words (inverted, the text under them would show
 * through), the colorful and drawn ones would turn to negatives, Flashlight's dark would become a glare, and a
 * blend on the root of Glass, Focus or Goggles would cut their lenses off from the page they see.
 */
export const cursorTone = "text-white mix-blend-difference";
const ownColors = new Set([
  "label",
  "offset",
  "ribbon",
  "confetti",
  "rocket",
  "astronaut",
  "ghost",
  "flashlight",
  "googly",
  "glass",
  "glow",
  "neon",
  "sparkle",
  "splat",
  "ufo",
  "pumpkin",
  "candle",
  "compass",
  "radar",
  "classic",
  "chomp",
  "matrix",
  "zap",
  "balloon",
  "yoyo",
  "fish",
  "jellyfish",
  "tooltip",
  "focus",
  "goggles",
  "sun",
]);

/** What `className` does on a cursor, by how that cursor takes its color: the Props row on its page. */
export function classNameDoc(name: string) {
  if (name === "label" || name === "tooltip")
    return `Colors the dot and ${name === "label" ? "pill" : "tip"} through currentColor, e.g. text-pink-500. The words switch to black or white to stay readable.`;
  if (["glass", "focus", "goggles"].includes(name))
    return "Colors any outline and the pointer dot through currentColor, e.g. text-pink-500. Keep blend modes and filters off it: either would cut the lens off from the page it sees.";
  if (ownColors.has(name))
    return "Extra classes for the cursor's root. It draws in its own colors, set in the file; any outline or pointer dot it has follows currentColor, e.g. text-pink-500. Leave mix-blend-difference off: it would turn those colors to negatives.";
  return "Colors the cursor through currentColor, e.g. text-pink-500. To read on any background, pass text-white mix-blend-difference, as this site does.";
}

/** registry.json is the source of truth; the site lists cursors in its order. */
export const cursors = registry.items.filter((item) => item.type === "registry:component").map((item) => {
  const Base = components[item.name];
  const tone = ownColors.has(item.name) ? undefined : cursorTone;
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    files: item.files.map((f) => f.path),
    category: item.categories[0],
    Cursor: function SiteCursor() {
      return <Base className={tone} />;
    },
  };
});

export type CursorData = (typeof cursors)[number];

/** Cursors grouped by their registry category, both in registry order: the all-cursors page and the sidebar. */
export const categories = [...new Set(cursors.map((p) => p.category))].map((name) => ({
  name,
  id: name.toLowerCase(),
  cursors: cursors.filter((p) => p.category === name),
}));

/** The home page shows the first few; /cursors shows them all. */
export const featured = cursors.slice(0, 5);

export const getCursor = (name: string) => cursors.find((p) => p.name === name);

/** Registry hooks (today: useCursor, the engine every cursor depends on). */
export const hooks = registry.items
  .filter((item) => item.type === "registry:hook")
  .map((item) => ({ name: item.name, title: item.title, description: item.description, files: item.files.map((f) => f.path) }));

export const getHook = (name: string) => hooks.find((h) => h.name === name);

/** Attributes a cursor reads off the page, beyond the shared hover targets. */
export const attributes: Record<string, [string, string][]> = {
  label: [["data-cursor-label", "On any element: the words the pill shows while the pointer is over it."]],
};

/** Copy that stays true without a cursor; `cursorless` mirrors the hook's own media gate. */
export function Swap({ mouse, touch }: { mouse: ReactNode; touch: ReactNode }) {
  return (
    <>
      <span className="cursorless:hidden">{mouse}</span>
      <span className="hidden cursorless:inline">{touch}</span>
    </>
  );
}

/** Each cursor drawn at rest, so a preview shows its subject before a pointer arrives and on touch. */
const rest = "pointer-events-none absolute";

/** A cursor drawn at rest around a point (centre by default): fades while that preview's live cursor is active. */
export function Glyph({ name, className = "top-1/2 left-1/2" }: { name: string; className?: string }) {
  const drawing: Record<string, ReactNode> = {
    ring: (
      <>
        <span className="absolute size-12 -translate-1/2 rounded-full border border-ink" />
        <span className="absolute top-[10px] left-[12px] size-1.5 -translate-1/2 rounded-full bg-ink" />
      </>
    ),
    trail: Array.from({ length: 14 }, (_, i) => {
      const t = i / 13;
      return (
        <span
          key={i}
          className="absolute size-3 -translate-1/2 rounded-full bg-ink"
          style={{ left: `${72 - t * 144}px`, top: `${-12 + Math.sin(t * Math.PI * 1.4) * 34}px`, scale: String(1 - i / 14) }}
        />
      );
    }),
    blend: (
      <>
        <span className="absolute top-[-20px] left-[-64px] h-10 w-24 bg-ink" />
        <span className="absolute top-[-28px] left-[8px] size-14 rounded-full bg-white mix-blend-difference" />
      </>
    ),
    label: (
      <span className="absolute -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper">Open Label</span>
    ),
    register: (
      <>
        <svg viewBox="0 0 24 24" className="absolute size-10 -translate-1/2 overflow-visible">
          <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute size-4 -translate-1/2 rounded-full border border-ink" />
      </>
    ),
  };
  if (!drawing[name]) return null;
  return (
    <div data-resting aria-hidden className={`${rest} ${className}`}>
      {drawing[name]}
    </div>
  );
}

/** What sits inside each preview: authored to show that cursor at its best. */
export function Specimen({ name }: { name: string }) {
  if (name === "trail")
    return (
      <div className="flex h-full flex-wrap items-end justify-between gap-6 bg-[radial-gradient(circle,var(--color-hairline)_1px,transparent_1.5px)] bg-size-[16px_16px] p-6 sm:p-8">
        <div data-resting aria-hidden className={`${rest} inset-0`}>
          {Array.from({ length: 14 }, (_, i) => {
            const t = i / 13;
            return (
              <span
                key={i}
                className="absolute size-3 -translate-1/2 rounded-full bg-ink"
                style={{ left: `${64 - t * 42}%`, top: `${34 + Math.sin(t * Math.PI * 1.4) * 16}%`, scale: String(1 - i / 14) }}
              />
            );
          })}
        </div>
        <p className="relative max-w-[26ch] bg-preview pr-2 text-pretty text-ink-soft">
          <Swap
            mouse="Draw through the empty space, then over the button: each dot chases the one ahead, and the head swells."
            touch="Each dot chases the one ahead of it. Open this on a computer to draw with it."
          />
        </p>
        <button type="button" className="btn-secondary relative cursorless:hidden">
          Button
        </button>
      </div>
    );

  if (name === "blend")
    return (
      <div className="flex h-full flex-col justify-center gap-6 p-6 sm:p-8">
        <p className="relative self-start text-[clamp(4.5rem,13vw,12.5rem)] leading-[0.85] tracking-[-0.04em]">
          Invert
          <span data-resting aria-hidden className={`${rest} top-1/2 left-[62%] size-[0.5em] -translate-1/2 rounded-full bg-white mix-blend-difference`} />
        </p>
        <div className="relative flex flex-wrap gap-3">
          <button type="button" className="btn-primary">Over ink</button>
          <button type="button" className="btn-secondary">Over a rule</button>
        </div>
      </div>
    );

  if (name === "label")
    return (
      <div className="grid h-full grid-cols-3 content-center gap-3 p-6 sm:gap-5 sm:p-8">
        {cursors.slice(0, 3).map((p, i) => (
          <Link key={p.name} href={`/cursors/${p.name}`} data-cursor-label={`Open ${p.title}`} className="group flex flex-col gap-3">
            <span
              className={`relative flex aspect-[4/5] items-end p-3 text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-[-0.02em] ${
                ["bg-ink text-paper", "bg-seal", "border border-hairline"][i]
              }`}
            >
              {p.title}
              {i === 1 && (
                <span data-resting aria-hidden className={`${rest} top-[38%] left-1/2 -translate-1/2 rounded-full bg-ink px-3 py-1.5 text-xs leading-4 font-medium whitespace-nowrap text-paper`}>
                  Open {p.title}
                </span>
              )}
            </span>
            <span className="mono-label text-ink-soft group-hover:text-ink">{p.category}</span>
          </Link>
        ))}
      </div>
    );

  if (name === "register")
    return (
      <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
        <Glyph name="register" className="top-[44%] left-[70%]" />
        <p className="max-w-[30ch] text-pretty text-ink-soft">
          <Swap
            mouse="You have worn this one since you arrived. Over a control, the ring opens around it."
            touch="On a computer, the whole site wears this one. Over a control, the ring opens around it."
          />
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary cursorless:hidden">Button</button>
          <Link href="/cursors/register" className="btn-secondary">Link</Link>
        </div>
      </div>
    );

  if (name === "ring")
    return (
      <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
        <Glyph name="ring" className="top-[52%] left-[70%] sm:top-[40%] sm:left-[72%]" />
        <p className="max-w-[15ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.02em]">The ring swells over anything you can click.</p>
        {/* Right-aligned and padded clear of the hero's seal, which hangs off this preview's lower-left corner. */}
        <div className="flex flex-wrap items-center justify-end gap-3 pl-12">
          <Link href="/cursors/ring" className="btn-secondary">Source</Link>
          <Link href="/#placement" className="btn-secondary">Placement</Link>
          <button type="button" className="btn-secondary cursorless:hidden">Press and hold</button>
        </div>
      </div>
    );

  // Every other cursor: its resting scene in the middle, a control to hover and press, a way on.
  return (
    <div className="relative flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
      <Scene name={name} />
      <p className="relative max-w-[30ch] text-pretty text-ink-soft">
        <Swap mouse="Move through the preview, then hover the controls and press." touch="Open this on a computer to move it around: it follows a mouse, not a finger." />
      </p>
      <div className="relative flex flex-wrap gap-3">
        <button type="button" className="btn-primary cursorless:hidden">Button</button>
        <Link href="/cursors" className="btn-secondary">All cursors</Link>
      </div>
    </div>
  );
}
