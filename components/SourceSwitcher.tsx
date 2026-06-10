"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SourceSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  return (
    <div className={`flex rounded-md border border-white/10 bg-white/10 p-1 backdrop-blur ${className}`}>
      <Link
        href="/"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${
          !isOtakudesu
            ? "bg-white text-black"
            : "text-neutral-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        Samehadaku
      </Link>
      <Link
        href="/otakudesu"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${
          isOtakudesu
            ? "bg-[#E50914] text-white"
            : "text-neutral-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        Otakudesu
      </Link>
    </div>
  );
}
