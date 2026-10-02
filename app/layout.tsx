import type { Metadata } from "next";
import { Fragment_Mono, Host_Grotesk } from "next/font/google";
import { RegisterCursor } from "@/components/cursors/register";
import { cursorTone } from "./plates";
import { Footer, SiteBar } from "./ui";
import "./globals.css";

const host = Host_Grotesk({ variable: "--font-host", subsets: ["latin"] });
const fragment = Fragment_Mono({ variable: "--font-fragment", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hoverui.fun"),
  title: { default: "hover-ui: cursors for React", template: "%s · hover-ui" },
  description: "Copy-paste cursor components for React, installed with shadcn. Drop one in any element and it owns that element's cursor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${host.variable} ${fragment.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <SiteBar />
        {children}
        <Footer />
        {/* The site wears plate 05; every plate below hands off to its own cursor. */}
        <RegisterCursor className={cursorTone} />
      </body>
    </html>
  );
}
