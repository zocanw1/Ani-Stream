"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SourceSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  return (
    <div className={`flex bg-white rounded-xl p-1 border-[3px] border-[#1E1B29] shadow-[4px_4px_0_#1E1B29] ${className}`}>
      <Link
        href="/"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
          !isOtakudesu
            ? "bg-[#00CEC9] text-[#1E1B29] shadow-[3px_3px_0_#1E1B29]"
            : "text-[#1E1B29] hover:bg-[#FAF9FF]"
        }`}
      >
        Samehadaku
      </Link>
      <Link
        href="/otakudesu"
        prefetch={false}
        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
          isOtakudesu
            ? "bg-[#FF7675] text-white shadow-[3px_3px_0_#1E1B29]"
            : "text-[#1E1B29] hover:bg-[#FAF9FF]"
        }`}
      >
        Otakudesu
      </Link>
    </div>
  );
}
