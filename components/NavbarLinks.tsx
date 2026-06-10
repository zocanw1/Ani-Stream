"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavbarLinks({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");
  const linkClass = (active: boolean) =>
    `px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-black rounded-xl transition-all border-[2px] ${
      active ? "text-[#1E1B29] bg-[#FDCB6E] border-[#1E1B29] shadow-[3px_3px_0_#1E1B29]" : "text-[#1E1B29] border-transparent hover:bg-white"
    }`;

  if (isOtakudesu) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${className}`}>
        <Link 
          href="/otakudesu" 
          prefetch={false} 
          className={linkClass(pathname === "/otakudesu")}
        >
          Home
        </Link>
        <Link 
          href="/otakudesu/completed" 
          prefetch={false} 
          className={linkClass(pathname === "/otakudesu/completed")}
        >
          Completed
        </Link>
        <Link 
          href="/otakudesu/anime/unlimited" 
          prefetch={false} 
          className={linkClass(pathname === "/otakudesu/anime/unlimited")}
        >
          Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${className}`}>
      <Link 
        href="/" 
        prefetch={false} 
        className={linkClass(pathname === "/")}
      >
        Home
      </Link>
      <Link 
        href="/popular" 
        prefetch={false} 
        className={linkClass(pathname === "/popular")}
      >
        Populer
      </Link>
      <Link 
        href="/batch" 
        prefetch={false} 
        className={linkClass(pathname === "/batch")}
      >
        Batch
      </Link>
    </div>
  );
}
