"use client";

import { type ComponentType, lazy, useEffect, useId, useRef, useState } from "react";

type Cursor = ComponentType<{ className?: string }>;

/**
 * Every cursor file as a chunk of its own, so a page fetches only the cursors it shows, when it shows them, instead of
 * all of them with its first load. The files stay whole, exactly as `shadcn add` installs them: only the site loads
 * them lazily. A new cursor needs a line here.
 */
const files: Record<string, () => Promise<Record<string, unknown>>> = {
  astronaut: () => import("@/components/cursors/astronaut"),
  balloon: () => import("@/components/cursors/balloon"),
  bat: () => import("@/components/cursors/bat"),
  "black-hole": () => import("@/components/cursors/black-hole"),
  blend: () => import("@/components/cursors/blend"),
  bubbles: () => import("@/components/cursors/bubbles"),
  candle: () => import("@/components/cursors/candle"),
  caret: () => import("@/components/cursors/caret"),
  chomp: () => import("@/components/cursors/chomp"),
  classic: () => import("@/components/cursors/classic"),
  clock: () => import("@/components/cursors/clock"),
  cloud: () => import("@/components/cursors/cloud"),
  coin: () => import("@/components/cursors/coin"),
  comet: () => import("@/components/cursors/comet"),
  compass: () => import("@/components/cursors/compass"),
  confetti: () => import("@/components/cursors/confetti"),
  constellation: () => import("@/components/cursors/constellation"),
  dice: () => import("@/components/cursors/dice"),
  doodle: () => import("@/components/cursors/doodle"),
  dragon: () => import("@/components/cursors/dragon"),
  droplet: () => import("@/components/cursors/droplet"),
  element: () => import("@/components/cursors/element"),
  fireflies: () => import("@/components/cursors/fireflies"),
  fireworks: () => import("@/components/cursors/fireworks"),
  fish: () => import("@/components/cursors/fish"),
  flashlight: () => import("@/components/cursors/flashlight"),
  fluid: () => import("@/components/cursors/fluid"),
  fly: () => import("@/components/cursors/fly"),
  focus: () => import("@/components/cursors/focus"),
  frame: () => import("@/components/cursors/frame"),
  galaxy: () => import("@/components/cursors/galaxy"),
  galley: () => import("@/components/cursors/galley"),
  gear: () => import("@/components/cursors/gear"),
  gecko: () => import("@/components/cursors/gecko"),
  ghost: () => import("@/components/cursors/ghost"),
  glass: () => import("@/components/cursors/glass"),
  glow: () => import("@/components/cursors/glow"),
  goggles: () => import("@/components/cursors/goggles"),
  googly: () => import("@/components/cursors/googly"),
  halftone: () => import("@/components/cursors/halftone"),
  jelly: () => import("@/components/cursors/jelly"),
  jellyfish: () => import("@/components/cursors/jellyfish"),
  label: () => import("@/components/cursors/label"),
  lantern: () => import("@/components/cursors/lantern"),
  laser: () => import("@/components/cursors/laser"),
  leaves: () => import("@/components/cursors/leaves"),
  liquid: () => import("@/components/cursors/liquid"),
  magnet: () => import("@/components/cursors/magnet"),
  magnifier: () => import("@/components/cursors/magnifier"),
  matrix: () => import("@/components/cursors/matrix"),
  mercury: () => import("@/components/cursors/mercury"),
  neon: () => import("@/components/cursors/neon"),
  offset: () => import("@/components/cursors/offset"),
  orbit: () => import("@/components/cursors/orbit"),
  peek: () => import("@/components/cursors/peek"),
  pixel: () => import("@/components/cursors/pixel"),
  plane: () => import("@/components/cursors/plane"),
  pumpkin: () => import("@/components/cursors/pumpkin"),
  radar: () => import("@/components/cursors/radar"),
  readout: () => import("@/components/cursors/readout"),
  register: () => import("@/components/cursors/register"),
  ribbon: () => import("@/components/cursors/ribbon"),
  ring: () => import("@/components/cursors/ring"),
  ripple: () => import("@/components/cursors/ripple"),
  rocket: () => import("@/components/cursors/rocket"),
  rune: () => import("@/components/cursors/rune"),
  saber: () => import("@/components/cursors/saber"),
  sand: () => import("@/components/cursors/sand"),
  smoke: () => import("@/components/cursors/smoke"),
  snake: () => import("@/components/cursors/snake"),
  snow: () => import("@/components/cursors/snow"),
  sparkle: () => import("@/components/cursors/sparkle"),
  spider: () => import("@/components/cursors/spider"),
  splat: () => import("@/components/cursors/splat"),
  stamp: () => import("@/components/cursors/stamp"),
  sun: () => import("@/components/cursors/sun"),
  tooltip: () => import("@/components/cursors/tooltip"),
  top: () => import("@/components/cursors/top"),
  tornado: () => import("@/components/cursors/tornado"),
  trail: () => import("@/components/cursors/trail"),
  ufo: () => import("@/components/cursors/ufo"),
  wand: () => import("@/components/cursors/wand"),
  yoyo: () => import("@/components/cursors/yoyo"),
  zap: () => import("@/components/cursors/zap"),
};

/**
 * A cursor by its registry name, picked out of its file by the one export ending in "Cursor". Eager, it is fetched as
 * soon as the page is up (a cursor's own page, the home hero, the search preview); otherwise the first time the pointer
 * comes over its area, as in the gallery, where most tiles are never touched. Until it lands, the cursor outside it
 * carries on, so nothing flickers.
 */
export function LiveCursor({ name, className, eager = false }: { name: string; className?: string; eager?: boolean }) {
  const [Loaded, setLoaded] = useState<Cursor | null>(null);
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let current = true;
    const load = () =>
      files[name]?.().then((file) => {
        const found = Object.entries(file).find(([key, value]) => key.endsWith("Cursor") && typeof value === "function")?.[1] as Cursor | undefined;
        if (current && found) setLoaded(() => found);
      });
    const area = marker.current?.parentElement;
    if (eager || !area) load();
    else area.addEventListener("pointerover", load, { once: true });
    return () => {
      current = false;
      area?.removeEventListener("pointerover", load);
    };
  }, [name, eager]);
  return Loaded ? <Loaded className={className} /> : <span ref={marker} hidden />;
}

/**
 * A cursor's own art, for the resting scenes. The server draws it into the page's HTML; in the browser, a page that
 * arrived with that HTML keeps it as it is instead of fetching the cursor's file just to draw the same still picture
 * again (art has nothing to hydrate). Only when the art first appears in the browser, after a navigation, is its file
 * fetched; until then the navigation waits, so a scene never shows up empty.
 */
function art<P extends object>(load: () => Promise<ComponentType<P>>) {
  const Lazy = lazy(async () => ({ default: await load() }));
  return function Art(props: P) {
    const id = useId();
    const drawn = typeof document === "undefined" ? null : document.getElementById(id);
    return drawn ? (
      <span id={id} className="contents" dangerouslySetInnerHTML={{ __html: drawn.innerHTML }} />
    ) : (
      <span id={id} className="contents">
        <Lazy {...props} />
      </span>
    );
  };
}

export const AstronautArt = art(() => import("@/components/cursors/astronaut").then((file) => file.AstronautArt));
export const BalloonArt = art(() => import("@/components/cursors/balloon").then((file) => file.BalloonArt));
export const BatArt = art(() => import("@/components/cursors/bat").then((file) => file.BatArt));
export const BlackHoleArt = art(() => import("@/components/cursors/black-hole").then((file) => file.BlackHoleArt));
export const BlockArt = art(() => import("@/components/cursors/coin").then((file) => file.BlockArt));
export const CandleArt = art(() => import("@/components/cursors/candle").then((file) => file.CandleArt));
export const CatArt = art(() => import("@/components/cursors/laser").then((file) => file.CatArt));
export const ChompArt = art(() => import("@/components/cursors/chomp").then((file) => file.ChompArt));
export const ClassicArt = art(() => import("@/components/cursors/classic").then((file) => file.ClassicArt));
export const ClockArt = art(() => import("@/components/cursors/clock").then((file) => file.ClockArt));
export const CloudArt = art(() => import("@/components/cursors/cloud").then((file) => file.CloudArt));
export const CoinArt = art(() => import("@/components/cursors/coin").then((file) => file.CoinArt));
export const CompassArt = art(() => import("@/components/cursors/compass").then((file) => file.CompassArt));
export const CreatureArt = art(() => import("@/components/cursors/galley").then((file) => file.CreatureArt));
export const DiceArt = art(() => import("@/components/cursors/dice").then((file) => file.DiceArt));
export const DoodleArt = art(() => import("@/components/cursors/doodle").then((file) => file.DoodleArt));
export const DragonArt = art(() => import("@/components/cursors/dragon").then((file) => file.DragonArt));
export const DropletArt = art(() => import("@/components/cursors/droplet").then((file) => file.DropletArt));
export const ElementArt = art(() => import("@/components/cursors/element").then((file) => file.ElementArt));
export const FishArt = art(() => import("@/components/cursors/fish").then((file) => file.FishArt));
export const FlyArt = art(() => import("@/components/cursors/fly").then((file) => file.FlyArt));
export const GalleyArt = art(() => import("@/components/cursors/galley").then((file) => file.GalleyArt));
export const GearArt = art(() => import("@/components/cursors/gear").then((file) => file.GearArt));
export const GeckoArt = art(() => import("@/components/cursors/gecko").then((file) => file.GeckoArt));
export const GhostArt = art(() => import("@/components/cursors/ghost").then((file) => file.GhostArt));
export const JellyfishArt = art(() => import("@/components/cursors/jellyfish").then((file) => file.JellyfishArt));
export const LanternArt = art(() => import("@/components/cursors/lantern").then((file) => file.LanternArt));
export const LeafArt = art(() => import("@/components/cursors/leaves").then((file) => file.LeafArt));
export const MagnifierArt = art(() => import("@/components/cursors/magnifier").then((file) => file.MagnifierArt));
export const MercuryFilter = art(() => import("@/components/cursors/mercury").then((file) => file.MercuryFilter));
export const PlaneArt = art(() => import("@/components/cursors/plane").then((file) => file.PlaneArt));
export const PumpkinArt = art(() => import("@/components/cursors/pumpkin").then((file) => file.PumpkinArt));
export const RocketArt = art(() => import("@/components/cursors/rocket").then((file) => file.RocketArt));
export const RuneArt = art(() => import("@/components/cursors/rune").then((file) => file.RuneArt));
export const RunesArt = art(() => import("@/components/cursors/rune").then((file) => file.RunesArt));
export const SaberArt = art(() => import("@/components/cursors/saber").then((file) => file.SaberArt));
export const SnowflakeArt = art(() => import("@/components/cursors/snow").then((file) => file.SnowflakeArt));
export const SparkleArt = art(() => import("@/components/cursors/sparkle").then((file) => file.SparkleArt));
export const SpiderArt = art(() => import("@/components/cursors/spider").then((file) => file.SpiderArt));
export const SplatArt = art(() => import("@/components/cursors/splat").then((file) => file.SplatArt));
export const StampMark = art(() => import("@/components/cursors/stamp").then((file) => file.StampMark));
export const SunArt = art(() => import("@/components/cursors/sun").then((file) => file.SunArt));
export const TopArt = art(() => import("@/components/cursors/top").then((file) => file.TopArt));
export const UfoArt = art(() => import("@/components/cursors/ufo").then((file) => file.UfoArt));
export const WandArt = art(() => import("@/components/cursors/wand").then((file) => file.WandArt));
export const YoyoArt = art(() => import("@/components/cursors/yoyo").then((file) => file.YoyoArt));
