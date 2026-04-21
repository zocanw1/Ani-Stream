import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" prefetch={false} className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center shadow-lg shadow-[#6c5ce7]/20 group-hover:shadow-[#6c5ce7]/40 transition-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight hidden md:block">
              <span className="gradient-text">Ani</span>
              <span className="text-white">Stream</span>
            </span>
          </Link>

          <SourceSwitcher />

          <div className="flex-1 flex justify-center max-w-md">
            <NavbarSearch />
          </div>

          <NavbarLinks />
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-400">
              AniStream &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs text-gray-500">
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
    <html lang="id" className="dark">
      <body className={`${inter.variable} antialiased bg-[#0b0d17] text-gray-100 min-h-screen flex flex-col`}>
        <SourceInitializer />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
