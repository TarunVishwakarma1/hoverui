import type { Metadata } from "next";
import { Fragment_Mono, Host_Grotesk } from "next/font/google";
import { RegisterCursor } from "@/components/cursors/register";
import { cursorTone } from "./catalog";
import { Footer, SITE, SiteBar, siteOpenGraph } from "./ui";
import "./globals.css";

const host = Host_Grotesk({ variable: "--font-host", subsets: ["latin"] });
const fragment = Fragment_Mono({ variable: "--font-fragment", subsets: ["latin"], weight: "400" });

const title = "hover-ui: custom cursor components for React";
const description =
  "Copy-paste cursor components for React, installed with shadcn. Drop one in any element and it owns that element's cursor.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: title, template: "%s · hover-ui" },
  description,
  openGraph: { ...siteOpenGraph, title, description },
  twitter: { card: "summary_large_image" },
};

// Runs before first paint: a stored choice wins, otherwise the OS setting, which it keeps following live.
const themeScript = `(function(){var d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");function s(){var t;try{t=localStorage.getItem("theme")}catch(e){}d.setAttribute("data-theme",t==="dark"||t==="light"?t:m.matches?"dark":"light")}s();m.addEventListener("change",s)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The head script rewrites data-theme before hydration, so React is told to accept the DOM's value.
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${host.variable} ${fragment.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <SiteBar />
        {children}
        <Footer />
        {/* The site wears Register (05); every preview below hands off to its own cursor. */}
        <RegisterCursor className={cursorTone} />
      </body>
    </html>
  );
}
