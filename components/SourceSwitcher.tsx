"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SourceSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isOtakudesu = pathname.startsWith("/otakudesu");

  return (
    <div className={`source-switcher ${className}`} aria-label="Pilih sumber anime">
      <span className="source-switcher__label">Sumber</span>
      <Link href="/" prefetch={false} aria-current={!isOtakudesu ? "true" : undefined}>
        Samehadaku
      </Link>
      <Link href="/otakudesu" prefetch={false} aria-current={isOtakudesu ? "true" : undefined}>
        Otakudesu
      </Link>
    </div>
  );
}
