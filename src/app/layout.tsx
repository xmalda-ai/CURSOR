import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dotazník k výdeji pracovních oděvů",
  description: "Krátký anonymní dotazník k výdeji pracovních oděvů.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e332b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        {children}
        <noscript>
          <p className="noscript">Dotazník potřebuje zapnutý JavaScript v prohlížeči.</p>
        </noscript>
      </body>
    </html>
  );
}
