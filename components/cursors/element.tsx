"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The periodic table, symbol then name; an element's atomic number is its place in the list. */
const TABLE = (
  "H Hydrogen He Helium Li Lithium Be Beryllium B Boron C Carbon N Nitrogen O Oxygen F Fluorine Ne Neon " +
  "Na Sodium Mg Magnesium Al Aluminium Si Silicon P Phosphorus S Sulfur Cl Chlorine Ar Argon K Potassium Ca Calcium " +
  "Sc Scandium Ti Titanium V Vanadium Cr Chromium Mn Manganese Fe Iron Co Cobalt Ni Nickel Cu Copper Zn Zinc " +
  "Ga Gallium Ge Germanium As Arsenic Se Selenium Br Bromine Kr Krypton Rb Rubidium Sr Strontium Y Yttrium Zr Zirconium " +
  "Nb Niobium Mo Molybdenum Tc Technetium Ru Ruthenium Rh Rhodium Pd Palladium Ag Silver Cd Cadmium In Indium Sn Tin " +
  "Sb Antimony Te Tellurium I Iodine Xe Xenon Cs Caesium Ba Barium La Lanthanum Ce Cerium Pr Praseodymium Nd Neodymium " +
  "Pm Promethium Sm Samarium Eu Europium Gd Gadolinium Tb Terbium Dy Dysprosium Ho Holmium Er Erbium Tm Thulium Yb Ytterbium " +
  "Lu Lutetium Hf Hafnium Ta Tantalum W Tungsten Re Rhenium Os Osmium Ir Iridium Pt Platinum Au Gold Hg Mercury " +
  "Tl Thallium Pb Lead Bi Bismuth Po Polonium At Astatine Rn Radon Fr Francium Ra Radium Ac Actinium Th Thorium " +
  "Pa Protactinium U Uranium Np Neptunium Pu Plutonium Am Americium Cm Curium Bk Berkelium Cf Californium Es Einsteinium Fm Fermium " +
  "Md Mendelevium No Nobelium Lr Lawrencium Rf Rutherfordium Db Dubnium Sg Seaborgium Bh Bohrium Hs Hassium Mt Meitnerium Ds Darmstadtium " +
  "Rg Roentgenium Cn Copernicium Nh Nihonium Fl Flerovium Mc Moscovium Lv Livermorium Ts Tennessine Og Oganesson"
).split(" ");
const ELEMENTS = new Map(Array.from({ length: TABLE.length / 2 }, (_, i) => [TABLE[i * 2].toLowerCase(), { number: i + 1, symbol: TABLE[i * 2], name: TABLE[i * 2 + 1] }]));

const WORDS = 3;

/** The colors some elements burn in a flame test; the rest get a hue of their own from their number. */
const FLAME: Record<string, string> = { Li: "#ff2a4d", B: "#3dff7a", Na: "#ffb000", K: "#c38cff", Ca: "#ff6a2a", Cu: "#20d0b8", Rb: "#e0427a", Sr: "#ff1f3d", In: "#5a6bff", Cs: "#8a7dff", Ba: "#9cff4d" };
const flame = (e: { symbol: string; number: number }) => FLAME[e.symbol] ?? `hsl(${(e.number * 47) % 360} 90% 60%)`;

/** A word spelled the way a title card does it: the first element symbol found in them, two letters before one, and the letters either side. */
function spell(words: string) {
  const lower = words.toLowerCase();
  for (let i = 0; i < lower.length; i++)
    for (const n of [2, 1]) {
      const element = ELEMENTS.get(lower.slice(i, i + n));
      if (element) return { before: words.slice(0, i), element, after: words.slice(i + n) };
    }
  return null;
}

/** What a control calls itself: its data-cursor-label, aria-label or title, else its text, as its first few words. */
function name(el: Element) {
  const words = (el.getAttribute("data-cursor-label") || el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().split(/\s+/).filter(Boolean);
  return words.length > WORDS ? [...words.slice(0, WORDS - 1), `${words[WORDS - 1]}…`] : words;
}

/** A tile from the periodic table; exported so a page can draw one at rest. */
export function ElementArt({ number = 67, symbol = "Ho", name = "Holmium", className = "" }: { number?: number; symbol?: string; name?: string; className?: string }) {
  return (
    <span className={`relative flex size-8 shrink-0 flex-col items-center justify-center rounded-[3px] border border-[#8fd19e]/60 bg-linear-to-br from-[#4a9b5c] to-[#1f5d32] text-white ${className}`}>
      <span data-number className="absolute top-[2px] left-[3px] text-[7px] leading-none">
        {number}
      </span>
      <span data-symbol className="text-[15px] leading-none font-semibold">
        {symbol}
      </span>
      <span data-name className="absolute bottom-[2px] text-[5px] leading-none">
        {name}
      </span>
    </span>
  );
}

/**
 * A periodic-table tile beside the pointer, electrons circling it faster as you move: Holmium, Ho, as in hover. Over
 * anything clickable it spells the control's name title-card style, a tile for an element in each word. Hold to excite
 * the atom; let go, and it gives off a photon in the element's own flame color.
 */
export function ElementCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, hover: null as Element | null, orbit: 0, flip: 0, excite: 0, flash: 0, color: flame(ELEMENTS.get("ho")!), photon: { a: 0, x: 0, y: 0, age: Infinity } });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [card, photon, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const groups = [...card.children] as HTMLElement[];
    if (p.hover !== st.hover) {
      st.hover = p.hover;
      const words = p.hover ? name(p.hover) : [];
      groups.forEach((group, i) => {
        const [before, tile, after] = group.children as HTMLCollectionOf<HTMLElement>;
        const word = words[i];
        const spelled = word ? spell(word) : null;
        // At rest the first tile is Holmium on its own; a word with no element in it is spelled plain.
        const element = spelled?.element ?? (i === 0 && !words.length ? ELEMENTS.get("ho")! : null);
        group.style.display = i === 0 || word ? "" : "none";
        before.textContent = spelled ? spelled.before : (word ?? "");
        after.textContent = spelled?.after ?? "";
        tile.style.display = element ? "" : "none";
        if (element) {
          tile.querySelector("[data-number]")!.textContent = String(element.number);
          tile.querySelector("[data-symbol]")!.textContent = element.symbol;
          tile.querySelector("[data-name]")!.textContent = element.name;
          if (i === 0) st.color = flame(element);
        }
      });
      card.toggleAttribute("data-open", words.length > 0);
      if (!p.reduced) st.flip = 90;
    }
    // Hold to pump the atom up; let go and it falls back, giving off its photon.
    const before = st.excite;
    st.excite += ((p.down ? 1 : 0) - st.excite) * p.ease(p.down ? 3 : 12);
    if (!p.down && before > 0.35 && st.photon.age > 0.5 && !p.reduced) {
      const r = groups[0].children[1].getBoundingClientRect();
      st.photon = { a: -Math.PI / 2 + (Math.random() - 0.5) * 2.4, x: r.left + r.width / 2, y: r.top + r.height / 2, age: 0 };
      st.flash = 1;
    }
    const speed = p.dt ? Math.hypot(p.x - st.x, p.y - st.y) / p.dt : 0;
    st.x += (p.x - st.x) * p.ease(20);
    st.y += (p.y - st.y) * p.ease(20);
    st.flip += (0 - st.flip) * p.ease(10);
    st.flash = Math.max(st.flash - p.dt * 3, 0);
    if (!p.reduced) st.orbit += p.dt * (3 + Math.min(speed * 0.01, 6) + st.excite * 10);

    card.style.transform = `translate(${st.x + 14}px, ${st.y + 14}px) scale(${p.down ? 0.96 : 1})`;
    groups.forEach((group) => ((group.children[1] as HTMLElement).style.transform = st.flip > 0.5 ? `perspective(160px) rotateX(${st.flip}deg)` : ""));
    // The first tile's atom: electrons on a tilted orbit, flung wider and faster when excited, dimmer on the far side.
    const tile = groups[0].children[1] as HTMLElement;
    const [ring, ...electrons] = tile.querySelector("[data-atom]")!.children as HTMLCollectionOf<HTMLElement>;
    const radius = 22 + st.excite * 7;
    ring.style.width = `${radius * 2}px`;
    ring.style.height = `${radius * 0.7}px`;
    electrons.forEach((e, k) => {
      const a = st.orbit + k * Math.PI;
      const [ox, oy] = [Math.cos(a) * radius, Math.sin(a) * radius * 0.35];
      const tilt = -0.45;
      e.style.transform = `translate(${ox * Math.cos(tilt) - oy * Math.sin(tilt)}px, ${ox * Math.sin(tilt) + oy * Math.cos(tilt)}px)`;
      e.style.opacity = Math.sin(a) < 0 ? "0.35" : "1";
    });
    const glow = Math.max(st.excite, st.flash);
    tile.firstElementChild!.setAttribute("style", glow > 0.01 ? `box-shadow: 0 0 ${glow * 16}px ${st.color}, inset 0 0 0 40px color-mix(in srgb, ${st.color} ${st.flash * 70}%, transparent)` : "");

    // The photon streaks off in the flame color and fades.
    st.photon.age += p.dt;
    const k = Math.min(st.photon.age / 0.5, 1);
    photon.style.transform = `translate(${st.photon.x + Math.cos(st.photon.a) * k * 150}px, ${st.photon.y + Math.sin(st.photon.a) * k * 150}px) rotate(${st.photon.a}rad)`;
    photon.style.opacity = String(k < 1 ? 1 - k : 0);
    photon.style.background = `linear-gradient(to right, transparent, ${st.color})`;
    photon.style.boxShadow = `0 0 8px ${st.color}`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // The words sit on currentColor in black or white, whichever reads; the tiles keep their own green.
  const words = "text-sm leading-none font-medium whitespace-nowrap text-white empty:hidden";
  const contrast = { color: "oklch(from currentColor calc((0.7 - l) * 1000) 0 0)" };
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0 flex origin-top-left items-center gap-2 rounded-md data-open:bg-current data-open:p-1 data-open:pr-2">
        {Array.from({ length: WORDS }, (_, i) => (
          <span key={i} className="flex items-center gap-0.5" style={i ? { display: "none" } : undefined}>
            <span className={`${words} first:pl-1`} style={contrast} />
            <span className="relative">
              <ElementArt />
              {i === 0 && (
                <span data-atom className="absolute top-1/2 left-1/2">
                  <span className="absolute -translate-1/2 -rotate-[26deg] rounded-[50%] border border-[#7dffb0]/50" />
                  {[0, 1].map((k) => (
                    <span key={k} className="absolute size-1.5 -translate-1/2 rounded-full bg-[#7dffb0] shadow-[0_0_4px_#7dffb0]" />
                  ))}
                </span>
              )}
            </span>
            <span className={words} style={contrast} />
          </span>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-[3px] w-10 origin-left -translate-y-1/2 rounded-full opacity-0" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
