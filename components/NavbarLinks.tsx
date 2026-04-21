"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  if (isOtakudesu) {
    return (
      <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${className}`}>
        <Link 
          href="/otakudesu" 
          prefetch={false} 
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
            pathname === "/otakudesu" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Home
        </Link>
        <Link 
          href="/otakudesu/completed" 
          prefetch={false} 
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
            pathname === "/otakudesu/completed" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Completed
        </Link>
        <Link 
          href="/otakudesu/anime/unlimited" 
          prefetch={false} 
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
            pathname === "/otakudesu/anime/unlimited" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${className}`}>
      <Link 
        href="/" 
        prefetch={false} 
        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
          pathname === "/" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        Home
      </Link>
      <Link 
        href="/popular" 
        prefetch={false} 
        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
          pathname === "/popular" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        Populer
      </Link>
      <Link 
        href="/batch" 
        prefetch={false} 
        className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold rounded-lg transition-all ${
          pathname === "/batch" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        Batch
      </Link>
    </div>
  );
}
