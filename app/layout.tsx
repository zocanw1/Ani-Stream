import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AniStream — Nonton Anime Sub Indo",
  description: "Platform streaming anime subtitle Indonesia terlengkap. Nonton anime favoritmu dengan kualitas terbaik.",
  keywords: ["anime", "streaming", "nonton anime", "subtitle indonesia", "sub indo"],
};

import NavbarSearch from "@/components/NavbarSearch";
import SourceSwitcher from "@/components/SourceSwitcher";
import NavbarLinks from "@/components/NavbarLinks";
import SourceInitializer from "@/components/SourceInitializer";
import AuthMenu from "@/components/AuthMenu";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b-[3px] border-[#1E1B29] bg-[#FAF9FF]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          <Link href="/" prefetch={false} className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF7675] border-[3px] border-[#1E1B29] shadow-[4px_4px_0_#1E1B29] flex items-center justify-center transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-display text-xl font-black tracking-tight hidden md:block">
              <span className="gradient-text">Ani</span>
              <span className="text-[#1E1B29]">Stream</span>
            </span>
          </Link>

          <SourceSwitcher className="hidden lg:flex" />

          <div className="flex-1 flex justify-center max-w-md">
            <NavbarSearch />
          </div>

          <AuthMenu className="md:hidden" />
          <NavbarLinks className="hidden md:flex" />
          <AuthMenu className="hidden md:block" />
        </div>
      </div>
      
      {/* Mobile Sub-Navbar */}
      <div className="md:hidden border-t-[3px] border-[#1E1B29] bg-[#FAF9FF]/95">
        <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-center gap-2">
          <SourceSwitcher className="lg:hidden" />
          <NavbarLinks className="md:hidden w-full" />
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t-[3px] border-[#1E1B29] mt-20 bg-[#6C5CE7] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FDCB6E] border-[3px] border-[#1E1B29] shadow-[4px_4px_0_#1E1B29] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-sm font-black text-white">
              AniStream &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs font-extrabold text-white">
            Powered by Sanka Vollerei API. Dibuat untuk tujuan edukasi.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${fredoka.variable} ${nunito.variable} antialiased min-h-screen flex flex-col`}>
        <SourceInitializer />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
