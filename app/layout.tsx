import type { Metadata } from "next";
import { Geist, Nunito } from "next/font/google";
import Link from "next/link";
import { Play } from "lucide-react";
import "./globals.css";

import AuthMenu from "@/components/AuthMenu";
import MobileDock from "@/components/MobileDock";
import NavbarLinks from "@/components/NavbarLinks";
import NavbarSearch from "@/components/NavbarSearch";
import SourceInitializer from "@/components/SourceInitializer";
import SourceSwitcher from "@/components/SourceSwitcher";

const geist = Geist({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AniStream - Nonton Anime Sub Indo",
  description: "Platform streaming anime subtitle Indonesia dengan jadwal rilis, pencarian, dan riwayat tontonan.",
  keywords: ["anime", "streaming", "nonton anime", "subtitle indonesia", "sub indo"],
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" prefetch={false} className="brand-link" aria-label="AniStream beranda">
      <span className="brand-mark" aria-hidden="true"><Play size={17} fill="currentColor" /></span>
      {!compact && (
        <span className="brand-wordmark"><span>ANI</span>STREAM</span>
      )}
    </Link>
  );
}

function Navbar() {
  return (
    <header className="site-header">
      <nav className="site-header__inner" aria-label="Navigasi utama">
        <Brand />
        <SourceSwitcher className="hidden xl:flex" />
        <NavbarLinks className="hidden md:flex" />
        <div className="site-header__search"><NavbarSearch /></div>
        <AuthMenu />
      </nav>
      <div className="site-header__mobile-source md:hidden">
        <SourceSwitcher />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Brand compact />
        <p>Powered by Sanka Vollerei API. Dibuat untuk tujuan edukasi.</p>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${geist.variable} ${nunito.variable} min-h-screen bg-[var(--bg-deep)] antialiased`}>
        <a href="#main-content" className="skip-link">Lewati ke konten</a>
        <SourceInitializer />
        <Navbar />
        <main id="main-content" className="min-h-[70vh]">{children}</main>
        <Footer />
        <MobileDock />
      </body>
    </html>
  );
}
