"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

/*
 * Google Analytics, only with a visitor's OK, asked the way the Mixer asks and counted under the Mixer's ID, so a visit
 * that goes on from here into the Mixer is one visit. Set NEXT_PUBLIC_GA_ID (G-…) and a small bar asks once: Allow
 * loads Analytics on every page from then on; No thanks loads nothing. Without the ID there's no bar and nothing loads.
 * The answer is a cookie on hoverui.fun that the Mixer reads too, so one answer covers both. "Cookie choices" in the
 * footer asks again, and taking an OK back turns Analytics off and clears its cookies.
 */

const ID = /^G-[A-Z0-9]{4,20}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID! : "";
const KEY = "consent_analytics";
const CHANGED = "hoverui:consent";
type Choice = "granted" | "denied" | "";

// Cookies blocked: there's nowhere to keep an answer, so ask nothing and load nothing.
const read = (): Choice => (navigator.cookieEnabled ? ((document.cookie.match(/(?:^|; )consent_analytics=(granted|denied)/)?.[1] ?? "") as Choice) : "denied");
const subscribe = (changed: () => void) => {
  window.addEventListener(CHANGED, changed);
  return () => window.removeEventListener(CHANGED, changed);
};

/** Records a visitor's choice, here and in the Mixer; "" asks again. Taking an OK back switches Analytics off and clears its cookies. */
export function choose(choice: Choice) {
  // For hoverui.fun and every site under it; anywhere else (a preview, localhost), for that site alone.
  const site = location.hostname.endsWith("hoverui.fun") ? "; domain=hoverui.fun" : "";
  document.cookie = `${KEY}=${choice}; path=/; max-age=${choice ? 31536000 : 0}; samesite=lax${site}${location.protocol === "https:" ? "; secure" : ""}`;
  if (choice !== "granted" && ID) {
    (window as unknown as Record<string, boolean>)[`ga-disable-${ID}`] = true;
    for (const cookie of document.cookie.split(";").map((c) => c.split("=")[0].trim()))
      if (cookie.startsWith("_ga")) for (const domain of ["", `; domain=.${location.hostname.split(".").slice(-2).join(".")}`]) document.cookie = `${cookie}=; max-age=0; path=/${domain}`;
  }
  window.dispatchEvent(new Event(CHANGED));
}

/** Analytics once allowed, the bar while undecided, nothing otherwise. In the root layout. */
export function Analytics() {
  // On the server, and in the first render, undecided-but-silent: the bar only shows once the browser has said.
  const choice = useSyncExternalStore(subscribe, read, () => "denied" as Choice);
  if (!ID) return null;
  if (choice === "granted")
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} strategy="afterInteractive" />
        <Script id="analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ID}');`}</Script>
      </>
    );
  if (choice === "denied") return null;
  return (
    <div role="region" aria-label="Cookies" className="fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-3 border border-ink bg-paper p-4 text-[13px] leading-5 sm:right-auto sm:left-6 sm:max-w-sm">
      <p>
        May we count your visit? With your OK, Google Analytics sets cookies to see how people find and use hover-ui and its Mixer; one answer covers both. Nothing else
        is tracked, and none of it is for ads.{" "}
        <a href="https://mixer.hoverui.fun/privacy" className="underline underline-offset-4">
          Privacy
        </a>
      </p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => choose("granted")} className="btn-primary px-3! py-1! text-[13px]!">
          Allow
        </button>
        <button type="button" onClick={() => choose("denied")} className="text-ink-soft hover:text-ink">
          No thanks
        </button>
      </div>
    </div>
  );
}

/** "Cookie choices", for the footer: asks again. Only when there's Analytics to ask about. */
export function CookieChoices({ className = "" }: { className?: string }) {
  if (!ID) return null;
  return (
    <button type="button" onClick={() => choose("")} className={className}>
      Cookie choices
    </button>
  );
}
