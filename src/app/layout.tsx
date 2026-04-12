import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YieldNet — Cross-Chain Yield Net Value Calculator",
  description:
    "Calculate your real DeFi yield after gas, bridge fees, and slippage. Powered by LI.FI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})()`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html{font-family:var(--font-geist-sans),system-ui,sans-serif}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-8 text-center text-xs text-muted tracking-wide">
            <span className="font-mono">YieldNet</span> &mdash; DeFi Mullet Hackathon #1 &nbsp;|&nbsp; Powered by{" "}
            <a
              href="https://li.fi"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LI.FI
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
