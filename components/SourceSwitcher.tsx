"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SourceSwitcher() {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  return (
    <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 ml-4 hidden sm:flex">
      <Link
        href="/"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
          !isOtakudesu
            ? "bg-[#6c5ce7] text-white shadow-lg shadow-[#6c5ce7]/20"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        Samehadaku
      </Link>
      <Link
        href="/otakudesu"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
          isOtakudesu
            ? "bg-[#ff7675] text-white shadow-lg shadow-[#ff7675]/20"
            : "text-gray-500 hover:text-gray-300"
        }`}
      >
        Otakudesu
      </Link>
    </div>
  );
}
